//route for update and delete the existing coordinator
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

//PUT - update coordinator
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { branch, email, name } = await req.json();

    const coordinator = await prisma.departmentCoordinator.update({
      where: { id: params.id },
      data: { branch, email, name },
    });

    return NextResponse.json(coordinator, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update coordinator" },
      { status: 500 },
    );
  }
}

//DELETE - delete a coordinator
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.departmentCoordinator.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete coordinator" },
      { status: 500 },
    );
  }
}
