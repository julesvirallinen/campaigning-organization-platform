import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Delete all signups for this timeslot first
  await prisma.signUp.deleteMany({
    where: { timeSlotId: params.id },
  });

  // Then delete the timeslot
  await prisma.timeSlot.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
