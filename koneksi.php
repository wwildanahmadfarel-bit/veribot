<?php
/**
 * =========================================================================
 * AIPEX VeriBot (AI Pre-Screening Expert)
 * Backend Database Connection (PHP Native - PDO MySQL)
 * =========================================================================
 * 
 * Panduan Konfigurasi:
 * 1. Pastikan server Apache & MySQL (XAMPP / Laragon / LAMP) sudah running.
 * 2. Buat database atau import file `schema.sql` via phpMyAdmin (http://localhost/phpmyadmin).
 * 3. Sesuaikan konstanta DB_HOST, DB_USER, DB_PASS, dan DB_NAME di bawah ini jika diperlukan.
 * 4. Uji koneksi dengan mengakses http://localhost/koneksi.php di browser Anda.
 */

// Konfigurasi Parameter Database
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');     // Host MySQL (default: localhost atau 127.0.0.1)
define('DB_PORT', getenv('DB_PORT') ?: '3306');          // Port default MySQL
define('DB_NAME', getenv('DB_NAME') ?: 'db_veribot');    // Nama Database sesuai schema.sql
define('DB_USER', getenv('DB_USER') ?: 'root');          // Username MySQL (default XAMPP: root)
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : ''); // Password MySQL (default XAMPP: kosong)

// Opsi Koneksi PDO
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,     // Lempar Exception jika terjadi error
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,            // Kembalikan array asosiatif
    PDO::ATTR_EMULATE_PREPARES   => false,                       // Gunakan native prepared statements untuk keamanan SQL Injection
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
];

try {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    
    // Jika file ini diakses langsung dari browser, tampilkan status uji koneksi
    if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
        header('Content-Type: text/html; charset=utf-8');
        echo "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 24px; border: 1px solid #198754; border-radius: 12px; background: #e8f5e9; color: #1e4620;'>";
        echo "<h2 style='margin-top:0;'>✅ Sukses Terhubung ke Database MySQL!</h2>";
        echo "<p><strong>AIPEX VeriBot Backend</strong> berhasil tersambung ke database <code>" . htmlspecialchars(DB_NAME) . "</code> pada host <code>" . htmlspecialchars(DB_HOST) . ":" . htmlspecialchars(DB_PORT) . "</code>.</p>";
        
        // Cek jumlah data pengajuan
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM pengajuan");
        $res = $stmt->fetch();
        echo "<p>📊 Jumlah tiket pengajuan saat ini: <strong>" . $res['total'] . " tiket</strong>.</p>";
        echo "<p style='font-size: 13px; color: #4b6350;'>Catatan: Jangan lupa simpan file ini dan gunakan <code>require_once 'koneksi.php';</code> pada script API/halaman PHP Anda.</p>";
        echo "</div>";
    }
} catch (PDOException $e) {
    // Tangani kegagalan koneksi dengan pesan informatif
    $errorMessage = "Gagal terkoneksi ke database MySQL: " . $e->getMessage();
    
    if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
        header('Content-Type: text/html; charset=utf-8');
        http_response_code(500);
        echo "<div style='font-family: Arial, sans-serif; max-width: 650px; margin: 40px auto; padding: 24px; border: 1px solid #dc3545; border-radius: 12px; background: #fff5f5; color: #842029;'>";
        echo "<h2 style='margin-top:0;'>❌ Koneksi Database Gagal</h2>";
        echo "<p><strong>Pesan Kesalahan:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
        echo "<hr style='border: 0; border-top: 1px solid #f5c2c7;'>";
        echo "<h4>Langkah Penyelesaian:</h4>";
        echo "<ol style='padding-left: 20px; line-height: 1.6;'>";
        echo "<li>Buka <strong>XAMPP Control Panel</strong> dan pastikan tombol <strong>MySQL</strong> dalam keadaan <em>Running (Start)</em>.</li>";
        echo "<li>Pastikan database <code>" . htmlspecialchars(DB_NAME) . "</code> sudah dibuat di phpMyAdmin dengan mengimport file <code>schema.sql</code>.</li>";
        echo "<li>Periksa apakah username & password MySQL di file <code>koneksi.php</code> sudah sesuai dengan konfigurasi XAMPP/Laragon Anda.</li>";
        echo "</ol>";
        echo "</div>";
        exit;
    } else {
        // Mode API: kembalikan format JSON error
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database connection error',
            'detail' => $e->getMessage()
        ]);
        exit;
    }
}

/**
 * Helper function untuk mendapatkan instance PDO global
 */
function getDBConnection() {
    global $pdo;
    return $pdo;
}
?>
