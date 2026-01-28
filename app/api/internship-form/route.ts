import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const body = await request.json();

    const {
      name,
      class: studentClass,
      branch,
      division,
      teacherId,
      companyName,
      companyLocation,
      domain,
      durationWeeks,
      startDate,
      endDate,
      stipend,
      mode,
      offerLetterURL,
      deptCoordinatorEmail,
      hrEmail,
    } = body;

    const required = [
      ["name", name],
      ["class", studentClass],
      ["branch", branch],
      ["division", division],
      ["teacherId", teacherId],
      ["companyName", companyName],
      ["companyLocation", companyLocation],
      ["domain", domain],
      ["durationWeeks", durationWeeks],
      ["startDate", startDate],
      ["endDate", endDate],
      ["stipend", stipend],
      ["mode", mode],
      ["offerLetterURL", offerLetterURL],
      ["deptCoordinatorEmail", deptCoordinatorEmail],
      ["hrEmail", hrEmail],
    ];
    const missing = required.filter(
      ([, v]) => v === undefined || v === null || v === "",
    );
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing fields: ${missing.map(([k]) => k).join(", ")}` },
        { status: 400 },
      );
    }

    const form = await prisma.internshipForm.create({
      data: {
        studentId: user.id,
        studentName: name,
        studentClass,
        studentBranch: branch,
        studentDivision: division,
        teacherId,
        companyName,
        companyLocation,
        domain,
        durationWeeks: parseInt(durationWeeks, 10),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        stipend,
        mode,
        offerLetterURL,
        deptCoordinatorEmail,
        hrEmail,
      },
      include: {
        student: { select: { name: true, email: true } },
        teacher: { select: { name: true, email: true } },
      },
    });

    // Update student's branch and division only if not already set
    if (!user.branch) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          branch,
          division,
        },
      });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("Internship form creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let forms;
    if (user.role === "STUDENT") {
      forms = await prisma.internshipForm.findMany({
        where: { studentId: user.id },
        include: {
          teacher: { select: { name: true, email: true } },
          attendances: {
            orderBy: { date: "desc" },
            take: 5,
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (user.role === "TEACHER") {
      forms = await prisma.internshipForm.findMany({
        where: { teacherId: user.id },
        include: {
          student: { select: { name: true, email: true } },
          attendances: {
            orderBy: { date: "desc" },
            take: 5,
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(forms);
  } catch (error) {
    console.error("Fetch forms error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
