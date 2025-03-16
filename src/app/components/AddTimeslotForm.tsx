import { useEffect, useState } from "react";
import { Slider, Box } from "@mui/material";

interface AddTimeslotFormData {
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
}

interface AddTimeslotFormProps {
  onSubmit: (data: AddTimeslotFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: AddTimeslotFormData;
  submitLabel?: string;
}

export default function AddTimeslotForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = "Add Timeslot",
}: AddTimeslotFormProps) {
  const [formData, setFormData] = useState<AddTimeslotFormData>({
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate time range
    if (formData.startTime >= formData.endTime) {
      alert("Start time must be before end time");
      setIsLoading(false);
      return;
    }

    await onSubmit(formData);
    setIsLoading(false);
  };

  return (
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
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
              value={
                parseInt(formData.startTime.split(":")[0]) * 2 +
                (formData.startTime.split(":")[1] === "30" ? 1 : 0)
              }
              onChange={(_, rawValue) => {
                const value = rawValue as number;
                const hours = Math.floor(value / 2);
                const minutes = value % 2 === 0 ? "00" : "30";
                const newStartTime = `${hours
                  .toString()
                  .padStart(2, "0")}:${minutes}`;
                setFormData({
                  ...formData,
                  startTime: newStartTime,
                });
              }}
              min={0}
              max={47}
              marks
              step={1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => {
                const hours = Math.floor(value / 2);
                const minutes = value % 2 === 0 ? "00" : "30";
                return `${hours}:${minutes}`;
              }}
              className="dark:text-white"
            />
          </Box>
          <input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => {
              const newStartTime = e.target.value;
              setFormData({
                ...formData,
                startTime: newStartTime,
              });
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            required
            min="00:00"
            max={formData.endTime}
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
              value={
                parseInt(formData.endTime.split(":")[0]) * 2 +
                (formData.endTime.split(":")[1] === "30" ? 1 : 0)
              }
              onChange={(_, rawValue) => {
                const value = rawValue as number;
                const hours = Math.floor(value / 2);
                const minutes = value % 2 === 0 ? "00" : "30";
                const newEndTime = `${hours
                  .toString()
                  .padStart(2, "0")}:${minutes}`;
                setFormData({
                  ...formData,
                  endTime: newEndTime,
                });
              }}
              min={0}
              max={47}
              marks
              step={1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => {
                const hours = Math.floor(value / 2);
                const minutes = value % 2 === 0 ? "00" : "30";
                return `${hours}:${minutes}`;
              }}
              className="dark:text-white"
            />
          </Box>
          <input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => {
              const newEndTime = e.target.value;
              setFormData({
                ...formData,
                endTime: newEndTime,
              });
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            required
            min={formData.startTime}
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
            setFormData({
              ...formData,
              description: e.target.value,
            })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isLoading ? "Adding..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
