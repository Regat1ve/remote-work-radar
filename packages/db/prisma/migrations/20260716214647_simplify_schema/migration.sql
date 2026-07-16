-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";
-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_jobId_fkey";
-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_userId_fkey";
-- DropForeignKey
ALTER TABLE "saved_jobs" DROP CONSTRAINT "saved_jobs_jobId_fkey";
-- DropForeignKey
ALTER TABLE "saved_jobs" DROP CONSTRAINT "saved_jobs_userId_fkey";
-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";
-- DropForeignKey
ALTER TABLE "user_profiles" DROP CONSTRAINT "user_profiles_userId_fkey";
-- AlterTable
ALTER TABLE "companies" DROP COLUMN "hasBeenUsOnly",
DROP COLUMN "hiresGlobally";
-- AlterTable
ALTER TABLE "job_skills" DROP COLUMN "strength";
-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "canonicalUrl",
DROP COLUMN "expiresAt",
DROP COLUMN "hasVisaSponsorship",
DROP COLUMN "isNsfw";
-- AlterTable
ALTER TABLE "skills" DROP COLUMN "category";
-- DropTable
DROP TABLE "accounts";
-- DropTable
DROP TABLE "applications";
-- DropTable
DROP TABLE "saved_jobs";
-- DropTable
DROP TABLE "sessions";
-- DropTable
DROP TABLE "user_profiles";
-- DropTable
DROP TABLE "users";
-- DropTable
DROP TABLE "verification_tokens";
-- DropEnum
DROP TYPE "ApplicationStatus";
-- DropEnum
DROP TYPE "ExperienceLevel";
-- DropEnum
DROP TYPE "SkillCategory";
