import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan | HostIDMurah",
  description: "Syarat dan ketentuan penggunaan layanan HostIDMurah — hak, kewajiban, dan aturan yang berlaku bagi seluruh pengguna.",
};

const lastUpdated = "1 April 2026";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Header */}
        <div className="mb-10 pb-8 border-b border-border">
          <h1 className="text-3xl font-bold">Syarat &amp; Ketentuan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Terakhir diperbarui: {lastUpdated}
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Dokumen ini mengatur hubungan antara HostIDMurah dan setiap pengguna yang mengakses atau
            menggunakan layanan kami. Harap baca dengan seksama sebelum mendaftar atau melakukan pemesanan.
            Dengan menggunakan layanan HostIDMurah, Anda menyatakan telah membaca, memahami, dan menyetujui
            seluruh ketentuan yang tercantum di bawah ini.
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Definisi</h2>
            <ul className="space-y-2">
              <li><strong className="text-foreground">"HostIDMurah"</strong> merujuk pada penyedia layanan yang mengelola platform hostidmurah.web.id.</li>
              <li><strong className="text-foreground">"Pengguna"</strong> adalah individu atau entitas yang mendaftar dan menggunakan layanan HostIDMurah.</li>
              <li><strong className="text-foreground">"Layanan"</strong> mencakup seluruh produk yang ditawarkan, termasuk VPS, dedicated server, shared hosting, dan layanan terkait.</li>
              <li><strong className="text-foreground">"Akun"</strong> adalah profil terdaftar yang memberikan akses kepada Pengguna untuk memesan dan mengelola layanan.</li>
              <li><strong className="text-foreground">"Panel"</strong> adalah dashboard online yang disediakan untuk mengelola layanan yang aktif.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Pendaftaran dan Akun</h2>
            <ul className="space-y-2.5 list-disc list-inside">
              <li>Pendaftaran terbuka untuk individu berusia minimal 17 tahun atau entitas bisnis yang sah secara hukum di Indonesia.</li>
              <li>Anda bertanggung jawab penuh atas keamanan kredensial akun Anda. Jangan berbagi username dan kata sandi dengan siapapun.</li>
              <li>Setiap aktivitas yang dilakukan melalui akun Anda dianggap sebagai tindakan Anda sendiri, kecuali Anda segera melaporkan akses tidak sah kepada kami.</li>
              <li>HostIDMurah berhak menangguhkan atau menghapus akun yang terbukti memberikan informasi palsu saat pendaftaran.</li>
              <li>Satu individu atau entitas hanya diperkenankan memiliki satu akun aktif, kecuali mendapat izin tertulis dari kami.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Layanan dan Pemesanan</h2>
            <ul className="space-y-2.5 list-disc list-inside">
              <li>Semua layanan bersifat berlangganan dengan periode yang dipilih saat pemesanan (1, 3, 6, atau 12 bulan).</li>
              <li>Layanan diaktifkan setelah pembayaran dikonfirmasi, umumnya dalam 5–60 menit di hari kerja.</li>
              <li>Spesifikasi layanan (CPU, RAM, storage) sesuai dengan yang tercantum di halaman produk pada saat pemesanan.</li>
              <li>HostIDMurah berhak mengubah spesifikasi layanan dengan pemberitahuan minimal 30 hari, dan memberikan kompensasi jika ada penurunan spesifikasi.</li>
              <li>Permintaan konfigurasi khusus di luar paket standar dapat diajukan melalui tiket dukungan dan akan dikenakan biaya tambahan sesuai kesepakatan.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Pembayaran dan Penagihan</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-1">a. Metode Pembayaran</h3>
                <p>
                  Kami menerima transfer bank (BCA, Mandiri, BNI, BRI) dan dompet digital (QRIS, GoPay, OVO, Dana).
                  Konfirmasi pembayaran dilakukan otomatis atau manual melalui tiket jika diperlukan.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">b. Harga dan Pajak</h3>
                <p>
                  Harga yang tercantum adalah harga final dalam Rupiah Indonesia (IDR). HostIDMurah berhak
                  menyesuaikan harga layanan dengan pemberitahuan minimal 14 hari sebelum berlaku, dan tidak
                  berlaku retroaktif untuk periode yang sudah dibayar.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">c. Perpanjangan</h3>
                <p>
                  Layanan tidak diperpanjang otomatis. Pengguna akan menerima notifikasi 14, 7, dan 3 hari
                  sebelum jatuh tempo melalui email dan WhatsApp (jika nomor terdaftar). Layanan yang tidak
                  diperpanjang dalam 7 hari setelah jatuh tempo akan dinonaktifkan, dan data dapat dihapus
                  permanen setelah 14 hari.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">d. Refund</h3>
                <p>
                  Kami menyediakan garansi uang kembali dalam <strong className="text-foreground">7 hari pertama</strong> untuk
                  pelanggan baru yang tidak puas, dengan syarat tidak ada penggunaan sumber daya yang signifikan.
                  Refund diproses dalam 3–5 hari kerja ke rekening asal pembayaran. Setelah periode ini, pembayaran
                  tidak dapat dikembalikan kecuali ada kegagalan layanan dari pihak kami.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Penggunaan yang Diizinkan</h2>
            <p className="mb-3">Layanan HostIDMurah boleh digunakan untuk:</p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Website, aplikasi web, dan e-commerce yang sah</li>
              <li>Database, API backend, dan microservices</li>
              <li>Development, testing, dan staging environment</li>
              <li>Game server untuk penggunaan pribadi atau komunitas</li>
              <li>VPN pribadi untuk keamanan koneksi</li>
              <li>Aplikasi bisnis seperti ERP, CRM, dan sistem manajemen</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Penggunaan yang Dilarang</h2>
            <p className="mb-3">
              Pelanggaran terhadap ketentuan berikut dapat mengakibatkan penangguhan atau penghentian
              layanan tanpa pengembalian dana:
            </p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Mengirimkan spam, phishing, atau email massal tanpa izin penerima</li>
              <li>Meluncurkan serangan DDoS, brute force, port scanning, atau aktivitas hacking terhadap pihak lain</li>
              <li>Hosting konten yang melanggar hak cipta, pornografi ilegal, atau konten yang dilarang hukum Indonesia</li>
              <li>Mining cryptocurrency tanpa izin tertulis dari HostIDMurah</li>
              <li>Menjual kembali akses layanan kepada pihak lain tanpa perjanjian reseller yang disepakati</li>
              <li>Menggunakan sumber daya server secara berlebihan sehingga mengganggu pengguna lain di infrastruktur bersama</li>
              <li>Setiap aktivitas yang melanggar hukum yang berlaku di Republik Indonesia</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Uptime dan SLA</h2>
            <p className="mb-3">
              HostIDMurah menjamin ketersediaan layanan (<em>uptime</em>) sebesar <strong className="text-foreground">99,9%</strong> per
              bulan, tidak termasuk:
            </p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Pemeliharaan terjadwal dengan pemberitahuan minimal 48 jam sebelumnya</li>
              <li>Gangguan akibat force majeure (bencana alam, gangguan listrik skala besar, dll.)</li>
              <li>Downtime yang disebabkan oleh tindakan atau konfigurasi Pengguna sendiri</li>
              <li>Serangan DDoS yang melampaui kapasitas mitigasi</li>
            </ul>
            <p className="mt-3">
              Jika uptime di bawah 99,9% akibat kesalahan kami, Pengguna berhak mengajukan kompensasi
              berupa perpanjangan layanan sesuai durasi downtime yang terverifikasi.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Dukungan Teknis</h2>
            <ul className="space-y-2.5 list-disc list-inside">
              <li>Dukungan teknis tersedia 24/7 melalui sistem tiket di dashboard dan WhatsApp.</li>
              <li>Waktu respons target: tiket prioritas tinggi dalam 2 jam, umum dalam 8 jam di hari kerja.</li>
              <li>Dukungan mencakup masalah infrastruktur dan konektivitas server. Konfigurasi aplikasi di dalam server adalah tanggung jawab Pengguna, namun kami dapat membantu atas dasar best effort.</li>
              <li>Permintaan yang memerlukan waktu pengerjaan lebih dari 30 menit dapat dikenakan biaya jasa sesuai kesepakatan.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Backup dan Data</h2>
            <p className="mb-3">
              HostIDMurah melakukan backup infrastruktur secara berkala untuk keperluan pemulihan sistem.
              Namun, Pengguna bertanggung jawab penuh atas backup data di dalam server mereka sendiri.
              Kami sangat menyarankan Pengguna:
            </p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Melakukan backup data secara rutin ke lokasi yang berbeda (off-site backup)</li>
              <li>Tidak mengandalkan infrastruktur HostIDMurah sebagai satu-satunya sumber backup data penting</li>
              <li>Menguji prosedur pemulihan data secara berkala</li>
            </ul>
            <p className="mt-3">
              HostIDMurah tidak bertanggung jawab atas kehilangan data yang disebabkan oleh kegagalan hardware,
              kesalahan konfigurasi Pengguna, atau penghapusan layanan akibat keterlambatan pembayaran.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Batasan Tanggung Jawab</h2>
            <p>
              HostIDMurah tidak bertanggung jawab atas kerugian tidak langsung, kehilangan pendapatan, atau
              kerusakan data yang timbul dari penggunaan atau ketidakmampuan penggunaan layanan kami, kecuali
              disebabkan oleh kelalaian berat dari pihak HostIDMurah yang terbukti secara hukum. Total
              tanggung jawab HostIDMurah dalam kondisi apapun dibatasi sebesar nilai layanan yang telah dibayar
              oleh Pengguna dalam 3 bulan terakhir.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Penangguhan dan Penghentian</h2>
            <p className="mb-3">HostIDMurah berhak menangguhkan atau menghentikan layanan jika:</p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Terdapat pelanggaran terhadap ketentuan penggunaan yang dilarang (Pasal 6)</li>
              <li>Pembayaran tidak dilakukan dalam 7 hari setelah jatuh tempo</li>
              <li>Layanan digunakan untuk aktivitas yang melanggar hukum</li>
              <li>Terdapat ancaman keamanan signifikan terhadap infrastruktur atau pengguna lain</li>
            </ul>
            <p className="mt-3">
              Pengguna dapat mengakhiri layanan kapan saja melalui dashboard. Tidak ada refund untuk periode
              yang belum terpakai kecuali memenuhi syarat garansi uang kembali yang tercantum pada Pasal 4d.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Perubahan Ketentuan</h2>
            <p>
              HostIDMurah berhak mengubah syarat dan ketentuan ini kapan saja. Perubahan yang bersifat
              material akan dikomunikasikan melalui email atau notifikasi dashboard minimal{" "}
              <strong className="text-foreground">14 hari</strong> sebelum berlaku. Penggunaan layanan yang
              berkelanjutan setelah perubahan tersebut berlaku merupakan persetujuan Anda terhadap ketentuan
              yang diperbarui.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">13. Hukum yang Berlaku</h2>
            <p>
              Syarat dan ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia.
              Setiap sengketa yang timbul akan diselesaikan terlebih dahulu melalui musyawarah. Jika
              penyelesaian secara musyawarah tidak berhasil dalam 30 hari, sengketa akan diselesaikan
              melalui Pengadilan Negeri Jakarta Pusat.
            </p>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">14. Hubungi Kami</h2>
            <p>
              Untuk pertanyaan terkait syarat dan ketentuan ini, hubungi kami:
            </p>
            <div className="mt-3 space-y-1">
              <p>Email: <a href="mailto:support@hostidmurah.web.id" className="text-primary hover:underline">support@hostidmurah.web.id</a></p>
              <p>WhatsApp: <a href="https://wa.me/6285212348518" className="text-primary hover:underline">+62 852-1234-8518</a></p>
            </div>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 text-sm">
          <Link href="/privacy" className="text-primary hover:underline">Kebijakan Privasi</Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground">Hubungi Kami</Link>
          <Link href="/" className="text-muted-foreground hover:text-foreground">Kembali ke Beranda</Link>
        </div>
      </div>
    </main>
  );
}
