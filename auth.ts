import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      id: 'member-login',
      name: 'Member Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = getClientIp(request as Request);
        const { success } = rateLimit(`login:member:${ip}:${credentials.email}`, {
          limit: 5,
          windowMs: 5 * 60 * 1000,
        });

        if (!success) return null;

        const member = await prisma.member.findUnique({
          where: { email: credentials.email as string },
        });

        if (!member) return null;

        // Akun ini daftar/login via Google, gak punya password buat dibandingin.
        // Suruh mereka pakai tombol "Login dengan Google" aja.
        if (!member.password) return null;

        const isValid = await bcrypt.compare(credentials.password as string, member.password);

        if (!isValid) return null;

        return {
          id: member.id,
          name: member.name,
          email: member.email,
          role: 'MEMBER' as const,
        };
      },
    }),
    Credentials({
      id: 'admin-login',
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        // Limit lebih ketat buat admin (3x/10menit) karena ini akun paling
        // berharga buat diserang brute-force
        const ip = getClientIp(request as Request);
        const { success } = rateLimit(`login:admin:${ip}:${credentials.email}`, {
          limit: 3,
          windowMs: 10 * 60 * 1000,
        });

        if (!success) return null;

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email as string },
        });

        if (!admin) return null;

        const isValid = await bcrypt.compare(credentials.password as string, admin.password);

        if (!isValid) return null;

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: 'ADMIN' as const,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Cuma relevan buat login via Google, credentials provider udah
      // handle sendiri lewat authorize()
      if (account?.provider !== 'google') return true;

      if (!user.email) return false;

      const existingMember = await prisma.member.findUnique({
        where: { email: user.email },
      });

      if (existingMember) {
        // Email sama kayak akun manual yang udah ada -> auto-nyambung,
        // pakai id yang udah ada biar history registrasi dkk tetap ke-link
        user.id = existingMember.id;
      } else {
        // Belum pernah daftar -> bikin akun member baru. phone & password
        // sengaja dibiarin kosong (nullable), Google gak nyediain data itu,
        // member bisa lengkapin sendiri belakangan lewat halaman Profile.
        const newMember = await prisma.member.create({
          data: {
            name: user.name ?? 'Member',
            email: user.email,
          },
        });
        user.id = newMember.id;
      }

      user.role = 'MEMBER';
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'ADMIN' | 'MEMBER';
      }
      return session;
    },
  },
});
