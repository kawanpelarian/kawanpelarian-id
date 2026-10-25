import { Logo } from '@/components/logo';

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:py-16">
      <div className="w-full max-w-md space-y-8 sm:space-y-10">
        <div className="flex justify-center">
          <Logo width={140} height={40} />
        </div>

        <div className="rounded-2xl border border-border bg-background px-6 py-8 sm:px-10 sm:py-10">
          <div className="mb-8 space-y-2 text-center">
            <h1 className="text-xl font-semibold text-primaryBlack dark:text-primaryWhite sm:text-2xl">{title}</h1>
            <p className="text-sm text-muted-foreground sm:text-[15px]">{description}</p>
          </div>

          {children}
        </div>

        {footer && <p className="text-center text-[15px] text-muted-foreground">{footer}</p>}
      </div>
    </div>
  );
}
