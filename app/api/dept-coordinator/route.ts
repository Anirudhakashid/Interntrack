import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

//GET- getting all the coordinators
export async function GET() {
  try {
    const coordinators = await prisma.departmentCoordinator.findMany();
    return NextResponse.json({ coordinators });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to Fetch coordinators" },
      { status: 500 },
    );
  }
}

//POST- Adding new Coordinatos (only by Admin(teacher))
export async function POST(req: NextRequest) {
  try {
    const { branch, name, email } = await req.json();

    if (!branch || !name || !email) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 },
      );
    }

    const coordinator = await prisma.departmentCoordinator.create({
      data: { branch, email, name },
    });

    return NextResponse.json(coordinator, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create coordinator" },
      { status: 500 },
    );
  }
}
