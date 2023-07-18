-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "password" VARCHAR(512) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
