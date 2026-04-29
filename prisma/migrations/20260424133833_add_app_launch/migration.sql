-- CreateTable
CREATE TABLE "AppLaunch" (
    "id" SERIAL NOT NULL,
    "environment" TEXT NOT NULL,
    "launchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT,

    CONSTRAINT "AppLaunch_pkey" PRIMARY KEY ("id")
);
