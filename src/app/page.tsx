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

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  signups: Array<{ id: string; name: string; note?: string }>;
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
    console.log("Fetched timeslots:", data);
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
    await fetch(`/api/signups/${slotId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
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
    const today =
      timeslots.length > 0
        ? startOfDay(parseISO(timeslots[0].date))
        : startOfDay(new Date());

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
    console.log("Processing slot date:", format(slotDate, "yyyy-MM-dd"));

    const matchingDate = allDates.find((date) => {
      const parsedDate = parseISO(date);
      const matches = isSameDay(parsedDate, slotDate);
      console.log(
        "Comparing with:",
        format(parsedDate, "yyyy-MM-dd"),
        "matches:",
        matches
      );
      return matches;
    });

    if (matchingDate) {
      if (!acc[matchingDate]) {
        acc[matchingDate] = [];
      }
      acc[matchingDate].push(slot);
    }
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  console.log("All dates:", allDates);
  console.log("Timeslots:", timeslots);
  console.log("Final grouped timeslots:", groupedTimeslots);

  if (!name) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome!</h1>
        <form
          onSubmit={handleNameSubmit}
          className="space-y-4 bg-white p-6 rounded-lg shadow-md"
        >
          <div>
            <label
              htmlFor="nameInput"
              className="block text-lg font-medium mb-2"
            >
              Your Name
            </label>
            <input
              id="nameInput"
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Available Time Slots</h1>
        <div className="text-sm text-gray-600">
          Signed in as: <span className="font-medium">{name}</span>
        </div>
      </div>

      <div className="space-y-6">
        {allDates.map((date) => (
          <div key={date}>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              {formatDayHeader(date)}
            </h2>
            <div className="space-y-2">
              {groupedTimeslots[date]?.map((slot) => {
                const isSignedUp = slot.signups.some((s) => s.name === name);
                const isExpanded = expandedSlot === slot.id;

                return (
                  <div
                    key={slot.id}
                    className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-100"
                  >
                    <div
                      className="p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() =>
                        setExpandedSlot(isExpanded ? null : slot.id)
                      }
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium text-gray-900">
                            {formatTime(slot.startTime)} -{" "}
                            {formatTime(slot.endTime)}
                          </span>
                          <span className="text-gray-600">{slot.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex flex-wrap gap-1">
                            {slot.signups.length === 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                HELP NEEDED
                              </span>
                            ) : (
                              slot.signups.map((signup) => (
                                <span
                                  key={signup.id}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {signup.name}
                                </span>
                              ))
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t p-3 bg-white">
                        {!isSignedUp ? (
                          <div className="space-y-3">
                            <div>
                              <label
                                htmlFor={`note-${slot.id}`}
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Optional Note
                              </label>
                              <textarea
                                id={`note-${slot.id}`}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={2}
                                placeholder="Add any additional information..."
                              />
                            </div>
                            <button
                              onClick={() => handleSignUp(slot.id)}
                              className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
                            >
                              Sign Up
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRemoveSignUp(slot.id)}
                            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
                          >
                            Remove Sign Up
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              }) || (
                <div className="text-gray-500 text-sm italic">
                  No time slots available for this day
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
