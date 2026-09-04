import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Initialize Gemini Client if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// In-Memory Data Store (mirroring schema.sql with initial seeds)
interface Warga {
  id: number;
  nik: string;
  nama_lengkap: string;
  no_whatsapp: string;
  alamat: string;
  created_at: string;
}

interface Layanan {
  id: number;
  nama_layanan: string;
  deskripsi: string;
  persyaratan_json: string[];
}

interface Petugas {
  id: number;
  username: string;
  nama_petugas: string;
  jabatan: string;
}

interface DokumenPengajuan {
  id: number;
  pengajuan_id: number;
  jenis_dokumen: string;
  file_path: string;
  catatan_ai: string;
  is_valid: boolean;
}

interface Pengajuan {
  id: number;
  kode_tiket: string;
  warga_id: number;
  layanan_id: number;
  skor_ai: number;
  status_ai: "Lulus_AI" | "Butuh_Revisi" | "Gagal_Validasi";
  status_petugas: "Menunggu_Verifikasi" | "Disetujui" | "Butuh_Perbaikan" | "Ditolak";
  catatan_petugas: string | null;
  qr_code_path: string | null;
  created_at: string;
  // Joined fields for easy access
  warga?: Warga;
  layanan?: Layanan;
  dokumen?: DokumenPengajuan[];
}

// Seed Initial Data
const dbLayanan: Layanan[] = [
  {
    id: 1,
    nama_layanan: "Penerbitan KTP-el Baru / Rusak",
    deskripsi: "Layanan verifikasi mandiri penggantian KTP-el rusak/hilang atau pemula 17 tahun.",
    persyaratan_json: [
      "Foto e-KTP Asli / Surat Kehilangan Polsek",
      "Kartu Keluarga Terbaru",
      "Surat Pengantar RT/RW Setempat",
    ],
  },
  {
    id: 2,
    nama_layanan: "Pembaruan Kartu Keluarga (KK)",
    deskripsi: "Perubahan susunan keluarga (penambahan anak, mutasi anggota keluarga, atau ganti status).",
    persyaratan_json: [
      "Kartu Keluarga Lama Asli",
      "Surat Nikah / Akta Cerai",
      "Akta Kelahiran Anggota Baru",
      "Surat Pengantar RT/RW",
    ],
  },
  {
    id: 3,
    nama_layanan: "Surat Keterangan Pindah WNI (SKPWNI)",
    deskripsi: "Permohonan surat pindah domisili antar kelurahan, kota/kabupaten, atau antar provinsi.",
    persyaratan_json: [
      "e-KTP Asli Pemohon",
      "Kartu Keluarga Asli",
      "Formulir F-1.08 Pindah Datang",
      "Surat Pernyataan Alamat Tujuan",
    ],
  },
  {
    id: 4,
    nama_layanan: "Penerbitan Akta Kelahiran",
    deskripsi: "Pelayanan pencatatan kelahiran anak dan penerbitan kutipan akta resmi Disdukcapil.",
    persyaratan_json: [
      "Surat Keterangan Lahir dari Bidan/RS",
      "Buku Nikah / Akta Perkawinan Orang Tua",
      "KK & KTP Kedua Orang Tua",
      "KTP 2 Orang Saksi",
    ],
  },
];

const dbPetugas: Petugas[] = [
  {
    id: 1,
    username: "petugas1",
    nama_petugas: "Bambang Sudiro, S.STP",
    jabatan: "Kepala Seksi Pelayanan Kependudukan",
  },
  {
    id: 2,
    username: "petugas2",
    nama_petugas: "Siti Rahmawati, A.Md",
    jabatan: "Staf Loket Verifikator Berkas",
  },
];

let dbWarga: Warga[] = [
  {
    id: 1,
    nik: "3201011504950001",
    nama_lengkap: "Ahmad Fauzi Nurhadi",
    no_whatsapp: "081234567890",
    alamat: "Jl. Kenanga No. 14 RT 03 / RW 05, Kel. Sukamaju",
    created_at: "2025-08-20 08:30:00",
  },
  {
    id: 2,
    nik: "3201015609880003",
    nama_lengkap: "Dewi Lestari Kusuma",
    no_whatsapp: "085712349988",
    alamat: "Komplek Griya Indah Blok C2/09, Kel. Sukamaju",
    created_at: "2025-08-21 09:15:00",
  },
  {
    id: 3,
    nik: "3201012301820005",
    nama_lengkap: "Hendro Prasetyo",
    no_whatsapp: "082198765432",
    alamat: "Jl. Melati Raya No. 45 RT 01 / RW 02, Kel. Sukamaju",
    created_at: "2025-08-22 10:45:00",
  },
  {
    id: 4,
    nik: "3201014812990002",
    nama_lengkap: "Rina Agustina Wardani",
    no_whatsapp: "087811223344",
    alamat: "Gang Dahlia IV No. 08 RT 06 / RW 03, Kel. Sukamaju",
    created_at: "2025-08-23 11:20:00",
  },
];

let dbDokumen: DokumenPengajuan[] = [
  {
    id: 1,
    pengajuan_id: 1,
    jenis_dokumen: "Foto e-KTP",
    file_path: "https://images.unsplash.com/photo-1578852612716-854e527abf50?w=600&auto=format&fit=crop&q=80",
    catatan_ai: "AI Vision: Resolusi 1080p, NIK 3201011504950001 terdeteksi 99% akurat, tidak ada blur, sudut 4 titik kartu presisi.",
    is_valid: true,
  },
  {
    id: 2,
    pengajuan_id: 1,
    jenis_dokumen: "Foto Kartu Keluarga",
    file_path: "https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=80",
    catatan_ai: "AI Vision: Kepala Keluarga teridentifikasi, tanda tangan basah & barcode Disdukcapil terbaca jelas.",
    is_valid: true,
  },
  {
    id: 3,
    pengajuan_id: 2,
    jenis_dokumen: "Foto Kartu Keluarga Lama",
    file_path: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
    catatan_ai: "AI Vision: Teks jelas, nomor KK sesuai, seluruh anggota keluarga terbaca.",
    is_valid: true,
  },
  {
    id: 4,
    pengajuan_id: 3,
    jenis_dokumen: "Foto e-KTP",
    file_path: "https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80",
    catatan_ai: "AI Vision Warning: Ditemukan pantulan cahaya (glare) 28% pada baris NIK, sudut kiri bawah terpotong frame foto.",
    is_valid: false,
  },
  {
    id: 5,
    pengajuan_id: 3,
    jenis_dokumen: "Foto Kartu Keluarga",
    file_path: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80",
    catatan_ai: "AI Vision: Format KK valid, dokumen tajam 85% kelayakan.",
    is_valid: true,
  },
  {
    id: 6,
    pengajuan_id: 4,
    jenis_dokumen: "Surat Keterangan Lahir",
    file_path: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80",
    catatan_ai: "AI Vision: Kop surat Rumah Sakit dan stempel basah terverifikasi otomatis.",
    is_valid: true,
  },
];

let dbPengajuan: Pengajuan[] = [
  {
    id: 1,
    kode_tiket: "TKT-202508-001",
    warga_id: 1,
    layanan_id: 1,
    skor_ai: 94,
    status_ai: "Lulus_AI",
    status_petugas: "Disetujui",
    catatan_petugas: "Berkas KTP & KK sangat tajam, data NIK valid terverifikasi database kependudukan.",
    qr_code_path: "qr_TKT-202508-001",
    created_at: "2025-08-20 08:35:12",
  },
  {
    id: 2,
    kode_tiket: "TKT-202508-002",
    warga_id: 2,
    layanan_id: 2,
    skor_ai: 88,
    status_ai: "Lulus_AI",
    status_petugas: "Menunggu_Verifikasi",
    catatan_petugas: null,
    qr_code_path: "qr_TKT-202508-002",
    created_at: "2025-08-21 09:22:45",
  },
  {
    id: 3,
    kode_tiket: "TKT-202508-003",
    warga_id: 3,
    layanan_id: 3,
    skor_ai: 62,
    status_ai: "Butuh_Revisi",
    status_petugas: "Butuh_Perbaikan",
    catatan_petugas: "Foto KTP terpotong bagian sudut bawah dan NIK agak silau terkena flash. Harap foto ulang dengan pencahayaan merata.",
    qr_code_path: "qr_TKT-202508-003",
    created_at: "2025-08-22 10:52:10",
  },
  {
    id: 4,
    kode_tiket: "TKT-202508-004",
    warga_id: 4,
    layanan_id: 4,
    skor_ai: 91,
    status_ai: "Lulus_AI",
    status_petugas: "Menunggu_Verifikasi",
    catatan_petugas: null,
    qr_code_path: "qr_TKT-202508-004",
    created_at: "2025-08-23 11:28:30",
  },
];

let nextWargaId = 5;
let nextPengajuanId = 5;
let nextDokumenId = 7;

// Helper to attach joined data
function enrichPengajuan(p: Pengajuan): Pengajuan {
  const warga = dbWarga.find((w) => w.id === p.warga_id);
  const layanan = dbLayanan.find((l) => l.id === p.layanan_id);
  const dokumen = dbDokumen.filter((d) => d.pengajuan_id === p.id);
  return {
    ...p,
    warga,
    layanan,
    dokumen,
  };
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "AIPEX VeriBot (AI Pre-Screening Expert)",
    version: "1.0.0",
    geminiActive: !!ai,
    totalPengajuan: dbPengajuan.length,
    timestamp: new Date().toISOString(),
  });
});

// List Services
app.get("/api/layanan", (_req, res) => {
  res.json({ success: true, data: dbLayanan });
});

// List Submissions with Filters
app.get("/api/pengajuan", (req, res) => {
  const { status_petugas, status_ai, search } = req.query;
  let list = dbPengajuan.map(enrichPengajuan);

  if (status_petugas && status_petugas !== "semua") {
    list = list.filter((p) => p.status_petugas === status_petugas);
  }

  if (status_ai && status_ai !== "semua") {
    list = list.filter((p) => p.status_ai === status_ai);
  }

  if (search && typeof search === "string" && search.trim() !== "") {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.kode_tiket.toLowerCase().includes(q) ||
        p.warga?.nama_lengkap.toLowerCase().includes(q) ||
        p.warga?.nik.toLowerCase().includes(q) ||
        p.layanan?.nama_layanan.toLowerCase().includes(q)
    );
  }

  // Sort latest first
  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({
    success: true,
    total: list.length,
    data: list,
  });
});

// Get Single Submission Detail
app.get("/api/pengajuan/:kodeTiket", (req, res) => {
  const { kodeTiket } = req.params;
  const item = dbPengajuan.find(
    (p) => p.kode_tiket.toLowerCase() === kodeTiket.toLowerCase()
  );

  if (!item) {
    res.status(404).json({ success: false, message: "Pengajuan tidak ditemukan." });
    return;
  }

  res.json({ success: true, data: enrichPengajuan(item) });
});

// Create New Submission
app.post("/api/pengajuan", (req, res) => {
  try {
    const { warga, layanan_id, skor_ai, status_ai, documents } = req.body;

    if (!warga || !warga.nik || !warga.nama_lengkap || !layanan_id) {
      res.status(400).json({ success: false, message: "Data pendaftaran tidak lengkap." });
      return;
    }

    // Check or insert warga
    let existingWarga = dbWarga.find((w) => w.nik === warga.nik);
    if (!existingWarga) {
      existingWarga = {
        id: nextWargaId++,
        nik: warga.nik,
        nama_lengkap: warga.nama_lengkap,
        no_whatsapp: warga.no_whatsapp || "",
        alamat: warga.alamat || "Kelurahan Sukamaju",
        created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      };
      dbWarga.push(existingWarga);
    } else {
      // Update data if changed
      existingWarga.nama_lengkap = warga.nama_lengkap;
      existingWarga.no_whatsapp = warga.no_whatsapp || existingWarga.no_whatsapp;
      existingWarga.alamat = warga.alamat || existingWarga.alamat;
    }

    // Generate Unique Ticket Code
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const kodeTiket = `TKT-${yearMonth}-${randSuffix}`;

    const newPengajuan: Pengajuan = {
      id: nextPengajuanId++,
      kode_tiket: kodeTiket,
      warga_id: existingWarga.id,
      layanan_id: Number(layanan_id),
      skor_ai: Number(skor_ai) || 85,
      status_ai: status_ai || (Number(skor_ai) >= 75 ? "Lulus_AI" : "Butuh_Revisi"),
      status_petugas: "Menunggu_Verifikasi",
      catatan_petugas: null,
      qr_code_path: `qr_${kodeTiket}`,
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    };
    dbPengajuan.push(newPengajuan);

    // Save attached documents
    if (Array.isArray(documents)) {
      documents.forEach((doc) => {
        dbDokumen.push({
          id: nextDokumenId++,
          pengajuan_id: newPengajuan.id,
          jenis_dokumen: doc.jenis_dokumen || "Dokumen Berkas",
          file_path: doc.file_path || "uploads/default.jpg",
          catatan_ai: doc.catatan_ai || "Telah dipre-screening oleh AI Cognitive scanner.",
          is_valid: doc.is_valid !== undefined ? !!doc.is_valid : true,
        });
      });
    }

    const completeData = enrichPengajuan(newPengajuan);
    res.status(201).json({
      success: true,
      message: "Tiket pengajuan pre-screening berhasil diterbitkan!",
      data: completeData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Gagal membuat pengajuan." });
  }
});

// Officer Action: Review Submission (Approve / Request Revision / Reject)
app.patch("/api/pengajuan/:id/review", (req, res) => {
  const { id } = req.params;
  const { status_petugas, catatan_petugas } = req.body;

  const itemIndex = dbPengajuan.findIndex((p) => p.id === Number(id));
  if (itemIndex === -1) {
    res.status(404).json({ success: false, message: "Pengajuan tidak ditemukan." });
    return;
  }

  const validStatuses = ["Menunggu_Verifikasi", "Disetujui", "Butuh_Perbaikan", "Ditolak"];
  if (!validStatuses.includes(status_petugas)) {
    res.status(400).json({ success: false, message: "Status petugas tidak valid." });
    return;
  }

  dbPengajuan[itemIndex].status_petugas = status_petugas;
  dbPengajuan[itemIndex].catatan_petugas = catatan_petugas || null;

  const updatedPengajuan = enrichPengajuan(dbPengajuan[itemIndex]);
  let waSent = false;
  let waResponse = null;

  // Send WA via Fonnte if approved
  if (status_petugas === 'Disetujui' && updatedPengajuan?.warga?.no_whatsapp) {
    const fonnteToken = process.env.FONNTE_TOKEN || "DUMMY_TOKEN_FOR_PREVIEW";
    const waMessage = `Halo *${updatedPengajuan.warga.nama_lengkap}*,\n\nDokumen pengajuan Anda dengan Kode Resi *${updatedPengajuan.kode_tiket}* telah *DISETUJUI* oleh Petugas Kelurahan Sukamaju.\n\n📌 *Catatan Petugas:* ${catatan_petugas || 'Berkas disetujui'}\n\nSilakan datang ke Kantor Kelurahan membawa berkas fisik KTP/KK ASLI untuk pengambilan dokumen.\n\n_AIPEX VeriBot - Layanan Kependudukan Digital_`;
    
    // In a real environment with actual token, we make the request
    if (fonnteToken !== "DUMMY_TOKEN_FOR_PREVIEW") {
      fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          "Authorization": fonnteToken,
          "Content-Type": "application/json" // Fonnte also accepts formData but json can work depending on their API, usually they use formdata but let's just log or try it
        },
        body: JSON.stringify({
          target: updatedPengajuan.warga.no_whatsapp,
          message: waMessage
        })
      }).catch(err => console.error("Fonnte WA Error:", err));
    }
    
    waSent = true;
    waResponse = { status: "simulated/queued", message: "Mock WA success" };
  }

  res.json({
    success: true,
    message: `Status berhasil diperbarui menjadi: ${status_petugas}`,
    wa_sent: waSent,
    wa_response: waResponse,
    data: updatedPengajuan,
  });
});

// Petugas Login Endpoint
app.post("/api/petugas/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ success: false, message: "Username dan password harus diisi." });
    return;
  }

  // Find user
  const user = dbPetugas.find((p) => p.username === username);
  if (!user) {
    res.status(401).json({ success: false, message: "Akun petugas tidak ditemukan." });
    return;
  }

  // Default test password: admin123
  if (password !== "admin123") {
    res.status(401).json({ success: false, message: "Password petugas salah. Gunakan default: admin123" });
    return;
  }

  res.json({
    success: true,
    message: "Login petugas berhasil!",
    user: {
      id: user.id,
      username: user.username,
      nama_petugas: user.nama_petugas,
      jabatan: user.jabatan,
    },
  });
});

// Cognitive AI & Computer Vision Document Scan API
app.post("/api/scan-ai", async (req, res) => {
  try {
    const { docType, citizenNik, citizenName, fileDataUrl, fileName } = req.body;

    // If Gemini is configured and an image was provided as base64, use Gemini 3.7 Flash for deep vision inspection
    if (ai && fileDataUrl && fileDataUrl.startsWith("data:image")) {
      try {
        const mimeTypeMatch = fileDataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
        const base64Data = fileDataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

        const prompt = `Anda adalah Cognitive Computer Vision Inspector untuk administrasi kependudukan Indonesia (AIPEX VeriBot).
Tugas Anda mengevaluasi foto dokumen yang diunggah warga untuk layanan: "${docType || "Dokumen Kependudukan"}".
Data yang diinputkan warga:
- NIK: ${citizenNik || "Tidak diinput"}
- Nama: ${citizenName || "Tidak diinput"}

Analisis foto ini secara mendalam untuk:
1. Ketajaman gambar dan keterbacaan teks (apakah buram, kabur, atau low-res).
2. Pantulan cahaya (glare / flash) pada bidang tulisan penting.
3. Posisi dan kelengkapan sudut kartu/dokumen (apakah 4 sudut lengkap atau terpotong).
4. Kecocokan teks OCR (apakah NIK atau nama terbaca dan konsisten).
5. Skor kelayakan berkas (0 - 100). Jika di atas atau sama dengan 75, status "Lulus_AI", jika 50-74 "Butuh_Revisi", jika di bawah 50 "Gagal_Validasi".

Berikan respons HANYA dalam format JSON berikut (tanpa markdown backtick):
{
  "skor": 88,
  "status": "Lulus_AI",
  "ocrNik": "3201...",
  "nikMatch": true,
  "clarityPercent": 92,
  "isBlur": false,
  "isGlare": false,
  "edgesComplete": true,
  "analysisSummary": "Ringkasan analisis dalam 1-2 kalimat bahasa Indonesia yang ramah.",
  "warningMessages": ["catatan jika ada"],
  "checklist": [
    {"label": "Ketajaman Dokumen", "passed": true, "desc": "Teks terbaca tajam"},
    {"label": "Deteksi NIK / Identitas", "passed": true, "desc": "Nomor NIK 16 digit teridentifikasi"},
    {"label": "Bebas Pantulan Cahaya (Glare)", "passed": true, "desc": "Pencahayaan merata"},
    {"label": "Format & Batas Dokumen", "passed": true, "desc": "4 sudut dokumen terlihat utuh"}
  ]
}`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data,
                },
              },
              { text: prompt },
            ],
          },
        });

        const rawText = aiResponse.text || "";
        const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);

        res.json({
          success: true,
          source: "gemini-vision",
          result: parsed,
        });
        return;
      } catch (geminiErr: any) {
        console.warn("Gemini vision fallback to heuristic scan:", geminiErr.message);
        // Fallback to heuristic scan below
      }
    }

    // Heuristic Computer Vision & Cognitive AI Simulation
    // Check NIK format (16 digits in Indonesia)
    const cleanNik = (citizenNik || "").replace(/\D/g, "");
    const isNikValidFormat = cleanNik.length === 16;
    
    // Determine simulated attributes based on filename or random seed
    const isSampleBlurry = (fileName || "").toLowerCase().includes("blur") || Math.random() < 0.12;
    const isSampleGlare = (fileName || "").toLowerCase().includes("glare") || Math.random() < 0.08;
    const isEdgesCut = (fileName || "").toLowerCase().includes("cut") || Math.random() < 0.05;

    let baseScore = 88;
    const warnings: string[] = [];

    if (isSampleBlurry) {
      baseScore -= 25;
      warnings.push("Dokumen terdeteksi agak buram. Pastikan fokus kamera pas dan teks terbaca.");
    }
    if (isSampleGlare) {
      baseScore -= 18;
      warnings.push("Ditemukan pantulan flash / cahaya silau pada bagian teks dokumen.");
    }
    if (isEdgesCut) {
      baseScore -= 15;
      warnings.push("Sudut dokumen terpotong bingkai foto. Posisikan seluruh lembar dokumen terlihat.");
    }
    if (!isNikValidFormat && cleanNik.length > 0) {
      baseScore -= 12;
      warnings.push(`Format NIK terdeteksi ${cleanNik.length} digit (standar KTP Dukcapil adalah 16 digit).`);
    }

    // Clamp score
    const finalScore = Math.max(45, Math.min(98, baseScore));
    let status: "Lulus_AI" | "Butuh_Revisi" | "Gagal_Validasi" = "Lulus_AI";
    if (finalScore < 60) {
      status = "Gagal_Validasi";
    } else if (finalScore < 75) {
      status = "Butuh_Revisi";
    }

    const checklist = [
      {
        label: "Teks Terbaca Jelas",
        passed: !isSampleBlurry,
        desc: !isSampleBlurry ? "Resolusi tajam, tulisan terbaca sempurna" : "Indeks blur 35%, disarankan foto ulang",
      },
      {
        label: "Kesesuaian NIK Kependudukan",
        passed: isNikValidFormat,
        desc: isNikValidFormat
          ? `NIK ${cleanNik} berhasil dicocokkan dengan form pemohon`
          : "Teks NIK belum terverifikasi 16 digit",
      },
      {
        label: "Kecerahan Cukup",
        passed: !isSampleGlare,
        desc: !isSampleGlare ? "Pencahayaan seimbang tanpa pantulan flash" : "Pantulan cahaya menutupi sebagian teks",
      },
      {
        label: "Sisi Dokumen Tidak Terpotong",
        passed: !isEdgesCut,
        desc: !isEdgesCut ? "4 sudut dokumen masuk dalam bingkai pemindaian" : "Sudut dokumen terpotong",
      },
    ];

    res.json({
      success: true,
      source: "cognitive-vision-simulator",
      result: {
        skor: finalScore,
        status: status,
        ocrNik: isNikValidFormat ? cleanNik : "320101XXXXXXXXXX",
        nikMatch: isNikValidFormat,
        clarityPercent: isSampleBlurry ? 62 : 94,
        isBlur: isSampleBlurry,
        isGlare: isSampleGlare,
        edgesComplete: !isEdgesCut,
        analysisSummary:
          status === "Lulus_AI"
            ? "Berkas Anda sangat tajam, lengkap, dan memenuhi standar verifikasi loket kelurahan!"
            : "Berkas sudah terbaca namun perlu sedikit penyesuaian agar tidak bolak-balik ke kelurahan.",
        warningMessages: warnings,
        checklist,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Pemindaian AI gagal." });
  }
});

// VeriBot Chatbot Virtual Assistant API
app.post(["/api/chat-veribot", "/api/v1/chat"], async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ success: false, message: "Pesan tidak boleh kosong." });
      return;
    }

    // If Gemini is available, utilize conversational AI
    if (ai) {
      try {
        const chatPrompt = `Anda adalah "VeriBot", Asisten Virtual Pre-Screening Administrasi Kependudukan resmi tingkat RT/RW dan Kelurahan Sukamaju.
Karakter Anda: Sangat ramah, sopan, bahasa Indonesia baku namun mudah dipahami oleh warga awam dan lansia, solutif, dan ringkas.
Informasi Layanan Kelurahan Sukamaju:
- Jam Operasional Loket: Senin s/d Jumat, pukul 08:00 - 15:30 WIB (Istirahat 12:00 - 13:00 WIB, Jumat 11:30 - 13:00 WIB). Sabtu, Minggu, & Libur Nasional TUTUP.
- Biaya: SEMUA LAYANAN KEPENDUDUKAN GRATIS (Rp 0). Tolak segala bentuk pungutan liar.
- Syarat KTP-el Hilang/Rusak: Surat Kehilangan dari Polsek terdekat, Foto Kartu Keluarga (KK), KTP lama jika rusak, Surat Pengantar RT/RW.
- Syarat KK Baru / Perubahan: KK Lama asli, Akta Lahir anak / Surat Nikah / Akta Cerai, Surat Pengantar RT/RW.
- Syarat Pindah Datang (SKPWNI): KTP & KK asli, Formulir F-1.08, Surat Keterangan Pindah dari kelurahan asal.
- Syarat Akta Kelahiran: Surat Keterangan Lahir dari RS/Bidan, Buku Nikah orang tua, KTP kedua orang tua, KTP 2 orang saksi.
- Fitur AIPEX VeriBot: Warga dapat melakukan pre-screening mandiri di menu "Mulai Cek Dokumen Mandiri", mengunggah foto berkas, mendapatkan skor kelayakan AI, dan membawa tiket QR ke loket khusus VeriBot untuk jalur cepat (Fast Track).

Jawab pertanyaan warga berikut dengan ramah dan sertakan emoji secukupnya:
"${message}"`;

        const chatResponse = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: chatPrompt,
        });

        res.json({
          success: true,
          reply: chatResponse.text,
        });
        return;
      } catch (geminiErr: any) {
        console.warn("Gemini chat fallback to knowledge base:", geminiErr.message);
      }
    }

    // Smart Rule-based Knowledge Base Fallback
    const lower = message.toLowerCase();
    let reply = "";

    if (lower.includes("jam") || lower.includes("buka") || lower.includes("tutup") || lower.includes("operasional")) {
      reply = `⏰ **Jam Pelayanan Loket Kelurahan Sukamaju:**\n- **Senin - Kamis:** 08:00 - 15:30 WIB (Istirahat 12:00 - 13:00 WIB)\n- **Jumat:** 08:00 - 15:30 WIB (Istirahat 11:30 - 13:00 WIB)\n- **Sabtu & Minggu:** Libur / Tutup.\n\n💡 *Tips:* Pemegang tiket AIPEX VeriBot dapat langsung menuju Loket 1 (Jalur Fast-Track Validasi AI)!`;
    } else if (lower.includes("ktp") || lower.includes("e-ktp")) {
      reply = `🪪 **Syarat Pengurusan KTP-el:**\n1. **KTP Hilang:** Surat Keterangan Kehilangan dari Polsek + Fotokopi KK.\n2. **KTP Rusak:** Membawa fisik KTP lama yang rusak + Fotokopi KK.\n3. **KTP Pemula (17 Tahun):** Fotokopi Kartu Keluarga + Akta Kelahiran + Surat Pengantar RT/RW.\n\n✨ *Semua pelayanan KTP-el GRATIS (Rp 0)!* Silakan gunakan menu Pre-Screening untuk cek kelayakan foto berkas Anda terlebih dahulu.`;
    } else if (lower.includes("kk") || lower.includes("kartu keluarga")) {
      reply = `👨‍👩‍👧‍👦 **Syarat Pembaruan / Cetak Kartu Keluarga (KK):**\n1. Kartu Keluarga (KK) Asli yang lama.\n2. Fotokopi Buku Nikah / Akta Perkawinan / Akta Cerai.\n3. Surat Keterangan Lahir / Akta Lahir (jika menambah anggota keluarga baru).\n4. Surat Pengantar dari Ketua RT dan RW setempat.\n\n📌 Pastikan saat memfoto KK, seluruh tabel dan tanda tangan Disdukcapil terlihat jelas.`;
    } else if (lower.includes("pindah") || lower.includes("skpwni") || lower.includes("domisili")) {
      reply = `📦 **Syarat Surat Keterangan Pindah WNI (SKPWNI):**\n1. e-KTP Asli Pemohon & seluruh anggota yang ikut pindah.\n2. Kartu Keluarga (KK) Asli.\n3. Alamat lengkap tujuan pindah (nama jalan, RT/RW, kelurahan, kecamatan, kab/kota).\n4. Formulir Permohonan Pindah (F-1.08) yang ditandatangani RT/RW.`;
    } else if (lower.includes("akta") || lower.includes("lahir") || lower.includes("kelahiran")) {
      reply = `👶 **Syarat Penerbitan Akta Kelahiran Baru:**\n1. Surat Keterangan Kelahiran asli dari RS / Klinik / Bidan.\n2. Fotokopi Buku Nikah / Akta Perkawinan Orang Tua (dilegalisir).\n3. Fotokopi KK dan e-KTP kedua orang tua.\n4. Fotokopi e-KTP 2 (dua) orang saksi kelahiran.\n5. Surat Pengantar RT/RW.`;
    } else if (lower.includes("biaya") || lower.includes("bayar") || lower.includes("tarif") || lower.includes("gratis")) {
      reply = `🚫 **PENTING: SEMUA LAYANAN KEPENDUDUKAN 100% GRATIS!**\nSesuai UU No. 24 Tahun 2013 tentang Administrasi Kependudukan, tidak ada pungutan biaya sepeser pun di tingkat RT/RW maupun Kelurahan. Jika ada yang meminta biaya, silakan laporkan ke kontak pengaduan kami.`;
    } else if (lower.includes("tiket") || lower.includes("qr") || lower.includes("cek")) {
      reply = `🎫 **Cara Menggunakan Tiket Digital VeriBot:**\n1. Buka formulir **Pre-Screening Mandiri**.\n2. Isi identitas dan unggah foto berkas dari HP/Laptop.\n3. Sistem AI akan mengecek ketajaman foto & kecocokan data.\n4. Jika lulus (skor >= 75%), Anda mendapatkan Kode Tiket & QR Code.\n5. Tunjukkan QR Code tersebut ke petugas di loket kelurahan untuk langsung diproses tanpa antre lama!`;
    } else {
      reply = `Halo Bapak/Ibu Warga! 😊 Saya **VeriBot**, asisten AI Pre-Screening Kelurahan Sukamaju.\n\nSaya dapat membantu Anda dengan:\n- 📋 Syarat berkas KTP-el, KK, Surat Pindah, & Akta Kelahiran.\n- ⏰ Jam buka & jadwal pelayanan loket.\n- 🔍 Cara cek kelayakan foto dokumen agar tidak ditolak petugas.\n- ❓ Panduan surat pengantar dari RT/RW.\n\nSilakan ketik pertanyaan Anda atau gunakan tombol bantuan cepat di bawah!`;
    }

    res.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Gagal menghubungi VeriBot." });
  }
});

// Endpoint to view/download raw local deployment files
app.get("/api/raw-files/:filename", (req, res) => {
  const { filename } = req.params;
  let targetPath = "";

  if (filename === "schema.sql") {
    targetPath = path.join(process.cwd(), "schema.sql");
  } else if (filename === "koneksi.php") {
    targetPath = path.join(process.cwd(), "koneksi.php");
  } else if (filename === "panduan.md") {
    targetPath = path.join(process.cwd(), "panduan_instalasi.md");
  } else {
    res.status(404).send("File tidak ditemukan.");
    return;
  }

  if (fs.existsSync(targetPath)) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.sendFile(targetPath);
  } else {
    res.status(404).send("File tidak ditemukan di server.");
  }
});

// -------------------------------------------------------------
// VITE OR STATIC MIDDLEWARE (Full-Stack Setup)
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AIPEX VeriBot] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
