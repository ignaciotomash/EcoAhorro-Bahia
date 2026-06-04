export default function Loading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row animate-pulse">
          <div className="md:w-1/2 h-72 md:h-[500px] bg-gray-100" />

          <div className="md:w-1/2 p-4 md:p-8 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
              {[0, 1, 2].map(i => (
                <div key={i} className="h-14 md:h-16 bg-gray-100 rounded-xl w-full" />
              ))}
            </div>
            <div className="h-14 md:h-16 bg-gray-100 rounded-xl w-full mt-6" />
          </div>
        </div>

        <div className="border-t border-gray-100 px-4 py-8 md:py-12 animate-pulse">
          <div className="h-5 bg-gray-100 rounded w-1/4 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/3 mb-6" />
          <div className="bg-gray-100 rounded-2xl h-48 md:h-64 w-full" />
        </div>
      </div>
    </main>
  );
}
