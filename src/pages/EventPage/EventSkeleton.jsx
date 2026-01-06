export default function EventSkeleton() {
  return (
    <div className="max-w-5xl mx-auto pb-10 animate-pulse">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* Left Panel */}
        <div className="md:col-span-1 space-y-4">
          <div className="w-full h-[300px] bg-gray-700 rounded-xl"></div>
          <div className="space-y-4 mt-6">
            <div className="h-4 bg-gray-700 w-20 rounded"></div>
            <div className="h-4 bg-gray-700 w-1/2 rounded"></div>
            <div className="h-4 bg-gray-800 w-3/4 rounded"></div>
          </div>
          <div className="space-y-2 mt-6">
            <div className="h-4 bg-gray-700 w-20 rounded"></div>
            <div className="h-4 bg-gray-700 w-32 rounded"></div>
          </div>
          <div className="space-y-2 mt-6">
            <div className="h-4 bg-gray-700 w-20 rounded"></div>
            <div className="h-4 bg-gray-700 w-40 rounded"></div>
          </div>
          <div className="h-4 bg-gray-700 w-32 mt-4 rounded"></div>
          <div className="h-4 bg-gray-700 w-40 rounded"></div>
        </div>

        {/* Right Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="h-8 bg-gray-700 w-1/2 rounded"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-700 rounded-md"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 w-32 rounded"></div>
              <div className="h-4 bg-gray-700 w-48 rounded"></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-700 rounded-md"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 w-48 rounded"></div>
              <div className="h-4 bg-gray-700 w-32 rounded"></div>
            </div>
          </div>
          <div className="bg-[#1a1c29] p-6 rounded-lg border border-gray-700 space-y-4">
            <div className="h-6 bg-gray-700 w-32 rounded"></div>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-800 rounded-lg w-full"></div>
            ))}
            <div className="h-10 bg-gray-700 w-full rounded"></div>
          </div>
          <div>
            <div className="h-6 bg-gray-700 w-32 mb-2 rounded"></div>
            <div className="h-20 bg-gray-800 rounded"></div>
          </div>
          <div>
            <div className="h-6 bg-gray-700 w-32 mb-2 rounded"></div>
            <div className="h-60 bg-gray-800 rounded"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
