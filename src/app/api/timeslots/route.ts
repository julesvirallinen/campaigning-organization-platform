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
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      location: data.location,
      description: data.note,
    },
  });
  return NextResponse.json(timeslot);
}
