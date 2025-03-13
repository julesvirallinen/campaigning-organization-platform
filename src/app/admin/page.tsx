"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Slider } from "@mui/material";

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  signups: Array<{ id: string; name: string; note?: string }>;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

const formatHourLabel = (hour: number) => {
  return `${hour % 12 || 12}${hour < 12 ? "AM" : "PM"}`;
};

const hourToTimeString = (hour: number) => {
  return `${hour.toString().padStart(2, "0")}:00`;
};

export default function AdminPage() {
  const router = useRouter();
  const [timeslots, setTimeslots] = useState<TimeSlot[]>([]);
  const [timeRange, setTimeRange] = useState<number[]>([9, 17]); // Default 9 AM to 5 PM
  const [newSlot, setNewSlot] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: hourToTimeString(9),
    endTime: hourToTimeString(17),
    location: "",
  });

  useEffect(() => {
    fetchTimeslots();
  }, []);

  const fetchTimeslots = async () => {
    const res = await fetch("/api/timeslots");
    const data = await res.json();
    setTimeslots(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/timeslots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: newSlot.date,
        startTime: `${newSlot.date}T${newSlot.startTime}`,
        endTime: `${newSlot.date}T${newSlot.endTime}`,
        location: newSlot.location,
      }),
    });
    setNewSlot({
      date: new Date().toISOString().split("T")[0],
      startTime: hourToTimeString(9),
      endTime: hourToTimeString(17),
      location: "",
    });
    fetchTimeslots();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/timeslots/${id}`, { method: "DELETE" });
    fetchTimeslots();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleLogout = () => {
    localStorage.removeItem("myName");
    router.push("/");
  };

  const handleTimeRangeChange = (event: Event, newValue: number | number[]) => {
    const [start, end] = newValue as number[];
    setTimeRange([start, end]);
    setNewSlot({
      ...newSlot,
      startTime: hourToTimeString(start),
      endTime: hourToTimeString(end),
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin - Manage Time Slots</h1>
        <button
          onClick={handleLogout}
          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label htmlFor="date" className="block mb-1">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={newSlot.date}
            onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
            className="border p-2 rounded"
            required
          />
        </div>
        <div className="py-4">
          <label className="block mb-1">Time Range</label>
          <div className="px-4">
            <Slider
              value={timeRange}
              onChange={handleTimeRangeChange}
              min={8}
              max={20}
              step={1}
              marks={HOURS.map((hour) => ({
                value: hour,
                label: formatHourLabel(hour),
              }))}
              valueLabelFormat={formatHourLabel}
              valueLabelDisplay="auto"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>
              Selected: {formatHourLabel(timeRange[0])} -{" "}
              {formatHourLabel(timeRange[1])}
            </span>
          </div>
        </div>
        <div>
          <label htmlFor="location" className="block mb-1">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={newSlot.location}
            onChange={(e) =>
              setNewSlot({ ...newSlot, location: e.target.value })
            }
            className="border p-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Time Slot
        </button>
      </form>

      <div className="space-y-4">
        {timeslots.map((slot) => (
          <div key={slot.id} className="border p-4 rounded">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold">
                  {new Date(slot.date).toLocaleDateString()}
                </p>
                <p>
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </p>
                <p>{slot.location}</p>
              </div>
              <button
                onClick={() => handleDelete(slot.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
            <div className="mt-2">
              <p className="font-semibold">Signups:</p>
              <ul className="list-disc list-inside">
                {slot.signups.map((signup) => (
                  <li key={signup.id}>
                    {signup.name}
                    {signup.note && (
                      <span className="text-gray-600"> - {signup.note}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
