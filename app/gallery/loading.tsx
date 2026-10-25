import { Skeleton } from '@/components/ui/skeleton';

export default function GalleryLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10 lg:px-8">
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-8 w-32" />
        <Skeleton className="mx-auto h-4 w-56" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
