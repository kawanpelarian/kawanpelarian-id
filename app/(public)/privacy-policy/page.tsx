import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: `Kebijakan privasi ${siteConfig.name} — gimana kami mengumpulkan, menggunakan, dan menjaga data kamu.`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-16 lg:px-8">
      <div className="space-y-2">
        <h1 className="font-title text-3xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite">Kebijakan Privasi</h1>
        <p className="text-sm text-muted-foreground">Terakhir diperbarui: 20 Agustus 2026</p>
      </div>

      <div className="space-y-8 text-[15px] text-muted-foreground">
        <section className="space-y-2">
          <p>{siteConfig.name} ("kami") menghargai privasi kamu. Halaman ini menjelaskan data apa yang kami kumpulkan, gimana kami menggunakannya, dan hak kamu sebagai pengguna.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">1. Data yang Kami Kumpulkan</h2>
          <p>Saat kamu daftar dan menggunakan platform ini, kami mengumpulkan:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Nama lengkap</li>
            <li>Alamat email</li>
            <li>Nomor HP/WhatsApp</li>
            <li>Tanggal lahir (opsional, bisa kamu isi sendiri lewat halaman Profil)</li>
            <li>Password (kalau daftar manual), disimpan dalam bentuk hash, gak pernah dalam bentuk asli</li>
            <li>Riwayat pendaftaran dan kehadiran event</li>
            <li>Riwayat pembelian merchandise dan bukti transfer yang kamu upload saat checkout</li>
          </ul>
          <p>
            Kalau kamu daftar/masuk lewat <strong>Login dengan Google</strong>, kami cuma nerima nama dan email dari akun Google kamu — kami gak pernah nyimpen atau punya akses ke password Google kamu sama sekali. Nomor HP dan data lain
            tetap bisa kamu lengkapin belakangan lewat halaman Profil.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">2. Gimana Kami Menggunakan Data Kamu</h2>
          <ul className="ml-4 list-disc space-y-1">
            <li>Memproses pendaftaran akun dan event</li>
            <li>Mengirim email konfirmasi terkait event yang kamu ikuti (tiket pendaftaran dan check-in)</li>
            <li>Menampilkan nama kamu di daftar peserta event (kalau kamu daftar)</li>
            <li>Memproses pesanan merchandise dan verifikasi pembayaran</li>
            <li>Menampilkan statistik komunitas (jumlah total member) secara agregat/anonim</li>
          </ul>
          <p>
            Kami <strong>gak pernah</strong> menjual atau membagikan data pribadi kamu ke pihak ketiga buat tujuan komersial.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">3. Layanan Pihak Ketiga</h2>
          <p>Kami menggunakan beberapa layanan pihak ketiga buat menjalankan platform ini:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <strong>Google Sign-In</strong> — opsi login pakai akun Google, dikelola langsung sama Google sesuai kebijakan privasi mereka
            </li>
            <li>
              <strong>Cloudinary</strong> — penyimpanan foto cover event, galeri, gambar produk, dan bukti transfer
            </li>
            <li>
              <strong>Resend</strong> — pengiriman email transactional (tiket pendaftaran, notifikasi check-in)
            </li>
            <li>
              <strong>Vercel Analytics</strong> — analitik pengunjung, bersifat anonim/agregat, gak melacak identitas personal
            </li>
            <li>
              <strong>OpenStreetMap</strong> — penyediaan peta buat menampilkan rute lari
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">4. Cookie &amp; Sesi Login</h2>
          <p>Kami menggunakan cookie buat menjaga sesi login kamu tetap aktif. Cookie ini bersifat teknis (bukan buat tracking/iklan) dan otomatis kehapus saat kamu logout atau sesi kadaluarsa.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">5. Hak Kamu</h2>
          <p>Kamu berhak buat:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Melihat dan mengubah data diri kamu lewat halaman Profil</li>
            <li>Set atau ganti password kamu sendiri, kapanpun, termasuk kalau awalnya daftar lewat Google</li>
            <li>Meminta penghapusan akun dan seluruh data terkait</li>
            <li>Menghubungi kami kalau ada pertanyaan soal data kamu</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">6. Keamanan Data</h2>
          <p>Password kamu disimpan dalam bentuk hash (bukan teks asli) dan gak bisa dibaca siapapun, termasuk admin. Kami menerapkan langkah wajar buat melindungi data kamu dari akses gak sah.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">7. Perubahan Kebijakan</h2>
          <p>Kebijakan ini bisa diperbarui dari waktu ke waktu. Perubahan signifikan akan diinformasikan lewat platform ini.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">8. Kontak</h2>
          <p>
            Ada pertanyaan soal privasi atau data kamu? Hubungi kami lewat Instagram{' '}
            <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="font-medium text-primaryBlack underline dark:text-primaryWhite">
              @kawanpelarian
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
