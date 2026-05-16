import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <Skeleton className="h-16 w-2/3" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    </main>
  );
}
