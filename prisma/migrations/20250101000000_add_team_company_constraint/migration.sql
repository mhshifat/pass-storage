-- Add companyId to Team table (only if column doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Team' AND column_name = 'companyId'
    ) THEN
        ALTER TABLE "Team" ADD COLUMN "companyId" TEXT;
    END IF;
END $$;

-- Create index for companyId (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS "Team_companyId_idx" ON "Team"("companyId");

-- Populate companyId from team members (use the companyId of the first member)
UPDATE "Team" t
SET "companyId" = (
  SELECT u."companyId"
  FROM "TeamMember" tm
  JOIN "User" u ON tm."userId" = u.id
  WHERE tm."teamId" = t.id
  LIMIT 1
);

-- Add foreign key constraint (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Team_companyId_fkey'
    ) THEN
        ALTER TABLE "Team" ADD CONSTRAINT "Team_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Create function to check that all team members belong to the same company
CREATE OR REPLACE FUNCTION check_team_member_company()
RETURNS TRIGGER AS $$
DECLARE
  team_company_id TEXT;
  user_company_id TEXT;
BEGIN
  -- Get the team's companyId
  SELECT "companyId" INTO team_company_id
  FROM "Team"
  WHERE id = NEW."teamId";
  
  -- Get the user's companyId
  SELECT "companyId" INTO user_company_id
  FROM "User"
  WHERE id = NEW."userId";
  
  -- If team has a companyId, user must belong to the same company
  IF team_company_id IS NOT NULL AND (user_company_id IS NULL OR user_company_id != team_company_id) THEN
    RAISE EXCEPTION 'User must belong to the same company as the team. Team company: %, User company: %', team_company_id, user_company_id;
  END IF;
  
  -- If team doesn't have a companyId yet, set it from the first member
  IF team_company_id IS NULL AND user_company_id IS NOT NULL THEN
    UPDATE "Team" SET "companyId" = user_company_id WHERE id = NEW."teamId";
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce company constraint on INSERT (only if it doesn't exist)
DROP TRIGGER IF EXISTS team_member_company_check_insert ON "TeamMember";
CREATE TRIGGER team_member_company_check_insert
BEFORE INSERT ON "TeamMember"
FOR EACH ROW
EXECUTE FUNCTION check_team_member_company();

-- Create trigger to enforce company constraint on UPDATE (only if it doesn't exist)
DROP TRIGGER IF EXISTS team_member_company_check_update ON "TeamMember";
CREATE TRIGGER team_member_company_check_update
BEFORE UPDATE ON "TeamMember"
FOR EACH ROW
EXECUTE FUNCTION check_team_member_company();

-- Also ensure team companyId cannot be changed if members exist
CREATE OR REPLACE FUNCTION check_team_company_change()
RETURNS TRIGGER AS $$
DECLARE
  member_company_id TEXT;
BEGIN
  -- If companyId is being changed and team has members, check all members belong to new company
  IF OLD."companyId" IS DISTINCT FROM NEW."companyId" AND NEW."companyId" IS NOT NULL THEN
    -- Check if any member belongs to a different company
    SELECT u."companyId" INTO member_company_id
    FROM "TeamMember" tm
    JOIN "User" u ON tm."userId" = u.id
    WHERE tm."teamId" = NEW.id
      AND (u."companyId" IS NULL OR u."companyId" != NEW."companyId")
    LIMIT 1;
    
    IF member_company_id IS NOT NULL THEN
      RAISE EXCEPTION 'Cannot change team company. Team has members from different company: %', member_company_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent team companyId change if members from different company exist (only if it doesn't exist)
DROP TRIGGER IF EXISTS team_company_change_check ON "Team";
CREATE TRIGGER team_company_change_check
BEFORE UPDATE ON "Team"
FOR EACH ROW
EXECUTE FUNCTION check_team_company_change();

