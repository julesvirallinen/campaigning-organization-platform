import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLocalDate, toFinnishTime } from "@/lib/date-utils";

export async function GET() {
  // Fetch timeslots from the database
  const timeslots = await prisma.timeSlot.findMany({
    include: { signups: true },
    orderBy: { date: "asc" },
  });

  // Convert UTC dates from database to Finnish timezone for the client
  const finnishTimeslots = timeslots.map((slot) => ({
    ...slot,
    date: toFinnishTime(new Date(slot.date)).toISOString(),
    startTime: toFinnishTime(new Date(slot.startTime)).toISOString(),
    endTime: toFinnishTime(new Date(slot.endTime)).toISOString(),
  }));

  return NextResponse.json(finnishTimeslots);
}

export async function POST(request: Request) {
  const data = await request.json();

  // Create date objects with Finnish timezone properly converted to UTC for storage
  const dateObj = createLocalDate(data.date, "00:00");
  const startTimeObj = createLocalDate(data.date, data.startTime);
  const endTimeObj = createLocalDate(data.date, data.endTime);

  const timeslot = await prisma.timeSlot.create({
    data: {
      date: dateObj,
      startTime: startTimeObj,
      endTime: endTimeObj,
      location: data.location,
      description: data.description || "",
    },
  });

  // Convert the created timeslot back to Finnish timezone for the response
  const finnishTimeslot = {
    ...timeslot,
    date: toFinnishTime(new Date(timeslot.date)).toISOString(),
    startTime: toFinnishTime(new Date(timeslot.startTime)).toISOString(),
    endTime: toFinnishTime(new Date(timeslot.endTime)).toISOString(),
  };

  return NextResponse.json(finnishTimeslot);
}
