-- AlterEnum
ALTER TYPE "InternshipStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "internship_forms" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;
