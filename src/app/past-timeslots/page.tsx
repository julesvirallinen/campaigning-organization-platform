"use client";

import { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import {
  format,
  startOfDay,
  subDays,
  parseISO,
  formatISO,
  isSameDay,
} from "date-fns";
import Link from "next/link";
import { formatTime, formatDayHeader } from "@/lib/date-utils";

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  signups: Array<{ id: string; name: string; note?: string }>;
}

export default function PastTimeslotsPage() {
  const [timeslots, setTimeslots] = useState<TimeSlot[]>([]);
  const [name, setName] = useState("");
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

  const getPastTwoWeeks = () => {
    const dates: string[] = [];
    const today = startOfDay(new Date());

    for (let i = 1; i <= 14; i++) {
      const date = subDays(today, i);
      const dateStr = formatISO(date, { representation: "date" });
      dates.push(dateStr);
    }
    return dates;
  };

  const allDates = getPastTwoWeeks();

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
        <h1 className="text-3xl font-bold mb-6 text-center">
          Please sign in to view past time slots
        </h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Past Time Slots</h1>
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
                            {slot.signups.map((signup) => (
                              <span
                                key={signup.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {signup.name}
                              </span>
                            ))}
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
                        <div className="space-y-2">
                          {slot.signups.map((signup) => (
                            <div
                              key={signup.id}
                              className="flex justify-between items-center"
                            >
                              <span className="font-medium">{signup.name}</span>
                              {signup.note && (
                                <span className="text-gray-600 text-sm">
                                  {signup.note}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          Back to Current Time Slots
        </Link>
      </div>
    </div>
  );
}
