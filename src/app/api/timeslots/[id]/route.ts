import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { date, startTime, endTime, location, description } = body;

    const updatedTimeslot = await prisma.timeSlot.update({
      where: {
        id: params.id,
      },
      data: {
        date,
        startTime,
        endTime,
        location,
        description,
      },
    });

    return NextResponse.json(updatedTimeslot);
  } catch (error) {
    console.error("Error updating timeslot:", error);
    return NextResponse.json(
      { error: "Failed to update timeslot" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First delete all signups for this timeslot
    await prisma.signUp.deleteMany({
      where: {
        timeSlotId: params.id,
      },
    });

    // Then delete the timeslot
    await prisma.timeSlot.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Timeslot deleted successfully" });
  } catch (error) {
    console.error("Error deleting timeslot:", error);
    return NextResponse.json(
      { error: "Failed to delete timeslot" },
      { status: 500 }
    );
  }
}
