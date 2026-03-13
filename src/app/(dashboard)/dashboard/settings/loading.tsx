function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-stone-200/60 ${className}`} />;
}

export default function SettingsLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <Skeleton className="h-8 w-32" />
      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200/60 pb-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-lg" />
        ))}
      </div>
      {/* Form */}
      <div className="rounded-xl border border-stone-200/60 bg-white p-6 space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
        ))}
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
}
