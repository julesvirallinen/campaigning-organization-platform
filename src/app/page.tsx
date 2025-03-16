"use client";

import { useState, useEffect } from "react";
import { startOfDay, addDays, parseISO, formatISO, isSameDay } from "date-fns";
import Link from "next/link";
import Header from "./components/Header";
import { formatDayHeader } from "@/lib/date-utils";
import Timeslot, { ITimeSlot } from "./components/Timeslot";
import NameInput from "./components/NameInput";

export default function HomePage() {
  const [timeslots, setTimeslots] = useState<ITimeSlot[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("myName");
    if (storedName && !name) setName(storedName);
    fetchTimeslots();
  }, [name]);

  const fetchTimeslots = async () => {
    const res = await fetch("/api/timeslots");
    const data = await res.json();
    setTimeslots(data);
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
  }, {} as Record<string, ITimeSlot[]>);

  if (!name) {
    return (
      <NameInput
        setName={setName}
        name={name}
        fetchTimeslots={fetchTimeslots}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header title="Tuu flaikuttaa!" />

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
              {groupedTimeslots[date]?.map((slot) => (
                <Timeslot
                  key={slot.id}
                  timeslot={slot}
                  name={name}
                  fetchTimeslots={fetchTimeslots}
                />
              ))}
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
