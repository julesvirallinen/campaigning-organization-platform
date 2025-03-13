import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { slotId: string } }
) {
  const { name } = await request.json();
  await prisma.signUp.deleteMany({
    where: {
      timeSlotId: params.slotId,
      name,
    },
  });
  return NextResponse.json({ success: true });
}
