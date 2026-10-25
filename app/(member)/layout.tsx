// app/(member)/layout.tsx
import { MemberTopBar } from '@/components/member/member-top-bar';
import { MemberBottomMenu } from '@/components/member/member-bottom-menu';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <MemberTopBar />
      <main>{children}</main>
      <MemberBottomMenu />
    </div>
  );
}
