export default function SignUpLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md mx-auto p-6 animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded mx-auto mb-6" />
        <div className="space-y-4">
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
