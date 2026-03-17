const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`} />
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-20 w-full rounded-xl" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20 rounded-lg" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  </div>
);

export const SkeletonKPI = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-8 w-16" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export const SkeletonChart = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-48 w-full rounded-xl" />
  </div>
);

export default Skeleton;
