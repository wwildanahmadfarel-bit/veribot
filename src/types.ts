export interface Warga {
  id: number;
  nik: string;
  nama_lengkap: string;
  no_whatsapp: string;
  alamat: string;
  created_at: string;
}

export interface Layanan {
  id: number;
  nama_layanan: string;
  deskripsi: string;
  persyaratan_json: string[];
}

export interface Petugas {
  id: number;
  username: string;
  nama_petugas: string;
  jabatan: string;
}

export interface DokumenPengajuan {
  id?: number;
  pengajuan_id?: number;
  jenis_dokumen: string;
  file_path: string;
  catatan_ai: string;
  is_valid: boolean;
}

export interface Pengajuan {
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
  warga?: Warga;
  layanan?: Layanan;
  dokumen?: DokumenPengajuan[];
}

export interface ChecklistItem {
  label: string;
  passed: boolean;
  desc: string;
}

export interface AiScanResult {
  skor: number;
  status: "Lulus_AI" | "Butuh_Revisi" | "Gagal_Validasi";
  ocrNik: string;
  nikMatch: boolean;
  clarityPercent: number;
  isBlur: boolean;
  isGlare: boolean;
  edgesComplete: boolean;
  analysisSummary: string;
  warningMessages: string[];
  checklist: ChecklistItem[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}
