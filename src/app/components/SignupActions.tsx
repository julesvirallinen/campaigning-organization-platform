import { useState } from "react";

interface SignupActionsProps {
  slotId: string;
  isSignedUp: boolean;
  onSignUp: (slotId: string, note: string) => void;
  onRemoveSignUp: (slotId: string) => void;
}

export default function SignupActions({
  slotId,
  isSignedUp,
  onSignUp,
  onRemoveSignUp,
}: SignupActionsProps) {
  const [note, setNote] = useState("");

  const handleSignUp = () => {
    onSignUp(slotId, note);
    setNote("");
  };

  return (
    <>
      {!isSignedUp ? (
        <div className="space-y-3">
          <div>
            <label
              htmlFor={`note-${slotId}`}
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Add a note (optional)
            </label>
            <textarea
              id={`note-${slotId}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
              rows={2}
            />
          </div>
          <button
            onClick={handleSignUp}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign Up
          </button>
        </div>
      ) : (
        <button
          onClick={() => onRemoveSignUp(slotId)}
          className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Remove Sign Up
        </button>
      )}
    </>
  );
}
