import { useState } from "react";

export default function NameInput({
  setName,
  name,
  fetchTimeslots,
}: {
  setName: (name: string) => void;
  fetchTimeslots: () => void;
  name: string;
}) {
  const [inputName, setInputName] = useState("");

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = inputName.trim();
    if (trimmedName) {
      localStorage.setItem("myName", trimmedName);
      setName(trimmedName);
      await fetchTimeslots();
    }
  };
  if (!name) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome!</h1>
        <form
          onSubmit={handleNameSubmit}
          className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <div>
            <label
              htmlFor="nameInput"
              className="block text-lg font-medium mb-2 text-gray-700 dark:text-gray-200"
            >
              Your Name
            </label>
            <input
              id="nameInput"
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              required
              autoComplete="off"
              placeholder="Enter your name"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }
}
