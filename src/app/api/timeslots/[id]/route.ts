import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLocalDate, toFinnishTime } from "@/lib/date-utils";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { date, startTime, endTime, location, description } = body;

    // Create date objects with Finnish timezone properly converted to UTC for storage
    const dateObj = createLocalDate(date, "00:00");

    // Handle different formats of time inputs
    let startTimeObj, endTimeObj;

    if (startTime.includes("T")) {
      // If it's already an ISO string, convert it to a Date and ensure it's in UTC
      const timeStr = new Date(startTime).toTimeString().slice(0, 5);
      startTimeObj = createLocalDate(date, timeStr);
    } else {
      startTimeObj = createLocalDate(date, startTime);
    }

    if (endTime.includes("T")) {
      // If it's already an ISO string, convert it to a Date and ensure it's in UTC
      const timeStr = new Date(endTime).toTimeString().slice(0, 5);
      endTimeObj = createLocalDate(date, timeStr);
    } else {
      endTimeObj = createLocalDate(date, endTime);
    }

    const updatedTimeslot = await prisma.timeSlot.update({
      where: {
        id: params.id,
      },
      data: {
        date: dateObj,
        startTime: startTimeObj,
        endTime: endTimeObj,
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
