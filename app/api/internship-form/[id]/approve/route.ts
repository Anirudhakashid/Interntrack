import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const todayStart = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const form = await prisma.internshipForm.findUnique({
      where: { id: params.id },
    });

    if (!form || form.teacherId !== user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    let updatedForm;

    if (status === "APPROVED") {
      const today = todayStart(new Date());
      const start = form.startDate
        ? todayStart(new Date(form.startDate))
        : null;
      const end = form.endDate ? todayStart(new Date(form.endDate)) : null;

      // Active only when internship has started and not ended.
      const shouldBeActive = !!start && !!end && today >= start && today <= end;

      updatedForm = await prisma.$transaction(async (tx) => {
        // Keep only one active internship per student.
        if (shouldBeActive) {
          await tx.internshipForm.updateMany({
            where: {
              studentId: form.studentId,
              isActive: true,
            },
            data: { isActive: false },
          });
        }
        return tx.internshipForm.update({
          where: { id: params.id },
          data: {
            status: "APPROVED",
            isActive: shouldBeActive,
          },
          include: {
            student: { select: { name: true, email: true } },
            teacher: { select: { name: true, email: true } },
          },
        });
      });
    } else {
      updatedForm = await prisma.internshipForm.update({
        where: { id: params.id },
        data: {
          status: "REJECTED",
          isActive: false,
        },
        include: {
          student: { select: { name: true, email: true } },
          teacher: { select: { name: true, email: true } },
        },
      });
    }

    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error("Form approval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
