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
      signups: {
        create: {
          name: data.creatorName,
          note: data.creatorNote || "",
        },
      },
    },
    include: {
      signups: true,
    },
  });
  return NextResponse.json(timeslot);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const name = searchParams.get("name");

  if (!id || !name) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  // First check if there are other signups
  const timeslot = await prisma.timeSlot.findUnique({
    where: { id },
    include: { signups: true },
  });

  if (!timeslot) {
    return NextResponse.json({ error: "Timeslot not found" }, { status: 404 });
  }

  // If only the creator is signed up, delete the entire slot
  if (timeslot.signups.length === 1 && timeslot.signups[0].name === name) {
    await prisma.timeSlot.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Timeslot deleted" });
  }

  // Otherwise just remove the creator's signup
  await prisma.signUp.deleteMany({
    where: {
      timeSlotId: id,
      name,
    },
  });

  return NextResponse.json({ message: "Signup removed" });
}
