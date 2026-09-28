export default function Tokens({ onClose }: { onClose: () => void }): React.ReactElement {
  return (
    <div>
      <form className="space-y-4 p-2 mt-4">
        <div className="flex items-center border-b border-gray-300 dark:border-white/9 py-2">
          <label className="w-1/2 mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
            Provider
          </label>

          <input
            type="text"
            placeholder="Enter name"
            className="w-1/2 rounded-md px-2 py-1 text-sm bg-white dark:bg-white/5 outline focus:outline-2 outline-gray-300 dark:outline-white/10 focus:outline-gray-400"
          />
        </div>

        <div className="flex items-center border-b border-gray-300 dark:border-white/9 py-2">
          <label className="w-1/2 mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
            API Key
          </label>

          <input
            type="text"
            placeholder="Enter API Key"
            className="w-1/2 rounded-md px-2 py-1 text-sm bg-white dark:bg-white/5 outline focus:outline-2 outline-gray-300 dark:outline-white/10 focus:outline-gray-400"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white border border-gray-300 dark:border-white/9 bg-white dark:bg-white/2 hover:bg-gray-50 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-md px-4 py-2 text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
