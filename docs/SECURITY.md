# Security Documentation

This document outlines the security measures implemented in the PassStorage application to ensure production-ready security for a SaaS password management system.

## Table of Contents

1. [Encryption](#encryption)
2. [Authentication & Authorization](#authentication--authorization)
3. [Session Management](#session-management)
4. [Security Headers](#security-headers)
5. [Input Validation](#input-validation)
6. [Multi-Tenancy Isolation](#multi-tenancy-isolation)
7. [Password Security](#password-security)
8. [API Security](#api-security)
9. [Error Handling](#error-handling)
10. [Environment Variables](#environment-variables)
11. [Security Best Practices](#security-best-practices)

## Encryption

### Password Encryption

- **Algorithm**: AES-256-CBC
- **Key Management**: Separate encryption key for passwords (`PASSWORD_ENCRYPTION_KEY`)
- **Key Derivation**: PBKDF2 with 100,000 iterations and SHA-256
- **IV Generation**: Cryptographically secure random IV for each encryption
- **Storage**: Encrypted passwords stored in database with format: `iv:encrypted_data`

**Implementation**:
- Passwords are encrypted using `encryptPassword()` function
- TOTP secrets are encrypted using the same password encryption key
- Each encryption uses a unique IV (Initialization Vector)

### Email Settings Encryption

- **Algorithm**: AES-256-CBC
- **Key Management**: Separate encryption key for email settings (`EMAIL_ENCRYPTION_KEY`)
- **Purpose**: Encrypts SMTP credentials and email configuration

### Key Separation

The application uses separate encryption keys for:
1. **Passwords**: `PASSWORD_ENCRYPTION_KEY` - Used for password and TOTP secret encryption
2. **Email Settings**: `EMAIL_ENCRYPTION_KEY` - Used for SMTP credentials

This separation ensures that a compromise of one key doesn't affect the other.

## Authentication & Authorization

### Role-Based Access Control (RBAC)

- **System Roles**: SUPER_ADMIN, ADMIN, MANAGER, USER, AUDITOR
- **Permission System**: Granular permissions for each action
- **Permission Checks**: Both server-side (tRPC procedures) and client-side (UI components)

### Permission Enforcement

- **Server-Side**: All tRPC procedures use `protectedProcedure(permissionKey)`
- **Client-Side**: UI components check permissions before rendering actions
- **Navigation**: Sidebar navigation filters items based on permissions

### Multi-Factor Authentication (MFA)

- **Supported Methods**: TOTP, SMS, Email, WebAuthn
- **Device Trust**: Untrusted devices can require MFA
- **Session Management**: MFA verification status tracked in session

## Session Management

### Session Security

- **Token Type**: JWT (JSON Web Token)
- **Algorithm**: HS256
- **Storage**: HttpOnly cookies (prevents XSS attacks)
- **Secure Flag**: Enabled in production (HTTPS only)
- **SameSite**: Lax (CSRF protection)
- **Expiration**: Configurable (default: 30 minutes)
- **Database Tracking**: Sessions stored in database for revocation

### Session Features

- **Device Fingerprinting**: Tracks device information
- **IP Address Tracking**: Records IP address for security monitoring
- **Device Trust**: Trusted devices can skip MFA
- **Concurrent Sessions**: Configurable limit on concurrent sessions
- **Session Revocation**: Sessions can be revoked from database

## Security Headers

The application sets the following security headers via middleware:

- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **X-Frame-Options**: `DENY` - Prevents clickjacking
- **X-XSS-Protection**: `1; mode=block` - XSS protection
- **Referrer-Policy**: `strict-origin-when-cross-origin` - Controls referrer information
- **Strict-Transport-Security**: `max-age=31536000; includeSubDomains; preload` - HSTS (production only)
- **Content-Security-Policy**: Comprehensive CSP policy

### Content Security Policy

```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval'  # Next.js requirement
style-src 'self' 'unsafe-inline'
img-src 'self' data: https:
font-src 'self' data:
connect-src 'self'
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
upgrade-insecure-requests
```

## Input Validation

### Server-Side Validation

- **Zod Schemas**: All inputs validated using Zod schemas
- **Type Safety**: TypeScript ensures type safety
- **Sanitization**: Inputs sanitized before processing

### Password Policy

- **Minimum Length**: Configurable (default: 12 characters)
- **Complexity Requirements**: 
  - Uppercase letters
  - Lowercase letters
  - Numbers
  - Special characters
- **Policy Enforcement**: Server-side validation on password creation/update

## Multi-Tenancy Isolation

### Company Isolation

- **Subdomain-Based**: Each company has a unique subdomain
- **Database Filtering**: All queries filtered by `companyId`
- **Data Isolation**: Users can only access data from their company
- **Middleware**: Subdomain extracted and passed via headers

### Access Control

- **Password Ownership**: Users can only access their own passwords
- **Team Sharing**: Passwords can be shared with teams (within company)
- **Temporary Shares**: Time-limited password sharing links
- **Audit Logging**: All access attempts logged with company context

## Password Security

### Password Storage

- **Encryption**: All passwords encrypted at rest
- **No Plaintext**: Passwords never stored in plaintext
- **History**: Password history maintained (encrypted)
- **Strength Calculation**: Automatic strength assessment

### Password Features

- **Breach Detection**: Integration with Have I Been Pwned API (k-anonymity)
- **Password Rotation**: Automated password rotation policies
- **Expiration**: Optional password expiration dates
- **Strength Indicators**: Visual strength indicators (WEAK, MEDIUM, STRONG)

### Password Sharing

- **Temporary Links**: Time-limited sharing links
- **One-Time Access**: Optional one-time access links
- **Expiration**: Automatic expiration of shared passwords
- **Access Tracking**: Audit logs for password access

## API Security

### tRPC Security

- **Protected Procedures**: All sensitive operations use `protectedProcedure()`
- **Permission Checks**: Middleware checks permissions before execution
- **Input Validation**: All inputs validated with Zod
- **Error Handling**: Generic error messages to prevent information disclosure

### Rate Limiting

- **Login Attempts**: Configurable max login attempts
- **Lockout Duration**: Account lockout after failed attempts
- **IP Whitelisting**: Optional IP whitelist for enhanced security

## Error Handling

### Information Disclosure Prevention

- **Generic Errors**: Generic error messages for users
- **Detailed Logs**: Detailed errors logged server-side only
- **Stack Traces**: Stack traces never exposed to clients
- **Audit Logging**: Security events logged for investigation

### Error Types

- **Authentication Errors**: Generic "Invalid credentials" message
- **Authorization Errors**: "You do not have permission" message
- **Validation Errors**: Field-specific validation errors
- **System Errors**: Generic "An error occurred" message

## Environment Variables

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Session
SESSION_SECRET=your-secret-key-here

# Encryption Keys (32 characters each)
PASSWORD_ENCRYPTION_KEY=your-32-char-password-key
EMAIL_ENCRYPTION_KEY=your-32-char-email-key

# Node Environment
NODE_ENV=production
```

### Security Recommendations

1. **Never commit secrets**: Use `.env` files (gitignored)
2. **Use strong keys**: Generate cryptographically secure random keys
3. **Rotate keys regularly**: Plan for key rotation strategy
4. **Use secret management**: Consider AWS Secrets Manager, HashiCorp Vault, etc.
5. **Separate keys**: Use different keys for different purposes

## Security Best Practices

### Development

1. **Never log sensitive data**: Passwords, tokens, keys should never be logged
2. **Use HTTPS**: Always use HTTPS in production
3. **Keep dependencies updated**: Regularly update dependencies for security patches
4. **Code reviews**: Review all security-sensitive code changes
5. **Security testing**: Regular security audits and penetration testing

### Production

1. **HTTPS Only**: Enforce HTTPS for all connections
2. **Security Headers**: All security headers enabled
3. **Regular Backups**: Encrypted backups of database
4. **Monitoring**: Monitor for suspicious activity
5. **Incident Response**: Have an incident response plan

### Password Management

1. **Strong Master Passwords**: Enforce strong master passwords
2. **MFA Required**: Require MFA for all admin accounts
3. **Regular Audits**: Regular security audits
4. **Access Reviews**: Regular access reviews
5. **Least Privilege**: Grant minimum necessary permissions

## Security Checklist

Before deploying to production:

- [ ] All environment variables set and secure
- [ ] Encryption keys are strong and unique
- [ ] HTTPS enabled and enforced
- [ ] Security headers configured
- [ ] MFA enabled for admin accounts
- [ ] Rate limiting configured
- [ ] IP whitelisting configured (if needed)
- [ ] Audit logging enabled
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Security testing completed
- [ ] Incident response plan documented

## Reporting Security Issues

If you discover a security vulnerability, please report it to: [security@passstorage.com]

**Do not** create public GitHub issues for security vulnerabilities.

## Compliance

This application is designed to support:
- **SOC 2**: Security controls and audit logging
- **ISO 27001**: Information security management
- **GDPR**: Data protection and privacy
- **HIPAA**: Healthcare data protection (with proper configuration)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [tRPC Security](https://trpc.io/docs/security)
