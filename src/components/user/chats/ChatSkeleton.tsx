export default function ChatSkeleton(): React.ReactElement {
  return (
    <div className="flex flex-col gap-6 py-6 w-full max-w-4xl mx-auto">
      {/* Turn 1: User message */}
      <div className="flex flex-col items-end px-4">
        <div className="w-48 sm:w-64 md:w-80 h-11 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
      </div>

      {/* Turn 1: Assistant response */}
      <div className="flex flex-col items-start px-4 w-full">
        <div className="w-full space-y-3 px-4 py-2">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse w-5/6" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse w-full" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse w-3/4" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse w-2/3" />
        </div>
      </div>

      {/* Turn 2: User message */}
      <div className="flex flex-col items-end px-4">
        <div className="w-56 sm:w-72 md:w-96 h-12 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
      </div>

      {/* Turn 2: Assistant response */}
      <div className="flex flex-col items-start px-4 w-full">
        <div className="w-full space-y-3 px-4 py-2">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse w-4/5" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse w-11/12" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse w-3/5" />
        </div>
      </div>
    </div>
  );
}

