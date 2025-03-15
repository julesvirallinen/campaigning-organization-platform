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
  const timeslot = await prisma.timeSlot.create({
    data: {
      date: new Date(data.date),
      startTime: new Date(`${data.date}T${data.startTime}:00`),
      endTime: new Date(`${data.date}T${data.endTime}:00`),
      location: data.location,
      description: data.description || "",
    },
  });
  return NextResponse.json(timeslot);
}
