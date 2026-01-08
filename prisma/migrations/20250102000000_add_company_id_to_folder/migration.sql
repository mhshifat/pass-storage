-- Add companyId column to Folder table
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Folder' AND column_name = 'companyId'
    ) THEN
        ALTER TABLE "Folder" ADD COLUMN "companyId" TEXT;
    END IF;
END $$;

-- Create index on companyId
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'Folder' AND indexname = 'Folder_companyId_idx'
    ) THEN
        CREATE INDEX "Folder_companyId_idx" ON "Folder"("companyId");
    END IF;
END $$;

-- Add foreign key constraint
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Folder_companyId_fkey'
    ) THEN
        ALTER TABLE "Folder" ADD CONSTRAINT "Folder_companyId_fkey" 
        FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Populate companyId for existing folders from their passwords
UPDATE "Folder" f
SET "companyId" = (
    SELECT DISTINCT p."ownerId"
    FROM "Password" p
    WHERE p."folderId" = f.id
    LIMIT 1
)
WHERE f."companyId" IS NULL
AND EXISTS (
    SELECT 1 FROM "Password" p
    WHERE p."folderId" = f.id
);

-- For folders with passwords, get companyId from the password owner
UPDATE "Folder" f
SET "companyId" = (
    SELECT u."companyId"
    FROM "Password" p
    INNER JOIN "User" u ON p."ownerId" = u.id
    WHERE p."folderId" = f.id
    LIMIT 1
)
WHERE f."companyId" IS NULL
AND EXISTS (
    SELECT 1 FROM "Password" p
    INNER JOIN "User" u ON p."ownerId" = u.id
    WHERE p."folderId" = f.id AND u."companyId" IS NOT NULL
);

