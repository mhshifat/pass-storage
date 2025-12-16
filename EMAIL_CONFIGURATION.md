# Email Configuration Guide

This application uses nodemailer for sending emails. Follow these steps to configure email settings:

## Setup Instructions

### 1. Configure SMTP Settings

Navigate to **Admin → Settings → Email** and configure the following:

#### SMTP Server Settings
- **SMTP Host**: Your email server hostname (e.g., `smtp.gmail.com`, `smtp.office365.com`)
- **SMTP Port**: 
  - `587` for TLS (recommended)
  - `465` for SSL
  - `25` for unencrypted (not recommended)
- **Encryption**: Choose TLS or SSL based on your server requirements

#### Authentication
- **SMTP Username**: Your email account username (usually your email address)
- **SMTP Password**: Your email account password or app-specific password

#### Sender Information
- **From Email Address**: The email address that will appear as the sender
- **From Name**: The name that will appear as the sender (e.g., "PassStorage")

### 2. Test Configuration

After saving your settings, use the **Send Test Email** feature to verify everything works correctly.

## Common SMTP Providers

### Gmail
- Host: `smtp.gmail.com`
- Port: `587` (TLS) or `465` (SSL)
- **Important**: You need to use an [App Password](https://support.google.com/accounts/answer/185833)

### Microsoft 365 / Outlook
- Host: `smtp.office365.com`
- Port: `587` (TLS)
- Username: Your full email address

### SendGrid
- Host: `smtp.sendgrid.net`
- Port: `587` (TLS)
- Username: `apikey`
- Password: Your SendGrid API key

### Amazon SES
- Host: `email-smtp.[region].amazonaws.com`
- Port: `587` (TLS)
- Username: Your SMTP username from AWS
- Password: Your SMTP password from AWS

## Features

### Send Email to Users
- Navigate to **Admin → Users**
- Click the three dots menu on any user
- Select **Send Email**
- Compose and send your message

### Audit Trail
All sent emails are logged in the audit log for compliance and tracking purposes.

## Troubleshooting

### Email not sending?
1. Verify SMTP settings are correct
2. Check if your email provider requires app-specific passwords
3. Ensure firewall allows outbound connections on the SMTP port
4. Check audit logs for error messages

### Gmail blocking sign-in?
- Enable "Less secure app access" or use an App Password
- Visit: https://myaccount.google.com/security

### Test email not received?
- Check spam/junk folder
- Verify the recipient email address is correct
- Review server logs for error messages
