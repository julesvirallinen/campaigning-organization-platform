import SignupActions from "./SignupActions";
import { useState } from "react";
import { formatTime } from "../../lib/date-utils";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid";

export interface ITimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  signups: Array<{ id: string; name: string; note?: string }>;
  description?: string;
}

export default function Timeslot({
  timeslot,
  name,
  fetchTimeslots,
}: {
  timeslot: ITimeSlot;
  name: string;
  fetchTimeslots: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const isSignedUp = timeslot.signups.some((s) => s.name === name);

  const handleSignUp = async (slotId: string, note: string) => {
    await fetch("/api/signups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, note, timeSlotId: slotId }),
    });
    fetchTimeslots();
  };

  const handleRemoveSignUp = async (slotId: string) => {
    if (!timeslot || timeslot.signups.length !== 1) {
      await fetch(`/api/signups/${slotId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    } else {
      await fetch(`/api/timeslots/${slotId}`, {
        method: "DELETE",
      });
    }
    fetchTimeslots();
  };

  return (
    <div
      key={timeslot.id}
      className="border rounded-lg p-4 flex flex-col bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
    >
      <div
        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded-md"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-900 dark:text-white">
              {formatTime(timeslot.startTime)} - {formatTime(timeslot.endTime)}
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              {timeslot.location}
            </span>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="flex flex-wrap gap-1 w-full sm:w-auto">
              {timeslot.signups.map((signup) => (
                <span
                  key={signup.id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                >
                  {signup.name}
                </span>
              ))}
              {timeslot.signups.length <= 1 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  HELP NEEDED
                </span>
              )}
            </div>
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-600">
          {timeslot.description && (
            <div className="mb-4 text-gray-700 dark:text-gray-300">
              {timeslot.description}
            </div>
          )}
          {timeslot.signups.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Current Signups:
              </h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {timeslot.signups
                    .filter((signup) => !signup.note)
                    .map((signup) => (
                      <span
                        key={signup.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                      >
                        {signup.name}
                      </span>
                    ))}
                </div>
                {timeslot.signups
                  .filter((signup) => signup.note)
                  .map((signup) => (
                    <div
                      key={signup.id}
                      className="flex items-start space-x-2 text-sm"
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {signup.name}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        - {signup.note}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <SignupActions
            slotId={timeslot.id}
            isSignedUp={isSignedUp}
            onSignUp={handleSignUp}
            onRemoveSignUp={handleRemoveSignUp}
          />
        </div>
      )}
    </div>
  );
}
