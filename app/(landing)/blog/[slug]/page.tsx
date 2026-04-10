import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Static article data — can be migrated to CMS later
const articles: Record<string, {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  content: string;
}> = {
  "cara-install-nginx-di-vps-ubuntu": {
    title: "Cara Install dan Konfigurasi Nginx di VPS Ubuntu 22.04",
    excerpt: "Panduan lengkap instalasi Nginx di Ubuntu 22.04, mulai dari setup server block, SSL dengan Let's Encrypt, hingga optimasi performa.",
    category: "Tutorial",
    readTime: "8 menit",
    date: "2026-04-05",
    author: "Tim HostIDMurah",
    content: `
## Pendahuluan

Nginx adalah web server berkinerja tinggi yang banyak digunakan untuk melayani website dengan traffic besar. Dalam panduan ini, kita akan menginstall Nginx di VPS Ubuntu 22.04 dan mengkonfigurasinya untuk production.

## Prasyarat

- VPS Ubuntu 22.04 dengan akses root
- Domain yang sudah mengarah ke IP VPS

## Langkah 1 — Install Nginx

Update package index dan install Nginx:

\`\`\`bash
sudo apt update
sudo apt install nginx -y
\`\`\`

Verifikasi instalasi:

\`\`\`bash
nginx -v
sudo systemctl status nginx
\`\`\`

## Langkah 2 — Konfigurasi Firewall

Izinkan traffic HTTP dan HTTPS:

\`\`\`bash
sudo ufw allow 'Nginx Full'
sudo ufw enable
\`\`\`

## Langkah 3 — Buat Server Block

Buat konfigurasi untuk domain Anda:

\`\`\`bash
sudo nano /etc/nginx/sites-available/namadomain.com
\`\`\`

Isi dengan konfigurasi berikut:

\`\`\`nginx
server {
    listen 80;
    server_name namadomain.com www.namadomain.com;
    root /var/www/namadomain.com;
    index index.html index.php;

    location / {
        try_files $uri $uri/ =404;
    }
}
\`\`\`

Aktifkan server block:

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/namadomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

## Langkah 4 — Setup SSL dengan Let's Encrypt

Install Certbot:

\`\`\`bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d namadomain.com -d www.namadomain.com
\`\`\`

## Selesai

Nginx sekarang sudah berjalan dengan SSL. Website Anda bisa diakses via HTTPS dengan sertifikat yang diperbarui otomatis.
    `,
  },
  "vps-linux-vs-windows-pilih-yang-mana": {
    title: "VPS Linux vs Windows: Mana yang Tepat untuk Bisnis Anda?",
    excerpt: "Perbandingan mendalam antara VPS Linux dan Windows dari sisi performa, harga, dan use case.",
    category: "Tips VPS",
    readTime: "6 menit",
    date: "2026-03-28",
    author: "Tim HostIDMurah",
    content: `
## Pendahuluan

Saat memilih VPS, salah satu keputusan terpenting adalah memilih sistem operasi: Linux atau Windows. Masing-masing memiliki kelebihan tersendiri tergantung kebutuhan Anda.

## VPS Linux

### Kelebihan
- **Lebih murah** — lisensi gratis, harga VPS lebih rendah
- **Performa lebih tinggi** — overhead OS minimal
- **Keamanan lebih baik** — open source, komunitas aktif menambal vulnerabilitas
- **Cocok untuk**: web server (Nginx/Apache), database (MySQL/PostgreSQL), aplikasi berbasis Python/Node.js/PHP

### Kekurangan
- Membutuhkan pengetahuan command line
- Tidak cocok untuk software yang hanya berjalan di Windows

## VPS Windows

### Kelebihan
- **Antarmuka GUI** — lebih familiar bagi pengguna Windows
- **Remote Desktop (RDP)** — akses via GUI seperti PC biasa
- **Kompatibel dengan software Windows** — .NET, MSSQL, WAMP, MetaTrader
- **Cocok untuk**: aplikasi .NET, trading forex (MetaTrader), software bisnis Windows

### Kekurangan
- Lebih mahal karena lisensi Windows berbayar
- Konsumsi resource lebih tinggi

## Kesimpulan

| Use Case | Pilihan |
|----------|---------|
| Web server, aplikasi web | VPS Linux |
| Database MySQL/PostgreSQL | VPS Linux |
| Trading forex (MetaTrader) | VPS Windows |
| Aplikasi .NET | VPS Windows |
| Remote Desktop bisnis | VPS Windows |
| Budget terbatas | VPS Linux |

Jika masih bingung, konsultasikan ke tim support HostIDMurah via WhatsApp.
    `,
  },
  "cara-setup-wordpress-di-vps": {
    title: "Cara Deploy WordPress di VPS dengan LEMP Stack",
    excerpt: "Tutorial step-by-step setup WordPress self-hosted di VPS menggunakan Linux, Nginx, MySQL, dan PHP untuk performa terbaik.",
    category: "Tutorial",
    readTime: "12 menit",
    date: "2026-03-20",
    author: "Tim HostIDMurah",
    content: `
## Pendahuluan

LEMP (Linux, Nginx, MySQL, PHP) adalah kombinasi yang sangat populer untuk menjalankan WordPress dengan performa optimal. Dibanding LAMP (Apache), Nginx jauh lebih efisien dalam menangani traffic tinggi dengan konsumsi memori yang lebih rendah.

Panduan ini menggunakan VPS Ubuntu 22.04 dengan WordPress versi terbaru.

## Prasyarat

- VPS Ubuntu 22.04 dengan RAM minimal 1 GB
- Akses root atau sudo
- Domain yang sudah diarahkan ke IP VPS

## Langkah 1 — Update Sistem

\`\`\`bash
sudo apt update && sudo apt upgrade -y
\`\`\`

## Langkah 2 — Install Nginx

\`\`\`bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
\`\`\`

## Langkah 3 — Install MySQL

\`\`\`bash
sudo apt install mysql-server -y
sudo mysql_secure_installation
\`\`\`

Buat database dan user untuk WordPress:

\`\`\`bash
sudo mysql -u root -p
\`\`\`

\`\`\`bash
CREATE DATABASE wordpress_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wp_user'@'localhost' IDENTIFIED BY 'password_kuat_anda';
GRANT ALL PRIVILEGES ON wordpress_db.* TO 'wp_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
\`\`\`

## Langkah 4 — Install PHP

\`\`\`bash
sudo apt install php8.1-fpm php8.1-mysql php8.1-xml php8.1-curl php8.1-gd php8.1-mbstring php8.1-zip -y
\`\`\`

## Langkah 5 — Download dan Konfigurasi WordPress

\`\`\`bash
cd /tmp
wget https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz
sudo mv wordpress /var/www/namadomain.com
sudo chown -R www-data:www-data /var/www/namadomain.com
sudo chmod -R 755 /var/www/namadomain.com
\`\`\`

Salin konfigurasi WordPress:

\`\`\`bash
cd /var/www/namadomain.com
sudo cp wp-config-sample.php wp-config.php
sudo nano wp-config.php
\`\`\`

Ubah bagian database:

\`\`\`bash
define('DB_NAME', 'wordpress_db');
define('DB_USER', 'wp_user');
define('DB_PASSWORD', 'password_kuat_anda');
define('DB_HOST', 'localhost');
\`\`\`

## Langkah 6 — Konfigurasi Nginx Server Block

\`\`\`bash
sudo nano /etc/nginx/sites-available/namadomain.com
\`\`\`

Isi dengan:

\`\`\`bash
server {
    listen 80;
    server_name namadomain.com www.namadomain.com;
    root /var/www/namadomain.com;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
\`\`\`

Aktifkan dan reload:

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/namadomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

## Langkah 7 — Setup SSL dengan Certbot

\`\`\`bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d namadomain.com -d www.namadomain.com
\`\`\`

## Langkah 8 — Selesaikan Instalasi WordPress via Browser

Buka https://namadomain.com di browser dan ikuti wizard instalasi WordPress: pilih bahasa, isi detail situs, dan buat akun admin.

## Tips Performa

- Pasang plugin **LiteSpeed Cache** atau **W3 Total Cache** untuk caching
- Gunakan **Cloudflare** sebagai CDN gratis
- Aktifkan **OPcache** untuk mempercepat eksekusi PHP
- Rutin update WordPress core, tema, dan plugin untuk keamanan
    `,
  },
  "memilih-spesifikasi-vps-yang-tepat": {
    title: "Panduan Memilih Spesifikasi VPS yang Tepat untuk Website Anda",
    excerpt: "Bingung memilih RAM, CPU, dan storage VPS? Panduan ini membantu Anda menentukan spesifikasi sesuai jenis aplikasi dan traffic.",
    category: "Tips VPS",
    readTime: "5 menit",
    date: "2026-03-15",
    author: "Tim HostIDMurah",
    content: `
## Pendahuluan

Salah satu kebingungan paling umum saat pertama kali membeli VPS adalah menentukan spesifikasi yang tepat. Terlalu kecil membuat server lambat atau crash, terlalu besar membuat anggaran terbuang sia-sia.

Panduan ini membantu Anda memilih spesifikasi berdasarkan kebutuhan aktual.

## Memahami Komponen Utama VPS

### CPU (vCPU)

CPU menentukan seberapa banyak proses yang bisa dijalankan secara bersamaan. Website yang banyak melakukan komputasi (enkripsi, pemrosesan gambar, query kompleks) membutuhkan lebih banyak vCPU.

### RAM

RAM adalah faktor terpenting untuk performa sehari-hari. Semakin banyak pengguna bersamaan dan semakin besar aplikasi, semakin banyak RAM yang dibutuhkan. Jika RAM habis, server akan menggunakan swap (storage) yang jauh lebih lambat.

### Storage dan Tipe Disk

Gunakan SSD NVMe untuk performa terbaik. HDD spinning disk sudah tidak relevan untuk server modern. Pertimbangkan kebutuhan penyimpanan berdasarkan ukuran database, file media, dan log aplikasi.

### Bandwidth

Bandwidth menentukan berapa banyak data yang bisa ditransfer per bulan. Website dengan banyak gambar atau video membutuhkan bandwidth lebih besar.

## Panduan Memilih Berdasarkan Use Case

### Blog atau Website Company Profile

| Spesifikasi | Minimum | Rekomendasi |
|-------------|---------|-------------|
| vCPU | 1 core | 1–2 core |
| RAM | 512 MB | 1 GB |
| Storage | 10 GB SSD | 20 GB SSD |
| Traffic/bln | 10.000 | 50.000 |

Paket VPS Lite HostIDMurah (Rp 49.000/bln) sudah mencukupi untuk kebutuhan ini.

### Toko Online (WooCommerce / OpenCart)

| Spesifikasi | Minimum | Rekomendasi |
|-------------|---------|-------------|
| vCPU | 2 core | 2–4 core |
| RAM | 2 GB | 4 GB |
| Storage | 30 GB SSD | 50 GB SSD |
| Traffic/bln | 50.000 | 200.000 |

### Aplikasi API atau Backend

Bergantung pada kompleksitas logika bisnis dan jumlah request bersamaan. Untuk startup awal, 2 vCPU dan 2 GB RAM biasanya cukup dengan kemampuan scale-up sesuai kebutuhan.

### Game Server (Minecraft, CS, dll.)

Game server sangat intensif terhadap CPU dan RAM. Minecraft dengan 20 pemain butuh minimal 4 GB RAM. Gunakan VPS dengan clock speed tinggi, bukan hanya jumlah core.

### Trading Forex (MetaTrader)

MetaTrader 4/5 berjalan di Windows Server. Cukup dengan 1–2 vCPU dan 2 GB RAM. Utamakan koneksi jaringan yang stabil dan latensi rendah ke broker.

## Tips Praktis

- **Mulai dari kecil, scale-up saat dibutuhkan** — lebih mudah upgrade daripada downgrade
- **Monitor penggunaan RAM** di bulan pertama untuk mengetahui baseline yang sesungguhnya
- **Jangan terlalu menghemat RAM** — swap disk 10x lebih lambat dari RAM
- **SSD NVMe wajib** untuk database aktif dan aplikasi web modern
- **Konsultasikan ke tim kami** jika tidak yakin — gratis via WhatsApp
    `,
  },
  "proteksi-ddos-apa-dan-bagaimana": {
    title: "Proteksi DDoS: Apa Itu dan Bagaimana HostIDMurah Melindungi Server Anda",
    excerpt: "Penjelasan lengkap tentang serangan DDoS, dampaknya pada server, dan bagaimana sistem proteksi otomatis HostIDMurah menjaga uptime layanan Anda.",
    category: "Keamanan",
    readTime: "7 menit",
    date: "2026-03-10",
    author: "Tim HostIDMurah",
    content: `
## Apa Itu Serangan DDoS?

DDoS (Distributed Denial of Service) adalah serangan siber di mana ribuan hingga jutaan perangkat terinfeksi (botnet) secara bersamaan membanjiri server target dengan request palsu. Tujuannya satu: membuat server kewalahan dan tidak bisa melayani pengguna yang sah.

Berbeda dengan serangan DoS biasa yang berasal dari satu sumber, DDoS datang dari banyak sumber sekaligus sehingga jauh lebih sulit ditangani.

## Jenis-jenis Serangan DDoS

### Volumetric Attack (Layer 3/4)

Serangan paling umum — membanjiri jaringan dengan traffic dalam jumlah sangat besar (ratusan Gbps). Contoh: UDP Flood, ICMP Flood, DNS Amplification.

### Protocol Attack (Layer 4)

Mengeksploitasi kelemahan protokol jaringan seperti TCP/IP. Contoh: SYN Flood yang menghabiskan kapasitas koneksi server.

### Application Layer Attack (Layer 7)

Serangan paling berbahaya karena meniru perilaku pengguna nyata. Contoh: HTTP Flood yang membanjiri endpoint tertentu dengan request HTTP yang valid secara sintaks.

## Dampak DDoS pada Server yang Tidak Terlindungi

Tanpa proteksi, serangan DDoS bisa menyebabkan:

- **Downtime total** — server tidak bisa diakses sama sekali
- **Kerugian bisnis** — toko online, aplikasi, atau API tidak bisa beroperasi
- **Reputasi rusak** — pelanggan kehilangan kepercayaan
- **Biaya bandwidth meledak** — traffic palsu dihitung sebagai penggunaan bandwidth
- **Dampak ke server lain** — di lingkungan shared, satu server terserang bisa mengganggu tetangga

## Bagaimana HostIDMurah Melindungi Server Anda

### 1. Scrubbing Center Otomatis

Traffic yang masuk ke infrastruktur HostIDMurah pertama-tama diperiksa oleh scrubbing center. Sistem kami membedakan traffic sah dari traffic serangan berdasarkan pola, frekuensi, dan karakteristik paket secara real-time.

### 2. Proteksi Layer 3, 4, dan 7

Kami mengimplementasikan proteksi di semua lapisan:

- **Layer 3/4:** Filter volumetric dan protocol attack di level jaringan sebelum menyentuh server
- **Layer 7:** Rate limiting dan analisis pola HTTP untuk menangkal application layer attack

### 3. Mitigasi Otomatis Tanpa Intervensi Manual

Begitu serangan terdeteksi, sistem mitigasi aktif secara otomatis dalam hitungan detik — tanpa perlu menunggu tim teknis. Server Anda tetap online selama proses mitigasi berlangsung.

### 4. Kapasitas Mitigasi Besar

Infrastruktur kami dirancang untuk menyerap serangan berskala besar. Kapasitas ini terus ditingkatkan seiring berkembangnya jaringan HostIDMurah.

## Tips Tambahan untuk Keamanan Server Anda

Meski proteksi DDoS sudah aktif, ada langkah tambahan yang bisa Anda lakukan:

- **Gunakan Cloudflare** sebagai CDN dan WAF (Web Application Firewall) di depan server
- **Batasi rate limiting** di level aplikasi untuk endpoint sensitif seperti login dan API
- **Aktifkan firewall** di dalam server (UFW atau iptables) untuk menutup port yang tidak perlu
- **Pantau traffic** secara berkala — lonjakan traffic mendadak bisa jadi tanda awal serangan

## Kesimpulan

Serangan DDoS bukan hanya ancaman untuk perusahaan besar — bisnis kecil dan menengah pun sering menjadi target. Dengan HostIDMurah, proteksi DDoS aktif otomatis di semua paket tanpa biaya tambahan, sehingga Anda bisa fokus pada bisnis tanpa khawatir server tiba-tiba down.
    `,
  },
  "backup-vps-dengan-rsync": {
    title: "Cara Backup VPS Otomatis dengan Rsync dan Cron Job",
    excerpt: "Lindungi data server Anda dengan backup otomatis menggunakan rsync. Panduan setup cron job untuk backup harian, mingguan, dan bulanan.",
    category: "Tutorial",
    readTime: "10 menit",
    date: "2026-03-05",
    author: "Tim HostIDMurah",
    content: `
## Mengapa Backup Itu Krusial

Hardware bisa rusak tiba-tiba, manusia bisa salah hapus file, ransomware bisa mengenkripsi data Anda. Tidak ada sistem yang 100% kebal dari kegagalan. Backup yang rutin dan teruji adalah satu-satunya jaring pengaman yang benar-benar bisa diandalkan.

Aturan umum yang diikuti profesional IT: **aturan 3-2-1** — 3 salinan data, di 2 media berbeda, dengan 1 salinan di lokasi terpisah (offsite).

## Apa Itu Rsync?

Rsync adalah tool sinkronisasi file yang sangat efisien. Keunggulannya dibanding metode backup biasa:

- Hanya mentransfer bagian file yang berubah (incremental), bukan file penuh
- Mendukung kompresi data saat transfer
- Bisa berjalan melalui SSH untuk keamanan
- Tersedia di semua distribusi Linux secara default

## Skenario Backup yang Akan Kita Setup

Kita akan membuat script backup yang:
- Backup harian: 7 hari terakhir (rolling)
- Backup mingguan: 4 minggu terakhir
- Backup bulanan: 3 bulan terakhir
- Transfer ke storage server terpisah via SSH

## Prasyarat

- VPS sumber (yang datanya ingin dibackup)
- Server atau storage tujuan backup (bisa VPS kedua, NAS, atau storage cloud yang mount via SFTP)
- Akses SSH tanpa password (key-based authentication) antara dua server

## Langkah 1 — Setup SSH Key Authentication

Di VPS sumber, buat SSH key jika belum ada:

\`\`\`bash
ssh-keygen -t ed25519 -C "backup-key"
\`\`\`

Copy public key ke server tujuan backup:

\`\`\`bash
ssh-copy-id backup-user@IP_SERVER_TUJUAN
\`\`\`

Test koneksi tanpa password:

\`\`\`bash
ssh backup-user@IP_SERVER_TUJUAN "echo koneksi berhasil"
\`\`\`

## Langkah 2 — Buat Script Backup

\`\`\`bash
sudo nano /usr/local/bin/backup-vps.sh
\`\`\`

Isi script:

\`\`\`bash
#!/bin/bash

# Konfigurasi
BACKUP_USER="backup-user"
BACKUP_HOST="IP_SERVER_TUJUAN"
BACKUP_BASE="/backup/vps-saya"
SOURCE_DIRS="/var/www /etc /home"
DATE=$(date +%Y-%m-%d)
DAY_OF_WEEK=$(date +%u)
DAY_OF_MONTH=$(date +%d)
LOG="/var/log/backup-vps.log"

echo "[$DATE $(date +%H:%M)] Memulai backup..." >> $LOG

# Tentukan tujuan backup
if [ "$DAY_OF_MONTH" = "01" ]; then
    DEST="$BACKUP_BASE/monthly/$DATE"
elif [ "$DAY_OF_WEEK" = "7" ]; then
    DEST="$BACKUP_BASE/weekly/$DATE"
else
    DEST="$BACKUP_BASE/daily/$DATE"
fi

# Jalankan rsync
rsync -avz --delete \
    --exclude="*.tmp" \
    --exclude="*.log" \
    --exclude="node_modules/" \
    --exclude=".git/" \
    -e "ssh -i /root/.ssh/id_ed25519" \
    $SOURCE_DIRS \
    $BACKUP_USER@$BACKUP_HOST:$DEST \
    >> $LOG 2>&1

if [ $? -eq 0 ]; then
    echo "[$DATE $(date +%H:%M)] Backup selesai: $DEST" >> $LOG
else
    echo "[$DATE $(date +%H:%M)] BACKUP GAGAL!" >> $LOG
fi

# Hapus backup daily lebih dari 7 hari
ssh -i /root/.ssh/id_ed25519 $BACKUP_USER@$BACKUP_HOST \
    "find $BACKUP_BASE/daily -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \;" 2>/dev/null

# Hapus backup weekly lebih dari 28 hari
ssh -i /root/.ssh/id_ed25519 $BACKUP_USER@$BACKUP_HOST \
    "find $BACKUP_BASE/weekly -maxdepth 1 -type d -mtime +28 -exec rm -rf {} \;" 2>/dev/null

# Hapus backup monthly lebih dari 90 hari
ssh -i /root/.ssh/id_ed25519 $BACKUP_USER@$BACKUP_HOST \
    "find $BACKUP_BASE/monthly -maxdepth 1 -type d -mtime +90 -exec rm -rf {} \;" 2>/dev/null
\`\`\`

Berikan izin eksekusi:

\`\`\`bash
sudo chmod +x /usr/local/bin/backup-vps.sh
\`\`\`

## Langkah 3 — Jadwalkan dengan Cron Job

\`\`\`bash
sudo crontab -e
\`\`\`

Tambahkan baris berikut:

\`\`\`bash
# Backup setiap hari pukul 02:00 dini hari
0 2 * * * /usr/local/bin/backup-vps.sh
\`\`\`

## Langkah 4 — Test dan Verifikasi

Jalankan script secara manual untuk memastikan berjalan dengan benar:

\`\`\`bash
sudo /usr/local/bin/backup-vps.sh
cat /var/log/backup-vps.log
\`\`\`

Verifikasi file backup tersimpan di server tujuan:

\`\`\`bash
ssh backup-user@IP_SERVER_TUJUAN "ls -la /backup/vps-saya/daily/"
\`\`\`

## Tips Penting

- **Uji restore secara berkala** — backup yang tidak pernah diuji adalah backup yang tidak bisa diandalkan
- **Monitor log backup** — cek /var/log/backup-vps.log secara rutin atau setup notifikasi email jika backup gagal
- **Enkripsi backup sensitif** — gunakan gpg untuk mengenkripsi backup yang berisi data sensitif sebelum ditransfer
- **Backup database secara terpisah** — untuk MySQL/PostgreSQL, gunakan mysqldump atau pg_dump terlebih dahulu, baru rsync file dump-nya
    `,
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Simple markdown-like renderer for the static content
function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-xl font-bold mt-8 mb-3">{line.slice(3)}</h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-lg font-semibold mt-6 mb-2">{line.slice(4)}</h3>
      );
    } else if (line.startsWith("```")) {
      const lang = line.slice(3);
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} className="my-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
    } else if (line.startsWith("- **")) {
      elements.push(
        <li key={i} className="ml-4 mb-1 text-sm leading-relaxed list-disc list-inside"
          dangerouslySetInnerHTML={{
            __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          }}
        />
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={i} className="ml-4 mb-1 text-sm leading-relaxed list-disc list-inside">{line.slice(2)}</li>
      );
    } else if (line.startsWith("| ")) {
      // Simple table
      const tableLines: string[] = [line];
      i++;
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!lines[i].match(/^\|[-| ]+\|$/)) {
          tableLines.push(lines[i]);
        }
        i++;
      }
      const [header, ...rows] = tableLines;
      const headers = header.split("|").filter(Boolean).map(h => h.trim());
      elements.push(
        <div key={i} className="my-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                {headers.map((h, j) => (
                  <th key={j} className="py-2 px-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, j) => (
                <tr key={j} className="border-b border-border/50">
                  {row.split("|").filter(Boolean).map((cell, k) => (
                    <td key={k} className="py-2 px-3 text-muted-foreground">{cell.trim()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    } else if (line.trim() !== "") {
      elements.push(
        <p key={i} className="mb-4 leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{
            __html: line
              .replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>")
              .replace(/`(.*?)`/g, "<code class='bg-muted px-1 py-0.5 rounded text-sm'>$1</code>")
          }}
        />
      );
    }
    i++;
  }
  return elements;
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) return { title: "Artikel tidak ditemukan" };
  return {
    title: `${article.title} | Blog HostIDMurah`,
    description: article.excerpt,
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = articles[slug];

  if (!article) notFound();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Back link */}
        <Link
          href="/blog"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "mb-8 -ml-2 gap-1.5"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Blog
        </Link>

        {/* Article header */}
        <div className="mb-8">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            {article.category}
          </span>
          <h1 className="text-3xl font-bold leading-tight">{article.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(article.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {article.readTime} baca
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-8" />

        {/* Article content */}
        <article className="prose-sm max-w-none">
          {renderContent(article.content)}
        </article>

        {/* Divider */}
        <div className="h-px bg-border my-10" />

        {/* CTA */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-6 text-center">
          <h3 className="font-bold text-lg">Siap memulai dengan VPS?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Dapatkan VPS berkualitas mulai Rp 49.000/bulan dengan uptime 99.9%.
          </p>
          <div className="mt-4 flex justify-center gap-3 flex-wrap">
            <Link href="/vps" className={cn(buttonVariants({ size: "sm" }))}>
              Lihat Paket VPS
            </Link>
            <a
              href="https://wa.me/6285212348518"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Tanya via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
