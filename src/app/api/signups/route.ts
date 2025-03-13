import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const data = await request.json();
  const signup = await prisma.signUp.create({
    data: {
      name: data.name,
      note: data.note,
      timeSlotId: data.timeSlotId,
    },
  });
  return NextResponse.json(signup);
}
