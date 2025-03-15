"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { fi } from "date-fns/locale";
import { Slider, Box } from "@mui/material";

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  signups: { name: string; note: string }[];
}

export default function AdminPage() {
  const [timeslots, setTimeslots] = useState<TimeSlot[]>([]);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    description: "",
  });

  useEffect(() => {
    fetchTimeslots();
    // Get date from URL if present
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get("date");
    if (dateParam) {
      setFormData((prev) => ({ ...prev, date: dateParam }));
    }
  }, []);

  const fetchTimeslots = async () => {
    try {
      const response = await fetch("/api/timeslots");
      const data = await response.json();
      setTimeslots(data);
    } catch (error) {
      console.error("Error fetching timeslots:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSlot) {
        await fetch(`/api/timeslots/${editingSlot.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/timeslots", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }
      fetchTimeslots();
      setFormData({
        date: "",
        startTime: "09:00",
        endTime: "10:00",
        location: "",
        description: "",
      });
      setEditingSlot(null);
    } catch (error) {
      console.error("Error submitting timeslot:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this timeslot?")) return;
    try {
      await fetch(`/api/timeslots/${id}`, {
        method: "DELETE",
      });
      fetchTimeslots();
    } catch (error) {
      console.error("Error deleting timeslot:", error);
    }
  };

  const handleEdit = (slot: TimeSlot) => {
    setEditingSlot(slot);
    const startTime = slot.startTime.includes("T")
      ? format(parseISO(slot.startTime), "HH:mm")
      : slot.startTime;
    const endTime = slot.endTime.includes("T")
      ? format(parseISO(slot.endTime), "HH:mm")
      : slot.endTime;
    const date = format(parseISO(slot.date), "yyyy-MM-dd");

    setFormData({
      date,
      startTime,
      endTime,
      location: slot.location,
      description: slot.description,
    });
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    setFormData({
      date: "",
      startTime: "09:00",
      endTime: "10:00",
      location: "",
      description: "",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Admin Panel
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {editingSlot ? "Edit Timeslot" : "Add New Timeslot"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Start Time
              </label>
              <Box sx={{ width: "100%", mb: 2 }}>
                <Slider
                  value={parseInt(formData.startTime.split(":")[0])}
                  onChange={(_, value) => {
                    const hours = value as number;
                    setFormData({
                      ...formData,
                      startTime: `${hours.toString().padStart(2, "0")}:00`,
                    });
                  }}
                  min={0}
                  max={23}
                  marks
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}:00`}
                  className="dark:text-white"
                />
              </Box>
              <input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                required
                min="00:00"
                max="23:59"
              />
            </div>
            <div>
              <label
                htmlFor="endTime"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                End Time
              </label>
              <Box sx={{ width: "100%", mb: 2 }}>
                <Slider
                  value={parseInt(formData.endTime.split(":")[0])}
                  onChange={(_, value) => {
                    const hours = value as number;
                    setFormData({
                      ...formData,
                      endTime: `${hours.toString().padStart(2, "0")}:00`,
                    });
                  }}
                  min={0}
                  max={23}
                  marks
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}:00`}
                  className="dark:text-white"
                />
              </Box>
              <input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                required
                min="00:00"
                max="23:59"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {editingSlot ? "Update Timeslot" : "Add Timeslot"}
            </button>
            {editingSlot && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Existing Timeslots
        </h2>
        <div className="space-y-4">
          {timeslots.map((slot) => (
            <div
              key={slot.id}
              className="border rounded-lg p-4 flex justify-between items-start"
            >
              <div>
                <div className="font-medium">
                  {format(parseISO(slot.date), "EEEE, d MMMM yyyy", {
                    locale: fi,
                  })}
                </div>
                <div className="text-gray-600">
                  {slot.startTime} - {slot.endTime}
                </div>
                <div className="text-gray-600">{slot.location}</div>
                <div className="text-gray-600">{slot.description}</div>
                <div className="text-sm text-gray-500 mt-2">
                  {slot.signups.length} signup(s)
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(slot)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(slot.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
