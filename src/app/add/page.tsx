"use client";

import { useEffect, useState } from "react";
import AddTimeslotForm from "../components/AddTimeslotForm";
import Link from "next/link";
import Header from "../components/Header";

interface AddTimeslotFormData {
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
}

export default function AddPage() {
  const [initialData, setInitialData] = useState<AddTimeslotFormData>({
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    description: "",
  });
  const [name, setName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get("date");
    if (dateParam) {
      setInitialData((prev) => ({ ...prev, date: dateParam }));
    }
    const storedName = localStorage.getItem("myName");
    if (storedName) setName(storedName);
  }, []);

  const handleAddTimeslot = async (data: AddTimeslotFormData) => {
    try {
      const response = await fetch("/api/timeslots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const timeslot = await response.json();

      // Add creator as first signup
      if (name) {
        await fetch("/api/signups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            timeSlotId: timeslot.id,
            note: "Creator",
          }),
        });
      }

      // Redirect back to main page after successful add
      window.location.href = "/";
    } catch (error) {
      console.error("Error submitting timeslot:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Header title="Add New Time Slot" />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <AddTimeslotForm
          onSubmit={handleAddTimeslot}
          onCancel={() => {
            window.location.href = "/";
          }}
          initialData={initialData}
        />
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/"
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          Back to List
        </Link>
      </div>
    </div>
  );
}
