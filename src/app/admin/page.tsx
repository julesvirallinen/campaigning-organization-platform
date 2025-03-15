"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { fi } from "date-fns/locale";
import AddTimeslotForm from "../components/AddTimeslotForm";
import Header from "../components/Header";

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
      <Header title="Admin Panel" />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {editingSlot ? "Edit Timeslot" : "Add New Timeslot"}
        </h2>
        <AddTimeslotForm
          onSubmit={async (formData) => {
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
          }}
          onCancel={handleCancelEdit}
          initialData={formData}
          submitLabel={editingSlot ? "Update Timeslot" : "Add Timeslot"}
        />
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
