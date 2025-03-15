"use client";

import { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import {
  format,
  startOfDay,
  addDays,
  parseISO,
  formatISO,
  isSameDay,
} from "date-fns";
import Link from "next/link";
import Header from "./components/Header";

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  signups: Array<{ id: string; name: string; note?: string }>;
  description?: string;
}

export default function HomePage() {
  const [timeslots, setTimeslots] = useState<TimeSlot[]>([]);
  const [name, setName] = useState("");
  const [inputName, setInputName] = useState("");
  const [note, setNote] = useState("");
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem("myName");
    if (storedName && !name) setName(storedName);
    fetchTimeslots();
  }, []);

  const fetchTimeslots = async () => {
    const res = await fetch("/api/timeslots");
    const data = await res.json();
    setTimeslots(data);
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = inputName.trim();
    if (trimmedName) {
      localStorage.setItem("myName", trimmedName);
      setName(trimmedName);
      await fetchTimeslots();
    }
  };

  const handleSignUp = async (slotId: string) => {
    await fetch("/api/signups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, note, timeSlotId: slotId }),
    });
    setNote("");
    fetchTimeslots();
  };

  const handleRemoveSignUp = async (slotId: string) => {
    const slot = timeslots.find((s) => s.id === slotId);
    if (!slot || slot.signups.length !== 1) {
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

  const formatTime = (dateStr: string) => {
    return format(parseISO(dateStr), "h:mm a");
  };

  const formatDayHeader = (dateStr: string) => {
    return format(parseISO(dateStr), "EEEE, MMM d");
  };

  const getNextTwoWeeks = () => {
    const dates: string[] = [];
    const today = startOfDay(new Date());

    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      const dateStr = formatISO(date, { representation: "date" });
      dates.push(dateStr);
    }
    return dates;
  };

  const allDates = getNextTwoWeeks();

  const groupedTimeslots = timeslots.reduce((acc, slot) => {
    const slotDate = parseISO(slot.date);
    const matchingDate = allDates.find((date) =>
      isSameDay(parseISO(date), slotDate)
    );

    if (matchingDate) {
      if (!acc[matchingDate]) {
        acc[matchingDate] = [];
      }
      acc[matchingDate].push(slot);
    }
    return acc;
  }, {} as Record<string, TimeSlot[]>);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <Header title="Available Time Slots" />

      <div className="space-y-6">
        {allDates.map((date) => (
          <div key={date}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-700">
                {formatDayHeader(date)}
              </h2>
              <Link
                href={`/add?date=${date}`}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                title="Add timeslot for this date"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
            <div className="space-y-4">
              {groupedTimeslots[date]?.map((slot) => {
                const isSignedUp = slot.signups.some((s) => s.name === name);
                const isExpanded = expandedSlot === slot.id;

                return (
                  <div
                    key={slot.id}
                    className="border rounded-lg p-4 flex flex-col bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  >
                    <div
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded-md"
                      onClick={() =>
                        setExpandedSlot(isExpanded ? null : slot.id)
                      }
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatTime(slot.startTime)} -{" "}
                            {formatTime(slot.endTime)}
                          </span>
                          <span className="text-gray-600 dark:text-gray-300">
                            {slot.location}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                          <div className="flex flex-wrap gap-1 w-full sm:w-auto">
                            {slot.signups.map((signup) => (
                              <span
                                key={signup.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                              >
                                {signup.name}
                              </span>
                            ))}
                            {slot.signups.length <= 1 && (
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
                        {slot.description && (
                          <div className="mb-4 text-gray-700 dark:text-gray-300">
                            {slot.description}
                          </div>
                        )}
                        {slot.signups.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                              Current Signups:
                            </h3>
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1 mb-2">
                                {slot.signups
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
                              {slot.signups
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
                        {!isSignedUp ? (
                          <div className="space-y-3">
                            <div>
                              <label
                                htmlFor={`note-${slot.id}`}
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                              >
                                Add a note (optional)
                              </label>
                              <textarea
                                id={`note-${slot.id}`}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                rows={2}
                              />
                            </div>
                            <button
                              onClick={() => handleSignUp(slot.id)}
                              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              Sign Up
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRemoveSignUp(slot.id)}
                            className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            Remove Sign Up
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/add"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Add New Slot
        </Link>
        <a
          href="/past-timeslots"
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          View Past Time Slots
        </a>
      </div>
    </div>
  );
}
