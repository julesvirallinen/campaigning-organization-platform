import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const timeslots = await prisma.timeSlot.findMany({
    include: { signups: true },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(timeslots);
}

export async function POST(request: Request) {
  const data = await request.json();

  // Create date objects with timezone information preserved
  const dateObj = new Date(data.date);
  const startTimeObj = new Date(`${data.date}T${data.startTime}:00`);
  const endTimeObj = new Date(`${data.date}T${data.endTime}:00`);

  const timeslot = await prisma.timeSlot.create({
    data: {
      date: dateObj,
      startTime: startTimeObj,
      endTime: endTimeObj,
      location: data.location,
      description: data.description || "",
    },
  });
  return NextResponse.json(timeslot);
}
