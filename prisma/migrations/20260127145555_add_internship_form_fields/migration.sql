/*
  Warnings:

  - You are about to drop the column `supervisorEmail` on the `internship_forms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "internship_forms" DROP COLUMN "supervisorEmail",
ADD COLUMN     "companyLocation" TEXT,
ADD COLUMN     "coordinatorEmail" TEXT,
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "durationWeeks" INTEGER,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "mode" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "stipend" TEXT,
ADD COLUMN     "studentBranch" TEXT,
ADD COLUMN     "studentClass" TEXT,
ADD COLUMN     "studentDivision" TEXT,
ADD COLUMN     "studentName" TEXT;
