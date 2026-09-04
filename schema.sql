-- ==========================================================
-- AIPEX VeriBot (AI Pre-Screening Expert)
-- Skema Database Relasional MySQL / phpMyAdmin
-- Database Name: db_veribot
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `db_veribot` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_veribot`;

-- --------------------------------------------------------
-- 1. Tabel `warga`
-- Menyimpan data identitas warga pemohon layanan kependudukan
-- --------------------------------------------------------
DROP TABLE IF EXISTS `dokumen_pengajuan`;
DROP TABLE IF EXISTS `pengajuan`;
DROP TABLE IF EXISTS `layanan`;
DROP TABLE IF EXISTS `petugas`;
DROP TABLE IF EXISTS `warga`;

CREATE TABLE `warga` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nik` VARCHAR(16) NOT NULL UNIQUE,
  `nama_lengkap` VARCHAR(150) NOT NULL,
  `no_whatsapp` VARCHAR(20) NOT NULL,
  `alamat` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Tabel `layanan`
-- Menyimpan katalog jenis administrasi kependudukan di Kelurahan
-- --------------------------------------------------------
CREATE TABLE `layanan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_layanan` VARCHAR(150) NOT NULL,
  `deskripsi` TEXT NOT NULL,
  `persyaratan_json` JSON NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Tabel `petugas`
-- Menyimpan akun petugas verifikator & staf loket Kelurahan
-- --------------------------------------------------------
CREATE TABLE `petugas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nama_petugas` VARCHAR(150) NOT NULL,
  `jabatan` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Tabel `pengajuan`
-- Menyimpan berkas tiket pre-screening yang diajukan warga
-- --------------------------------------------------------
CREATE TABLE `pengajuan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_tiket` VARCHAR(30) NOT NULL UNIQUE,
  `warga_id` INT NOT NULL,
  `layanan_id` INT NOT NULL,
  `skor_ai` INT NOT NULL DEFAULT 0,
  `status_ai` ENUM('Lulus_AI', 'Butuh_Revisi', 'Gagal_Validasi') NOT NULL DEFAULT 'Butuh_Revisi',
  `status_petugas` ENUM('Menunggu_Verifikasi', 'Disetujui', 'Butuh_Perbaikan', 'Ditolak') NOT NULL DEFAULT 'Menunggu_Verifikasi',
  `catatan_petugas` TEXT NULL,
  `qr_code_path` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_pengajuan_warga` FOREIGN KEY (`warga_id`) REFERENCES `warga` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pengajuan_layanan` FOREIGN KEY (`layanan_id`) REFERENCES `layanan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Tabel `dokumen_pengajuan`
-- Menyimpan file fisik berkas & hasil penilaian Computer Vision AI
-- --------------------------------------------------------
CREATE TABLE `dokumen_pengajuan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pengajuan_id` INT NOT NULL,
  `jenis_dokumen` VARCHAR(100) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `catatan_ai` TEXT NULL,
  `is_valid` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `fk_dokumen_pengajuan` FOREIGN KEY (`pengajuan_id`) REFERENCES `pengajuan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- DATA DUMMY AWAL (SEEDING DATA UNTUK PENGUJIAN)
-- ==========================================================

-- Data Petugas Kelurahan (Password default: 'admin123' di-hash bcrypt atau plain untuk pengujian)
INSERT INTO `petugas` (`id`, `username`, `password`, `nama_petugas`, `jabatan`) VALUES
(1, 'petugas1', '$2y$10$wE1V6JtZ0v6q9.sV7jC7IeKq1Y/sNqZ4w1G0q7VvF1b2t3Y4u5x6a', 'Bambang Sudiro, S.STP', 'Kepala Seksi Pelayanan Kependudukan'),
(2, 'petugas2', '$2y$10$wE1V6JtZ0v6q9.sV7jC7IeKq1Y/sNqZ4w1G0q7VvF1b2t3Y4u5x6a', 'Siti Rahmawati, A.Md', 'Staf Loket Verifikator Berkas');

-- Data Layanan Administrasi Kependudukan
INSERT INTO `layanan` (`id`, `nama_layanan`, `deskripsi`, `persyaratan_json`) VALUES
(1, 'Penerbitan KTP-el Baru / Rusak', 'Layanan verifikasi mandiri penggantian KTP-el rusak/hilang atau pemula 17 tahun.', 
 JSON_ARRAY('Foto e-KTP Asli / Keterangan Kehilangan Polsek', 'Kartu Keluarga Terbaru', 'Surat Pengantar RT/RW Setempat')),
(2, 'Pembaruan Kartu Keluarga (KK)', 'Perubahan susunan keluarga (penambahan anak, mutasi anggota keluarga, atau ganti status).', 
 JSON_ARRAY('Kartu Keluarga Lama Asli', 'Surat Nikah / Akta Cerai', 'Akta Kelahiran Anggota Baru', 'Surat Pengantar RT/RW')),
(3, 'Surat Keterangan Pindah WNI (SKPWNI)', 'Permohonan surat pindah domisili antar kelurahan, kota/kabupaten, atau antar provinsi.', 
 JSON_ARRAY('e-KTP Asli Pemohon', 'Kartu Keluarga Asli', 'Formulir F-1.08 Pindah Datang', 'Surat Pernyataan Alamat Tujuan')),
(4, 'Penerbitan Akta Kelahiran', 'Pelayanan pencatatan kelahiran anak dan penerbitan kutipan akta resmi Disdukcapil.', 
 JSON_ARRAY('Surat Keterangan Lahir dari Bidan/RS', 'Buku Nikah / Akta Perkawinan Orang Tua', 'KK & KTP Kedua Orang Tua', 'KTP 2 Orang Saksi'));

-- Data Warga Pemohon
INSERT INTO `warga` (`id`, `nik`, `nama_lengkap`, `no_whatsapp`, `alamat`, `created_at`) VALUES
(1, '3201011504950001', 'Ahmad Fauzi Nurhadi', '081234567890', 'Jl. Kenanga No. 14 RT 03 / RW 05, Kel. Sukamaju', '2025-08-20 08:30:00'),
(2, '3201015609880003', 'Dewi Lestari Kusuma', '085712349988', 'Komplek Griya Indah Blok C2/09, Kel. Sukamaju', '2025-08-21 09:15:00'),
(3, '3201012301820005', 'Hendro Prasetyo', '082198765432', 'Jl. Melati Raya No. 45 RT 01 / RW 02, Kel. Sukamaju', '2025-08-22 10:45:00'),
(4, '3201014812990002', 'Rina Agustina Wardani', '087811223344', 'Gang Dahlia IV No. 08 RT 06 / RW 03, Kel. Sukamaju', '2025-08-23 11:20:00');

-- Data Pengajuan Tiket
INSERT INTO `pengajuan` (`id`, `kode_tiket`, `warga_id`, `layanan_id`, `skor_ai`, `status_ai`, `status_petugas`, `catatan_petugas`, `qr_code_path`, `created_at`) VALUES
(1, 'TKT-202508-001', 1, 1, 94, 'Lulus_AI', 'Disetujui', 'Berkas KTP & KK sangat tajam, data NIK valid terverifikasi database kelurahan.', 'qr_TKT-202508-001.png', '2025-08-20 08:35:12'),
(2, 'TKT-202508-002', 2, 2, 88, 'Lulus_AI', 'Menunggu_Verifikasi', NULL, 'qr_TKT-202508-002.png', '2025-08-21 09:22:45'),
(3, 'TKT-202508-003', 3, 3, 62, 'Butuh_Revisi', 'Butuh_Perbaikan', 'Foto KTP terpotong bagian sudut bawah dan NIK agak silau terkena flash. Harap foto ulang dengan pencahayaan merata.', 'qr_TKT-202508-003.png', '2025-08-22 10:52:10'),
(4, 'TKT-202508-004', 4, 4, 91, 'Lulus_AI', 'Menunggu_Verifikasi', NULL, 'qr_TKT-202508-004.png', '2025-08-23 11:28:30');

-- Data Dokumen Fisik & Hasil Analisis AI Vision
INSERT INTO `dokumen_pengajuan` (`id`, `pengajuan_id`, `jenis_dokumen`, `file_path`, `catatan_ai`, `is_valid`) VALUES
(1, 1, 'Foto e-KTP', 'uploads/ktp_ahmad_fauzi.jpg', 'AI Vision: Resolusi 1080p, NIK 3201011504950001 terdeteksi 99% akurat, tidak ada blur, sudut 4 titik kartu presisi.', 1),
(2, 1, 'Foto Kartu Keluarga', 'uploads/kk_ahmad_fauzi.jpg', 'AI Vision: Kepala Keluarga teridentifikasi, tanda tangan basah & barcode Disdukcapil terbaca jelas.', 1),
(3, 2, 'Foto Kartu Keluarga Lama', 'uploads/kk_dewi_lestari.jpg', 'AI Vision: Teks jelas, nomor KK sesuai, seluruh anggota keluarga terbaca.', 1),
(4, 3, 'Foto e-KTP', 'uploads/ktp_hendro_p.jpg', 'AI Vision Warning: Ditemukan pantulan cahaya (glare) 28% pada baris NIK, sudut kiri bawah terpotong frame foto.', 0),
(5, 3, 'Foto Kartu Keluarga', 'uploads/kk_hendro_p.jpg', 'AI Vision: Format KK valid, dokumen tajam 85% kelayakan.', 1),
(6, 4, 'Surat Keterangan Lahir', 'uploads/skl_rina.jpg', 'AI Vision: Kop surat Rumah Sakit dan stempel basah terverifikasi otomatis.', 1);
