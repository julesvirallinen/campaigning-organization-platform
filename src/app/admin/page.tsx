"use client";

import { useState, useEffect } from "react";
import AddTimeslotForm from "../components/AddTimeslotForm";
import Header from "../components/Header";
import { formatTime, formatDate, formatDayHeader } from "@/lib/date-utils";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid";

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  signups: { id?: string; name: string; note?: string }[];
}

export default function AdminPage() {
  const [timeslots, setTimeslots] = useState<TimeSlot[]>([]);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
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
    let startTime, endTime;

    if (slot.startTime.includes("T")) {
      startTime = formatTime(slot.startTime);
    } else {
      startTime = slot.startTime;
    }

    if (slot.endTime.includes("T")) {
      endTime = formatTime(slot.endTime);
    } else {
      endTime = slot.endTime;
    }

    const date = formatDate(slot.date);

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

  const toggleExpand = (id: string) => {
    setExpandedSlot(expandedSlot === id ? null : id);
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
              className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDayHeader(slot.date)}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {slot.location}
                  </div>
                  {slot.description && (
                    <div className="text-gray-600 dark:text-gray-300">
                      {slot.description}
                    </div>
                  )}

                  <div
                    className="flex items-center mt-2 cursor-pointer text-blue-600 dark:text-blue-400"
                    onClick={() => toggleExpand(slot.id)}
                  >
                    <span className="text-sm mr-1">
                      {slot.signups.length} signup(s)
                    </span>
                    {expandedSlot === slot.id ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </div>

                  {expandedSlot === slot.id && slot.signups.length > 0 && (
                    <div className="mt-2 pl-2 border-l-2 border-gray-200 dark:border-gray-600">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {slot.signups
                            .filter((signup) => !signup.note)
                            .map((signup, idx) => (
                              <span
                                key={signup.id || idx}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                              >
                                {signup.name}
                              </span>
                            ))}
                        </div>
                        {slot.signups
                          .filter((signup) => signup.note)
                          .map((signup, idx) => (
                            <div
                              key={signup.id || idx}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
