-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "workerImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "workerImagesUploadedAt" TIMESTAMP(3);
