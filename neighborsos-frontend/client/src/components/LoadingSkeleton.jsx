export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="liquid-glass rounded-xl2 p-4 animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/15" />
            <div className="h-3 w-32 bg-white/15 rounded" />
          </div>
          <div className="h-3 w-3/4 bg-white/10 rounded mb-2" />
          <div className="h-3 w-1/2 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}
