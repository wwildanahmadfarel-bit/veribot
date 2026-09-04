# Panduan Instalasi & Deployment Lokal - AIPEX VeriBot (AI Pre-Screening Expert)

Aplikasi Web Fullstack Interaktif Pre-Screening & Verifikasi Mandiri Dokumen Administrasi Kependudukan Kelurahan Berbasis Cognitive AI & Computer Vision.

---

## 1. Prasyarat Sistem (System Requirements)
Untuk menjalankan aplikasi ini di komputer lokal (Windows, macOS, atau Linux), Anda dapat memilih salah satu dari 2 arsitektur yang didukung:

### Opsi A: Menggunakan Node.js / Express + React (Fullstack Terintegrasi)
- **Node.js**: Versi 18.x atau lebih baru (`node -v`)
- **NPM**: Versi 9.x atau lebih baru (`npm -v`)
- Browser modern: Google Chrome, Microsoft Edge, Mozilla Firefox

### Opsi B: Menggunakan PHP + Apache + MySQL (XAMPP / Laragon / LAMP)
- **XAMPP / Laragon**: PHP versi 8.0 / 8.1 / 8.2+
- **MySQL Server / MariaDB**: Versi 5.7 / 8.0+
- Ekstensi PHP yang aktif: `pdo_mysql`, `mbstring`, `json`

---

## 2. Langkah-Langkah Instalasi Database MySQL (phpMyAdmin)

1. **Jalankan Layanan MySQL & Apache:**
   - Buka **XAMPP Control Panel**, klik tombol **Start** pada modul **Apache** dan **MySQL**.
   - Atau jika menggunakan **Laragon**, klik tombol **Start All**.

2. **Buka phpMyAdmin:**
   - Buka browser dan navigasikan ke: [http://localhost/phpmyadmin](http://localhost/phpmyadmin).

3. **Import Skema Database `schema.sql`:**
   - Klik tab menu **Import** di bagian atas phpMyAdmin.
   - Klik tombol **Choose File** / **Pilih Berkas**, lalu pilih file `schema.sql` dari direktori proyek ini.
   - Gulir ke bawah dan klik tombol **Import** / **Kirim**.
   - Sistem akan otomatis membuat database `db_veribot` beserta 5 tabel relasional:
     * `warga` (Data pemohon warga RT/RW)
     * `layanan` (Daftar layanan kependudukan: KTP, KK, Surat Pindah, Akta Lahir)
     * `petugas` (Akun verifikator kelurahan)
     * `pengajuan` (Tiket administrasi & skor kelayakan AI)
     * `dokumen_pengajuan` (File berkas & catatan audit Computer Vision)
     * Beserta data dummy pengujian siap pakai.

---

## 3. Konfigurasi Koneksi Database PHP (`koneksi.php`)

Buka file `koneksi.php` pada teks editor (VS Code / Sublime Text) dan periksa parameter koneksi:

```php
define('DB_HOST', '127.0.0.1');     // Host database
define('DB_PORT', '3306');          // Port default MySQL
define('DB_NAME', 'db_veribot');    // Nama database yang diimpor
define('DB_USER', 'root');          // Username bawaan XAMPP adalah root
define('DB_PASS', '');              // Password bawaan XAMPP adalah kosong ("")
```

**Uji Coba Koneksi PHP:**
Pindahkan folder proyek ke `htdocs` (misal: `C:\xampp\htdocs\veribot`), kemudian akses [http://localhost/veribot/koneksi.php](http://localhost/veribot/koneksi.php). Jika berhasil, akan muncul pesan hijau *“Sukses Terhubung ke Database MySQL”*.

---

## 4. Menjalankan Aplikasi Web Modern (React + Node.js Express)

Aplikasi ini dilengkapi antarmuka interaktif yang langsung dapat dijalankan secara fullstack dengan Node.js:

1. **Buka Terminal / Command Prompt di folder proyek:**
   ```bash
   cd /path/to/project
   ```

2. **Install Dependensi Paket:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable (Opsional untuk AI Vision Nyata):**
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   *Jika memiliki Gemini API Key, Anda dapat memasukkannya pada `GEMINI_API_KEY=AIzaSy...`. Jika tidak diisi, sistem secara otomatis beralih ke simulasi cerdas Computer Vision & Cognitive AI bawaan.*

4. **Jalankan Server Pengembangan:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di: [http://localhost:3000](http://localhost:3000).

5. **Build untuk Produksi:**
   ```bash
   npm run build
   npm run start
   ```

---

## 5. Kredensial Pengujian (Default Accounts)

Untuk menguji fitur Dashboard Petugas Kelurahan, gunakan akun berikut:

| Peran (Role) | Username | Password Default | Nama Petugas | Jabatan |
|---|---|---|---|---|
| **Kasi Pelayanan** | `petugas1` | `admin123` | Bambang Sudiro, S.STP | Kepala Seksi Pelayanan Kependudukan |
| **Staf Loket** | `petugas2` | `admin123` | Siti Rahmawati, A.Md | Staf Loket Verifikator Berkas |

---

## 6. Alur Fitur Utama Aplikasi
1. **Landing Page Warga (`/`):**
   - Informasi layanan administrasi (KTP-el, KK, SKPWNI, Akta Kelahiran).
   - Visual Stepper alur layanan 4 tahap.
   - Pengecekan status tiket cepat berbasis Kode Tiket.
2. **Form Pre-Screening Interaktif 4 Tahap (`/prescreening`):**
   - **Step 1:** Pengisian identitas diri (NIK 16 digit, Nama, WhatsApp, Alamat).
   - **Step 2:** Drag & Drop unggah foto berkas dengan deteksi ukuran dan tipe file.
   - **Step 3:** Pemindaian Computer Vision AI dengan radar scanner dan progress bar live, mendeteksi ketajaman, blur, pantulan cahaya (glare), dan kesesuaian NIK.
   - **Step 4:** Penerbitan Tiket Digital QR Code resmi dengan rincian kelayakan berkas dan tombol kirim ke WhatsApp / Cetak Tiket.
3. **Floating Chatbot AI "VeriBot Assistant":**
   - Widget chat di pojok kanan bawah yang siap memandu warga seputar syarat berkas, format foto, jam loket (Senin-Jumat 08:00-15:30), dan panduan RT/RW.
4. **Dashboard Petugas Kelurahan (`/admin`):**
   - Statistik harian antrean dan kelayakan AI.
   - Tabel responsif pengajuan dengan filter status.
   - Modal Preview komparasi berkas fisik & catatan AI.
   - Tombol eksekusi verifikasi: "Setujui & Cetak Dokumen" (`btn-success`) atau "Tolak & Minta Upload Ulang" (`btn-outline-danger`) dengan catatan resmi petugas.

## 7. Kepatuhan UU Perlindungan Data Pribadi (UU PDP)
Sistem dirancang menggunakan **Hybrid Storage Model** untuk memastikan kerahasiaan data kependudukan warga:
- **Auto-Purge Mekanisme**: File fisik dokumen (KTP, KK, Surat Pindah, Akta Kelahiran) hanya disimpan sementara di *memory server* selama proses ekstraksi dan analisis AI berlangsung.
- Setelah pemindaian Computer Vision selesai dan metrik kelayakan (blur, glare, crop, kesesuaian identitas) diterbitkan, file gambar fisik akan **dihapus secara permanen (purged)** dari server.
- Database `db_veribot` hanya menyimpan meta-data hasil audit (skor AI, daftar checklist terpenuhi, catatan error), sehingga sangat menghemat kapasitas *storage* server sekaligus memastikan sistem 100% patuh terhadap standar keamanan privasi data kependudukan kelurahan.
