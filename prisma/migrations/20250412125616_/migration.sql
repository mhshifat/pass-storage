-- AlterTable
ALTER TABLE "tokens" ADD COLUMN     "team_id" TEXT;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
