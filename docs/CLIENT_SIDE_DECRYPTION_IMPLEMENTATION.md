# Client-Side Decryption Implementation

## Overview

This document describes the implementation of client-side password decryption (Option 3) to prevent plain text passwords from being transmitted over the network.

## Architecture

### Key Derivation

Both client and server use the same key derivation method:

```
Key = PBKDF2(userId, salt="password_encryption_salt", iterations=100000, length=256 bits, hash=SHA-256)
```

**Parameters:**
- **Key Material**: User ID (string)
- **Salt**: "password_encryption_salt" (consistent across all users)
- **Iterations**: 100,000
- **Key Length**: 256 bits (32 bytes)
- **Hash Algorithm**: SHA-256

### Encryption Format

Encrypted passwords are stored in the format:
```
iv:encrypted_data
```

Where:
- `iv` = Initialization Vector (16 bytes, hex-encoded)
- `encrypted_data` = Encrypted password (hex-encoded)

### Migration Strategy

1. **Existing Passwords**: Encrypted with server-side `PASSWORD_ENCRYPTION_KEY`
2. **New Passwords**: Encrypted with user-specific key (userId-based)
3. **Migration**: Re-encrypt existing passwords using migration utility

## Implementation Files

### Server-Side

- **`web/src/lib/server-crypto-migration.ts`**: Migration utilities
  - `migratePassword()`: Migrate single password
  - `migrateUserPasswords()`: Migrate all passwords for a user
  - `migrateAllPasswords()`: Migrate all passwords in database

- **`web/src/lib/crypto.ts`**: Server-side encryption (old method)
  - `encryptPassword()`: Encrypt with server-side key
  - `decryptPassword()`: Decrypt with server-side key

### Client-Side (Web App)

- **`web/src/lib/client-crypto.ts`**: Client-side crypto utilities
  - `decryptPasswordClient()`: Decrypt password using Web Crypto API
  - `encryptPasswordClient()`: Encrypt password using Web Crypto API
  - `deriveDecryptionKey()`: Derive user-specific key

- **`web/src/hooks/use-password-decryption.ts`**: React hook for decryption
  - Automatically decrypts passwords when received from API
  - Handles loading states and errors

### Client-Side (Extension)

- **`extensions/lib/client-crypto.ts`**: Extension crypto utilities
  - Same API as web app version
  - Uses Web Crypto API available in extension context

## Migration Process

### Step 1: Backup Database

```bash
pg_dump -U username -d database_name > backup.sql
```

### Step 2: Run Migration

```bash
cd web
npm run migrate-passwords -- --confirm
```

### Step 3: Verify

- Test password decryption in web app
- Test password decryption in extension
- Check for any errors in logs

## Security Considerations

### Current Implementation

- **Key Derivation**: Uses userId only (not ideal for production)
- **Salt**: Consistent salt across all users
- **Iterations**: 100,000 (good, but could be higher)

### Production Recommendations

1. **Enhanced Key Derivation**: Combine userId with a master key
   - Master key stored securely on server
   - Exchanged securely with client during session
   - Or derived from user's master password

2. **User-Specific Salts**: Use unique salt per user
   - Store salt in user record
   - Prevents rainbow table attacks

3. **Higher Iterations**: Increase PBKDF2 iterations
   - Current: 100,000
   - Recommended: 200,000+ (adjust based on performance)

4. **Key Rotation**: Implement key rotation strategy
   - Periodically re-encrypt passwords with new keys
   - Handle key versioning

## Backward Compatibility

The system handles both encryption methods:

1. **Old Encryption**: Server-side key (`PASSWORD_ENCRYPTION_KEY`)
   - Detected by attempting decryption
   - Automatically migrated when password is updated

2. **New Encryption**: User-specific key (userId-based)
   - Flagged with `passwordEncrypted: true`
   - Decrypted client-side

## Testing

### Manual Testing

1. **Before Migration**:
   - Verify passwords display correctly (server-side decryption)
   - Check that API returns encrypted passwords

2. **After Migration**:
   - Verify passwords display correctly (client-side decryption)
   - Test password creation (should use new encryption)
   - Test password updates (should re-encrypt with new method)

### Automated Testing

```typescript
// Test key derivation matches
const serverKey = deriveUserEncryptionKey("test-user-id")
const clientKey = await deriveDecryptionKey("test-user-id")
// Keys should match
```

## Troubleshooting

### Passwords Won't Decrypt

1. **Check Migration**: Verify password was migrated
2. **Check User ID**: Ensure correct userId is used
3. **Check Key Derivation**: Verify client and server use same method
4. **Check Format**: Verify encrypted password format is correct

### Migration Fails

1. **Check Database**: Verify database connection
2. **Check Permissions**: Ensure script has write access
3. **Check Logs**: Review error messages
4. **Test Single Password**: Try migrating one password manually

## Future Improvements

1. **Master Password**: Implement user master password for key derivation
2. **Key Exchange**: Secure key exchange mechanism
3. **Zero-Knowledge**: Full zero-knowledge architecture
4. **Hardware Security**: HSM integration for enterprise
