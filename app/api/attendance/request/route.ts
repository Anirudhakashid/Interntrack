import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
import { verifyToken, generateAttendanceToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, generateAttendanceEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { internshipFormId } = await request.json();

    const activeForm = await prisma.internshipForm.findFirst({
      where: {
        studentId: user.id,
        status: "APPROVED",
        isActive: true,
      },
      select: {
        id: true,
        companyName: true,
      },
    });

    if (!activeForm) {
      return NextResponse.json(
        { error: "No active internship found." },
        { status: 400 },
      );
    }

    if (internshipFormId !== activeForm.id) {
      return NextResponse.json(
        { error: "Attendance can be only marked for active internships" },
        { status: 400 },
      );
    }

    // Check if form exists and is approved
    const form = await prisma.internshipForm.findFirst({
      where: {
        id: internshipFormId,
        studentId: user.id,
        status: "APPROVED",
      },
      include: {
        student: { select: { name: true } },
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Approved internship form not found" },
        { status: 404 },
      );
    }

    //Normalize to day-start for comparison (not time-sensitive)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const internshipStart = new Date(form.startDate!);
    internshipStart.setHours(0, 0, 0, 0);

    const internshipEnd = new Date(form.endDate!);
    internshipEnd.setHours(0, 0, 0, 0);

    //Case 1: Internship hasn't started yet
    if (todayStart < internshipStart) {
      return NextResponse.json(
        {
          error: `Attendance can be requested from ${internshipStart.toLocaleDateString("en-US")} onwards`,
        },
        { status: 400 },
      );
    }

    //case 2: Internship has ended
    if (todayStart > internshipEnd) {
      return NextResponse.json(
        {
          error: `Attendance cannot be requested after internship end Date ${internshipEnd.toLocaleDateString("en-US")}`,
        },
        { status: 400 },
      );
    }

    // Check if attendance already requested for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId: user.id,
        internshipFormId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: "Attendance already requested for today" },
        { status: 400 },
      );
    }

    let attendanceId: string | null = null;

    try {
      // Persist only long enough to generate the verification token.
      const attendance = await prisma.attendance.create({
        data: {
          studentId: user.id,
          internshipFormId,
          verificationToken: "",
        },
      });
      attendanceId = attendance.id;

      const verificationToken = generateAttendanceToken(attendance.id);

      await prisma.attendance.update({
        where: { id: attendance.id },
        data: { verificationToken },
      });

      const emailHTML = generateAttendanceEmail(
        form.student.name,
        form.companyName,
        verificationToken,
      );

      const emailSent = await sendEmail({
        to: form.hrEmail,
        subject: `Attendance Verification Required - ${form.student.name}`,
        html: emailHTML,
      });

      if (!emailSent) {
        throw new Error("Failed to send verification email");
      }

      return NextResponse.json({
        message: "Attendance verification email sent to HR",
        attendanceId: attendance.id,
      });
    } catch (error) {
      if (attendanceId) {
        try {
          await prisma.attendance.delete({
            where: { id: attendanceId },
          });
        } catch (cleanupError) {
          console.error(
            "Failed to clean up attendance after request error:",
            cleanupError,
          );
        }
      }

      console.error("Attendance request processing error:", error);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Attendance request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
