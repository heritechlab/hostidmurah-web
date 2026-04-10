import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | HostIDMurah",
  description: "Kebijakan privasi HostIDMurah — bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi pelanggan.",
};

const lastUpdated = "1 April 2026";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Header */}
        <div className="mb-10 pb-8 border-b border-border">
          <h1 className="text-3xl font-bold">Kebijakan Privasi</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Terakhir diperbarui: {lastUpdated}
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            HostIDMurah menghargai privasi setiap pelanggan dan pengguna layanan kami. Dokumen ini menjelaskan
            jenis data apa yang kami kumpulkan, bagaimana data tersebut digunakan, dan hak-hak Anda sebagai pengguna.
            Dengan menggunakan layanan HostIDMurah, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini.
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Data yang Kami Kumpulkan</h2>
            <p className="mb-3">Kami mengumpulkan data dalam beberapa kategori berikut:</p>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-1">a. Data Akun</h3>
                <p>
                  Saat Anda mendaftar, kami mengumpulkan nama lengkap, alamat email, nomor WhatsApp (opsional),
                  dan kata sandi yang disimpan dalam bentuk terenkripsi. Jika Anda mendaftar melalui Google OAuth,
                  kami menerima nama dan email dari akun Google Anda.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">b. Data Transaksi</h3>
                <p>
                  Setiap pemesanan layanan mencatat jenis layanan, spesifikasi, durasi, jumlah pembayaran,
                  metode pembayaran yang dipilih, dan status transaksi. Kami tidak menyimpan data kartu kredit
                  atau informasi perbankan secara langsung.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">c. Data Teknis</h3>
                <p>
                  Kami secara otomatis mencatat alamat IP, jenis browser, sistem operasi, halaman yang dikunjungi,
                  dan waktu akses untuk keperluan keamanan, pencegahan penyalahgunaan, dan analisis performa layanan.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">d. Komunikasi Dukungan</h3>
                <p>
                  Pesan yang Anda kirim melalui tiket dukungan, formulir kontak, atau WhatsApp disimpan
                  untuk keperluan penyelesaian masalah dan peningkatan layanan.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Penggunaan Data</h2>
            <p className="mb-3">Data yang kami kumpulkan digunakan untuk tujuan berikut:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Memproses pendaftaran akun dan verifikasi identitas</li>
              <li>Menyediakan, mengelola, dan memperbarui layanan yang Anda pesan</li>
              <li>Memproses pembayaran dan mengirimkan konfirmasi transaksi</li>
              <li>Mengirimkan notifikasi layanan penting seperti invoice, peringatan jatuh tempo, dan pembaruan status server</li>
              <li>Merespons pertanyaan dan permintaan dukungan teknis</li>
              <li>Mendeteksi dan mencegah aktivitas penipuan atau penyalahgunaan layanan</li>
              <li>Meningkatkan performa dan stabilitas infrastruktur kami</li>
              <li>Memenuhi kewajiban hukum yang berlaku di wilayah Republik Indonesia</li>
            </ul>
            <p className="mt-3">
              Kami <strong className="text-foreground">tidak</strong> menjual, menyewakan, atau memperdagangkan
              data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Berbagi Data dengan Pihak Ketiga</h2>
            <p className="mb-3">
              Dalam kondisi tertentu, kami mungkin berbagi data Anda dengan pihak ketiga yang terpercaya:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                <strong className="text-foreground">Penyedia infrastruktur:</strong> datacenter dan penyedia jaringan
                yang mendukung operasional server kami, terikat oleh perjanjian kerahasiaan.
              </li>
              <li>
                <strong className="text-foreground">Gateway pembayaran:</strong> prosesor pembayaran pihak ketiga
                yang memproses transaksi, sesuai standar keamanan PCI-DSS.
              </li>
              <li>
                <strong className="text-foreground">Otoritas hukum:</strong> jika diwajibkan oleh hukum, peraturan,
                atau perintah pengadilan yang sah di Republik Indonesia.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Keamanan Data</h2>
            <p className="mb-3">
              Kami menerapkan langkah-langkah teknis dan organisasi untuk melindungi data Anda, antara lain:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Enkripsi data sensitif menggunakan standar bcrypt untuk kata sandi</li>
              <li>Koneksi terenkripsi HTTPS/TLS untuk semua komunikasi antara browser dan server</li>
              <li>Token JWT dengan masa berlaku terbatas untuk sesi pengguna</li>
              <li>Pembatasan akses internal — hanya staf yang berwenang yang dapat mengakses data pelanggan</li>
              <li>Audit log untuk setiap akses dan perubahan data sensitif</li>
            </ul>
            <p className="mt-3">
              Meski demikian, tidak ada sistem yang sepenuhnya kebal dari risiko. Kami menyarankan Anda
              menggunakan kata sandi yang kuat dan tidak membagikan kredensial akun kepada siapapun.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Cookies dan Teknologi Pelacakan</h2>
            <p>
              Kami menggunakan cookies sesi untuk menjaga status login Anda dan cookies preferensi untuk
              menyimpan pengaturan tampilan seperti mode terang/gelap. Kami tidak menggunakan cookies
              pelacakan pihak ketiga untuk iklan bertarget. Anda dapat menonaktifkan cookies melalui
              pengaturan browser, namun beberapa fungsi layanan mungkin tidak bekerja dengan optimal.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Penyimpanan dan Retensi Data</h2>
            <p>
              Data akun dan transaksi disimpan selama akun Anda aktif dan hingga <strong className="text-foreground">5 tahun</strong> setelah
              penutupan akun, sesuai ketentuan perpajakan dan audit keuangan yang berlaku. Data log teknis
              disimpan maksimal <strong className="text-foreground">90 hari</strong>. Anda dapat mengajukan
              penghapusan data lebih awal dengan menghubungi tim kami, kecuali data yang wajib disimpan
              berdasarkan peraturan perundang-undangan.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Hak-hak Anda</h2>
            <p className="mb-3">Sebagai pengguna layanan kami, Anda memiliki hak untuk:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-foreground">Akses:</strong> meminta salinan data pribadi yang kami simpan tentang Anda</li>
              <li><strong className="text-foreground">Koreksi:</strong> memperbarui atau memperbaiki data yang tidak akurat melalui halaman profil</li>
              <li><strong className="text-foreground">Penghapusan:</strong> mengajukan penghapusan data setelah masa retensi minimum terpenuhi</li>
              <li><strong className="text-foreground">Portabilitas:</strong> meminta ekspor data Anda dalam format yang dapat dibaca mesin</li>
              <li><strong className="text-foreground">Keberatan:</strong> menolak pemrosesan data untuk tujuan pemasaran langsung</li>
            </ul>
            <p className="mt-3">
              Untuk menggunakan hak-hak tersebut, hubungi kami di{" "}
              <a href="mailto:support@hostidmurah.web.id" className="text-primary hover:underline">
                support@hostidmurah.web.id
              </a>. Kami akan merespons dalam waktu maksimal 14 hari kerja.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Layanan Pihak Ketiga</h2>
            <p>
              Website kami menggunakan Cloudflare Turnstile untuk verifikasi pengguna dan perlindungan dari
              bot. Layanan ini memproses data sesuai dengan kebijakan privasi Cloudflare. Kami juga
              menggunakan Google OAuth sebagai opsi autentikasi alternatif; penggunaan layanan ini tunduk
              pada kebijakan privasi Google.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Perubahan Kebijakan Privasi</h2>
            <p>
              Kami dapat memperbarui kebijakan ini sewaktu-waktu. Perubahan material akan diberitahukan
              melalui email terdaftar atau notifikasi di dashboard setidaknya <strong className="text-foreground">14 hari</strong> sebelum
              berlaku. Penggunaan layanan yang berkelanjutan setelah perubahan berlaku dianggap sebagai
              persetujuan terhadap kebijakan yang diperbarui.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Hubungi Kami</h2>
            <p>
              Jika ada pertanyaan, kekhawatiran, atau permintaan terkait kebijakan privasi ini, silakan
              hubungi kami melalui:
            </p>
            <div className="mt-3 space-y-1">
              <p>Email: <a href="mailto:support@hostidmurah.web.id" className="text-primary hover:underline">support@hostidmurah.web.id</a></p>
              <p>WhatsApp: <a href="https://wa.me/6285212348518" className="text-primary hover:underline">+62 852-1234-8518</a></p>
              <p>Alamat: Jakarta Pusat, Indonesia</p>
            </div>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 text-sm">
          <Link href="/terms" className="text-primary hover:underline">Syarat &amp; Ketentuan</Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground">Hubungi Kami</Link>
          <Link href="/" className="text-muted-foreground hover:text-foreground">Kembali ke Beranda</Link>
        </div>
      </div>
    </main>
  );
}
