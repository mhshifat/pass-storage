# Password Encryption Migration Guide

## Overview

This guide explains how to migrate existing passwords from server-side encryption to client-side encryption.

## What Changed

- **Before**: Passwords were encrypted on the server using a single master key (`PASSWORD_ENCRYPTION_KEY`)
- **After**: Passwords are encrypted using user-specific keys derived from user ID
- **Benefit**: Passwords are never transmitted in plain text over the network

## Migration Process

### Prerequisites

1. **Database Backup**: Create a full backup of your database before running the migration
2. **Test Environment**: Test the migration in a development/staging environment first
3. **Maintenance Window**: Plan for a maintenance window as the migration may take time

### Running the Migration

1. **Backup Database**
   ```bash
   # Example PostgreSQL backup
   pg_dump -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Run Migration Script**
   ```bash
   cd web
   npm run migrate-passwords -- --confirm
   ```

3. **Monitor Progress**
   - The script processes passwords in batches of 100
   - Progress is displayed in real-time
   - Errors are logged and reported at the end

### Migration Script Options

The migration script (`scripts/migrate-passwords-to-client-encryption.ts`) supports:

- **Batch Processing**: Processes passwords in batches to avoid memory issues
- **Progress Tracking**: Shows real-time progress
- **Error Handling**: Continues processing even if individual passwords fail
- **Detailed Reporting**: Reports success, failure, and error details

### What the Migration Does

For each password:

1. **Detects Encryption Method**: Checks if password uses old or new encryption
2. **Decrypts with Old Method**: If old encryption detected, decrypts using server-side key
3. **Re-encrypts with New Method**: Encrypts using user-specific key (userId-based)
4. **Updates Database**: Saves the newly encrypted password
5. **Handles TOTP**: Also migrates TOTP secrets if present

### Post-Migration

After migration:

1. **Verify**: Test that passwords can be decrypted and displayed correctly
2. **Monitor**: Check application logs for any decryption errors
3. **Update Clients**: Ensure all clients (web app, extension) are using the latest code
4. **Cleanup**: Remove old migration scripts if desired (after verification period)

## Rollback Plan

If migration fails or causes issues:

1. **Restore Database**: Restore from backup
2. **Revert Code**: Revert to previous version that uses server-side decryption
3. **Investigate**: Review error logs to identify issues
4. **Fix and Retry**: Address issues and retry migration

## Troubleshooting

### Common Issues

1. **"Password cannot be decrypted"**
   - Password may be corrupted
   - Check if password was encrypted with a different key
   - Review password creation date and encryption method

2. **"Migration fails for specific user"**
   - Check if user ID is valid
   - Verify user's passwords in database
   - Try migrating that user's passwords individually

3. **"Web Crypto API not available"**
   - Ensure clients are using modern browsers
   - Check browser compatibility
   - Fallback to server-side decryption if needed

### Individual User Migration

To migrate passwords for a specific user:

```typescript
import { migrateUserPasswords } from "@/lib/server-crypto-migration"

const result = await migrateUserPasswords("user-id-here")
console.log(result)
```

### Individual Password Migration

To migrate a single password:

```typescript
import { migratePassword } from "@/lib/server-crypto-migration"

const result = await migratePassword("password-id-here")
console.log(result)
```

## Security Considerations

1. **Key Derivation**: User-specific keys are derived from user ID + salt
2. **Key Storage**: Master key remains on server, never transmitted to client
3. **Backward Compatibility**: System handles both old and new encryption during transition
4. **Error Handling**: Failed decryptions are handled gracefully

## Performance

- **Batch Size**: Default 100 passwords per batch
- **Speed**: ~100-500 passwords per second (depends on hardware)
- **Memory**: Low memory footprint due to batch processing
- **Database Load**: Minimal impact with proper indexing

## Support

If you encounter issues:

1. Check application logs
2. Review migration script output
3. Verify database integrity
4. Test with a small subset first

