"use client";

import { useState, useEffect } from "react";

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  signups: Array<{ id: string; name: string; note?: string }>;
}

export default function AdminPage() {
  const [timeslots, setTimeslots] = useState<TimeSlot[]>([]);
  const [newSlot, setNewSlot] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
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
      startTime: "",
      endTime: "",
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin - Manage Time Slots</h1>

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
        <div>
          <label htmlFor="startTime" className="block mb-1">
            Start Time
          </label>
          <input
            id="startTime"
            type="time"
            value={newSlot.startTime}
            onChange={(e) =>
              setNewSlot({ ...newSlot, startTime: e.target.value })
            }
            className="border p-2 rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block mb-1">
            End Time
          </label>
          <input
            id="endTime"
            type="time"
            value={newSlot.endTime}
            onChange={(e) =>
              setNewSlot({ ...newSlot, endTime: e.target.value })
            }
            className="border p-2 rounded"
            required
          />
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
