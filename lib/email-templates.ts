// lib/email-templates.ts
import { siteConfig } from '@/lib/site-config';

interface EmailWrapperOptions {
  badgeText: string;
  eventName: string;
  bodyHtml: string;
}

// Wrapper bareng: header gelap + logo putih + border putus-putus,
// dipakai sama-sama sama email tiket registrasi dan email check-in
// biar brand-nya konsisten.
function emailWrapper({ badgeText, eventName, bodyHtml }: EmailWrapperOptions): string {
  return `
    <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, sans-serif;">
      <div style="background: #162349; color: #ffffff; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <img
          src="${siteConfig.url}/images/logo-light.png"
          alt="${siteConfig.name}"
          height="32"
          style="height: 32px; width: auto; margin-bottom: 12px;"
        />
        <p style="margin: 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7;">
          ${badgeText}
        </p>
        <h1 style="margin: 8px 0 0; font-size: 22px; font-style: italic; text-transform: uppercase;">
          ${eventName}
        </h1>
      </div>

      <div style="border: 2px dashed #162349; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
        ${bodyHtml}
      </div>
    </div>
  `;
}

interface TicketEmailOptions {
  memberName: string;
  eventName: string;
  eventDateLabel: string;
  eventTime: string;
  meetingPoint: string;
}

export function getTicketEmailHtml({ memberName, eventName, eventDateLabel, eventTime, meetingPoint }: TicketEmailOptions): string {
  const body = `
    <p style="margin: 0 0 16px; font-size: 15px;">
      Halo <strong>${memberName}</strong>, kamu berhasil terdaftar! Simpan email ini
      sebagai pengingat. 🎟️
    </p>

    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
      <tr>
        <td style="padding: 6px 0; color: #737373;">📅 Tanggal</td>
        <td style="padding: 6px 0; text-align: right; font-weight: 600;">${eventDateLabel}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #737373;">⏰ Jam</td>
        <td style="padding: 6px 0; text-align: right; font-weight: 600;">${eventTime} WIB</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #737373;">📍 Titik Kumpul</td>
        <td style="padding: 6px 0; text-align: right; font-weight: 600;">${meetingPoint}</td>
      </tr>
    </table>

    <p style="margin: 12px 0 0; font-size: 12px; color: #a3a3a3; text-align: center;">
      📎 Ada lampiran file kalender di email ini, tinggal buka buat langsung nambahin ke
      kalender HP kamu.
    </p>

    <p style="margin: 20px 0 0; font-size: 13px; color: #737373; text-align: center;">
      Jangan lupa check-in lewat halaman "Event Saya" pas hari-H ya. Sampai jumpa di garis
      start! 🏃
    </p>
  `;

  return emailWrapper({ badgeText: 'Tiket Kamu', eventName, bodyHtml: body });
}

interface CheckInEmailOptions {
  memberName: string;
  eventName: string;
  checkedInAtLabel: string;
}

export function getCheckInEmailHtml({ memberName, eventName, checkedInAtLabel }: CheckInEmailOptions): string {
  const body = `
    <div style="text-align: center; margin-bottom: 16px;">
      <div style="display: inline-block; background: #f0fdf4; color: #16a34a; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 999px;">
        ✓ Kehadiran Terkonfirmasi
      </div>
    </div>

    <p style="margin: 0 0 16px; font-size: 15px; text-align: center;">
      Halo <strong>${memberName}</strong>, check-in kamu berhasil dicatat pada
      <strong>${checkedInAtLabel}</strong>.
    </p>

    <p style="margin: 20px 0 0; font-size: 13px; color: #737373; text-align: center;">
      Makasih udah lari bareng hari ini. Semoga capek-nya kebayar sama serunya! Sampai
      jumpa di event berikutnya. 🏃💨
    </p>
  `;

  return emailWrapper({ badgeText: 'Check-in Berhasil', eventName, bodyHtml: body });
}

interface OrderStatusEmailOptions {
  memberName: string;
  orderId: string;
  totalAmountLabel: string;
  itemsSummary: string; // "Jersey Lengan Pendek (M) x1, ..."
  status: 'VERIFIED' | 'REJECTED';
  rejectReason?: string;
}

export function getOrderStatusEmailHtml({ memberName, orderId, totalAmountLabel, itemsSummary, status, rejectReason }: OrderStatusEmailOptions): string {
  const isVerified = status === 'VERIFIED';

  const body = `
    <div style="text-align: center; margin-bottom: 16px;">
      <div style="display: inline-block; background: ${isVerified ? '#f0fdf4' : '#fef2f2'}; color: ${isVerified ? '#16a34a' : '#dc2626'}; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 999px;">
        ${isVerified ? '✓ Pembayaran Terverifikasi' : '✗ Pembayaran Ditolak'}
      </div>
    </div>

    <p style="margin: 0 0 16px; font-size: 15px; text-align: center;">
      Halo <strong>${memberName}</strong>, pesanan kamu
      ${isVerified ? 'udah dikonfirmasi dan lagi diproses' : 'gak bisa diproses'}.
    </p>

    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
      <tr>
        <td style="padding: 6px 0; color: #737373;">📦 Item</td>
        <td style="padding: 6px 0; text-align: right; font-weight: 600;">${itemsSummary}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #737373;">💰 Total</td>
        <td style="padding: 6px 0; text-align: right; font-weight: 600;">${totalAmountLabel}</td>
      </tr>
    </table>

    ${!isVerified && rejectReason ? `<p style="margin: 16px 0 0; font-size: 13px; color: #dc2626; text-align: center;">Alasan: ${rejectReason}</p>` : ''}

    <p style="margin: 20px 0 0; font-size: 13px; color: #737373; text-align: center;">
      ${isVerified ? 'Kami bakal hubungin kamu buat proses selanjutnya. Makasih ya!' : 'Kalau ada pertanyaan, hubungi admin lewat Instagram.'}
    </p>
  `;

  return emailWrapper({
    badgeText: 'Update Pesanan',
    eventName: `Pesanan #${orderId.slice(-8).toUpperCase()}`,
    bodyHtml: body,
  });
}

interface ResetPasswordEmailOptions {
  memberName: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export function getResetPasswordEmailHtml({ memberName, resetUrl, expiresInMinutes }: ResetPasswordEmailOptions): string {
  const body = `
    <p style="margin: 0 0 16px; font-size: 15px; text-align: center;">
      Halo <strong>${memberName}</strong>, kami menerima permintaan untuk mengatur ulang
      password akunmu.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a
        href="${resetUrl}"
        style="display: inline-block; background: #fbdc00; color: #162349; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px;"
      >
        Atur Ulang Password
      </a>
    </div>

    <p style="margin: 0 0 8px; font-size: 13px; color: #737373; text-align: center;">
      Link ini berlaku selama ${expiresInMinutes} menit dan hanya bisa dipakai sekali.
    </p>
    <p style="margin: 0; font-size: 13px; color: #737373; text-align: center;">
      Kalau kamu tidak merasa memintanya, abaikan saja email ini. Passwordmu tidak berubah.
    </p>

    <p style="margin: 20px 0 0; font-size: 11px; color: #a3a3a3; text-align: center; word-break: break-all;">
      Tombol tidak berfungsi? Salin link ini ke browser:<br />${resetUrl}
    </p>
  `;

  return emailWrapper({ badgeText: 'Keamanan Akun', eventName: 'Reset Password', bodyHtml: body });
}
