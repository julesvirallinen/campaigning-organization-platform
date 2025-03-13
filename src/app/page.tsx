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

export default function HomePage() {
  const [timeslots, setTimeslots] = useState<TimeSlot[]>([]);
  const [name, setName] = useState("");
  const [inputName, setInputName] = useState("");
  const [note, setNote] = useState("");

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
    await fetch(`/api/signups/${slotId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    fetchTimeslots();
  };

  if (!name) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
        <form onSubmit={handleNameSubmit} className="space-y-4">
          <div>
            <label htmlFor="nameInput" className="block mb-1">
              Your Name
            </label>
            <input
              id="nameInput"
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="border p-2 rounded"
              required
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Available Time Slots</h1>
        <div className="text-sm">Signed in as: {name}</div>
      </div>

      <div className="space-y-4">
        {timeslots.map((slot) => {
          const isSignedUp = slot.signups.some((s) => s.name === name);
          return (
            <div key={slot.id} className="border p-4 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">
                    {new Date(slot.date).toLocaleDateString()}
                  </p>
                  <p>
                    {new Date(slot.startTime).toLocaleTimeString()} -{" "}
                    {new Date(slot.endTime).toLocaleTimeString()}
                  </p>
                  <p>{slot.location}</p>
                </div>
                {!isSignedUp ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Optional note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="border p-2 rounded"
                    />
                    <button
                      onClick={() => handleSignUp(slot.id)}
                      className="block w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRemoveSignUp(slot.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Remove Sign Up
                  </button>
                )}
              </div>
              <div className="mt-2">
                <p className="font-semibold">Current Signups:</p>
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
          );
        })}
      </div>
    </div>
  );
}
