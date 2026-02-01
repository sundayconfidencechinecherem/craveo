export default function SkeletonPost() {
  return (
    <div className="bg-surface rounded-xl shadow-lg overflow-hidden border border-border animate-pulse">
      {/* Header skeleton */}
      <div className="p-4 border-b border-divider">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-300" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-300 rounded" />
              <div className="h-3 w-24 bg-gray-300 rounded" />
            </div>
          </div>
          <div className="w-8 h-8 bg-gray-300 rounded-full" />
        </div>
      </div>

      {/* Image skeleton */}
      <div className="h-64 bg-gray-300" />

      {/* Actions skeleton */}
      <div className="p-4 border-b border-divider">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-300 rounded" />
              <div className="h-4 w-8 bg-gray-300 rounded" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-300 rounded" />
              <div className="h-4 w-8 bg-gray-300 rounded" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-300 rounded" />
              <div className="h-4 w-8 bg-gray-300 rounded" />
            </div>
          </div>
          <div className="w-6 h-6 bg-gray-300 rounded" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-16 bg-gray-300 rounded-full" />
          <div className="h-6 w-20 bg-gray-300 rounded-full" />
          <div className="h-6 w-14 bg-gray-300 rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="h-4 bg-gray-300 rounded" />
          <div className="h-4 bg-gray-300 rounded" />
          <div className="h-4 bg-gray-300 rounded" />
          <div className="h-4 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
}
