-- AlterTable
ALTER TABLE "credentials" ALTER COLUMN "encrypted_vault_key" SET DATA TYPE TEXT,
ALTER COLUMN "salt" SET DATA TYPE TEXT,
ALTER COLUMN "vault_key_iv" SET DATA TYPE TEXT;
