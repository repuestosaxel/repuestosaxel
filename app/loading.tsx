import { BrandLogo } from "@/components/brand-logo";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="glass-panel w-full max-w-md rounded-2xl p-8">
        <BrandLogo className="justify-center" />
        <div className="mt-8 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-12 w-2/3" />
        </div>
      </div>
    </main>
  );
}
