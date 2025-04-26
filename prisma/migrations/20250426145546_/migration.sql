/*
  Warnings:

  - You are about to drop the column `encrypted_vault_key` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `salt` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `vault_key_iv` on the `teams` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "teams" DROP COLUMN "encrypted_vault_key",
DROP COLUMN "salt",
DROP COLUMN "vault_key_iv";

-- CreateTable
CREATE TABLE "team_vault_keys" (
    "id" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "vault_key_iv" TEXT NOT NULL,
    "encrypted_vault_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "team_vault_keys_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "team_vault_keys" ADD CONSTRAINT "team_vault_keys_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_vault_keys" ADD CONSTRAINT "team_vault_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
