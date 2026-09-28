import Modal from "../../ui/Modal";

export default function CreateUser({
  isModalOpen,
  onModalUpdate,
}: {
  isModalOpen: boolean;
  onModalUpdate: (val: boolean) => void;
}) {
  return (
    <Modal isOpen={isModalOpen} onClose={() => onModalUpdate(false)} title="Add User" size="md">
      <form className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
            Name
          </label>

          <input
            type="text"
            placeholder="Enter name"
            className="w-full rounded-md px-3 py-2 text-sm bg-white dark:bg-white/5 outline focus:outline-2 outline-gray-300 dark:outline-white/10 focus:outline-gray-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter email"
            className="w-full rounded-md px-3 py-2 text-sm bg-white dark:bg-white/5 outline focus:outline-2 outline-gray-300 dark:outline-white/10 focus:outline-gray-400"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={() => onModalUpdate(false)}
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
    </Modal>
  );
}
