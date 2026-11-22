export default function SkeletonPaqueteCard() {
  return (
    <div className="animate-pulse">
      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm aspect-4/5">
        <div className="h-full flex flex-col">
          {/* Imagen */}
          <div className="flex-1 bg-gray-100" />

          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="flex items-center gap-3">
              <div className="h-3 bg-gray-200 rounded w-20" />
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-7 bg-gray-200 rounded w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

