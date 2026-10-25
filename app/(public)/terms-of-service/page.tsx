// app/(public)/terms-of-service/page.tsx
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description: `Syarat dan ketentuan penggunaan platform ${siteConfig.name}.`,
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-16 lg:px-8">
      <div className="space-y-2">
        <h1 className="font-title text-3xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite">Syarat &amp; Ketentuan</h1>
        <p className="text-sm text-muted-foreground">Terakhir diperbarui: 20 Agustus 2026</p>
      </div>

      <div className="space-y-8 text-[15px] text-muted-foreground">
        <section className="space-y-2">
          <p>Dengan mendaftar dan menggunakan platform {siteConfig.name}, kamu setuju sama syarat dan ketentuan di bawah ini. Baca baik-baik ya sebelum lanjut.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">1. Tentang Akun Kamu</h2>
          <ul className="ml-4 list-disc space-y-1">
            <li>Data yang kamu daftarin (nama, email, HP) harus data asli kamu sendiri</li>
            <li>Kamu bertanggung jawab jaga kerahasiaan password akun kamu</li>
            <li>1 orang cuma boleh punya 1 akun</li>
            <li>Kami berhak nonaktifkan/hapus akun yang kedapatan pakai data palsu atau disalahgunakan</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">2. Pendaftaran Event</h2>
          <ul className="ml-4 list-disc space-y-1">
            <li>Pendaftaran event bersifat gratis, kecuali dinyatakan lain</li>
            <li>Kuota terbatas, pendaftaran ditutup otomatis kalau udah penuh</li>
            <li>Check-in cuma bisa dilakukan pada hari-H event, langsung di lokasi lewat halaman &quot;Event Saya&quot;</li>
            <li>Kami berhak membatalkan/mengubah jadwal event dengan pemberitahuan sebelumnya</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">3. Pembelian Merchandise</h2>
          <p>{siteConfig.name} menyediakan merchandise (jersey, dll) yang bisa dipesan lewat platform ini. Dengan checkout, kamu setuju sama ketentuan berikut:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Pembayaran dilakukan manual lewat transfer bank ke rekening yang tertera, dan bukti transfer wajib diupload saat checkout</li>
            <li>Pesanan berstatus &quot;Menunggu Verifikasi&quot; sampai admin mengecek bukti transfer kamu. Verifikasi biasanya butuh waktu 1x24 jam, tergantung kesibukan panitia</li>
            <li>Kalau bukti transfer gak sesuai/gak valid, pesanan bisa ditolak. Stok yang sempat kepesan otomatis dikembalikan</li>
            <li>Kamu bisa membatalkan pesanan sendiri selama status masih &quot;Menunggu Verifikasi&quot;</li>
            <li>Harga dan stok bisa berubah sewaktu-waktu tanpa pemberitahuan sebelumnya</li>
            <li>Komplain soal ukuran, kualitas, atau kondisi barang wajib disampaikan maksimal 3 hari setelah barang diterima, lewat kontak di bagian bawah halaman ini</li>
            <li>Refund/penggantian barang dipertimbangkan kasus per kasus (misal: barang gak sesuai pesanan, cacat produksi) — bukan buat alasan &quot;berubah pikiran&quot; setelah pembayaran terverifikasi</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">4. Risiko Aktivitas Fisik</h2>
          <p>Lari adalah aktivitas fisik yang punya risiko cedera. Dengan ikut event {siteConfig.name}, kamu menyatakan:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Ikut serta atas kesadaran dan tanggung jawab pribadi</li>
            <li>Dalam kondisi fisik yang cukup sehat buat ikut lari santai</li>
            <li>{siteConfig.name} dan panitia gak bertanggung jawab atas cedera, kehilangan barang, atau kejadian tak terduga selama event berlangsung</li>
            <li>Kalau punya kondisi kesehatan tertentu, disaranin konsultasi dulu ke dokter sebelum ikut event</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">5. Dokumentasi &amp; Foto</h2>
          <p>
            Selama event berlangsung, panitia bisa mengambil foto/video dokumentasi yang melibatkan peserta. Dengan ikut event, kamu setuju dokumentasi tersebut boleh dipakai {siteConfig.name} buat keperluan promosi komunitas (galeri
            website, media sosial, dll), tanpa kompensasi apapun.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">6. Perilaku Peserta</h2>
          <p>Selama jadi bagian dari komunitas ini, kamu diharapkan buat:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Saling menghormati sesama peserta, panitia, dan warga sekitar rute lari</li>
            <li>Menjaga kebersihan dan ketertiban selama event</li>
            <li>Gak melakukan tindakan yang membahayakan diri sendiri atau orang lain</li>
            <li>
              Gak pamer atau meremehkan pace lari orang lain. {siteConfig.name} adalah komunitas lari santai buat semua kalangan — hargai dan hormati teman-teman yang baru mulai lari, karena semangat komunitas ini adalah kebersamaan, bukan
              kompetisi
            </li>
          </ul>
          <p>Pelanggaran serius bisa berujung larangan ikut event berikutnya, atas kebijakan panitia.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">7. Perubahan Ketentuan</h2>
          <p>Ketentuan ini bisa diperbarui dari waktu ke waktu. Perubahan signifikan akan diinformasikan lewat platform ini.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">8. Kontak</h2>
          <p>
            Ada pertanyaan soal syarat &amp; ketentuan ini? Hubungi kami lewat Instagram{' '}
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
