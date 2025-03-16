import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLocalDate } from "@/lib/date-utils";

export async function GET() {
  // Fetch timeslots from the database
  const timeslots = await prisma.timeSlot.findMany({
    include: { signups: true },
    orderBy: { date: "asc" },
  });

  // The dates are already in UTC in the database
  // When they're serialized to JSON, they'll be in ISO format
  // The client will interpret them based on the local timezone
  return NextResponse.json(timeslots);
}

export async function POST(request: Request) {
  const data = await request.json();

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

  // Return the created timeslot
  // The dates will be serialized to ISO format
  return NextResponse.json(timeslot);
}
