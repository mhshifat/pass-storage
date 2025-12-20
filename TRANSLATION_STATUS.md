# Translation Implementation Status

## ✅ Completed
- i18n infrastructure setup (react-i18next)
- Translation files created (English & Bangla)
- I18nProvider integrated in app layout
- Language selector component
- **Components with translations:**
  - Login Form
  - Register Form
  - General Settings (partial)
  - Language Selector

## ❌ Not Yet Translated (Need Updates)

### High Priority Components:
1. **Dashboard** (`src/app/admin/page.tsx`)
   - "Dashboard", "Overview of your password management system"
   - Stats card labels: "Total Users", "Active Passwords", "Teams", "Security Events"

2. **Sidebar Navigation** (`src/components/shared/sidebar/sidebar-navigation.tsx`)
   - All navigation items: "Dashboard", "Users", "Teams", "Roles & Permissions", "Passwords", "Audit Logs", "Settings"
   - Settings submenu: "General", "Email", "Security", "MFA", "MFA Credentials"

3. **User Management** (`src/modules/users/client/`)
   - User form dialogs: "Add New User", "Edit User", "Full Name", "Email", etc.
   - User actions: "Delete User", "Reset Password", "Send Email"
   - User table headers and actions

4. **Password Management** (`src/modules/passwords/client/`)
   - Password form: "Add Password", "Edit Password", "Password Name", "Username", "URL"
   - Password table headers and actions
   - Security alerts: "Weak Passwords", "Expiring Passwords"

5. **Team Management** (`src/modules/teams/client/`)
   - Team form: "Create Team", "Edit Team", "Team Name", "Description"
   - Team table and actions

6. **Role Management** (`src/modules/roles/client/`)
   - Role form: "Create Role", "Edit Role", "View Permissions"
   - Role table and actions

7. **Settings Pages** (`src/modules/settings/client/`)
   - Email Settings
   - Security Settings
   - MFA Settings
   - MFA Credentials Settings

8. **Audit Logs** (`src/modules/audit-logs/client/`)
   - Table headers: "Action", "User", "Resource", "Time", "Status"
   - Filters and search

9. **Profile Page** (`src/app/admin/account/profile/page.tsx`)
   - "My Profile", "Profile Information", "Change Password"

10. **Common UI Elements**
    - Buttons: "Save", "Cancel", "Delete", "Edit", "Create", "Update"
    - Toasts/Notifications
    - Empty states
    - Error messages
    - Form validation messages

## How to Add Translations

### Step 1: Import useTranslation
```tsx
import { useTranslation } from "react-i18next"
```

### Step 2: Use the hook
```tsx
const { t } = useTranslation()
```

### Step 3: Replace hardcoded strings
```tsx
// Before:
<h1>Dashboard</h1>
<p>Overview of your password management system</p>

// After:
<h1>{t("dashboard.title")}</h1>
<p>{t("dashboard.description")}</p>
```

### Step 4: Add missing translations
If a translation key doesn't exist, add it to:
- `src/locales/en/common.json`
- `src/locales/bn/common.json`

## Next Steps

Would you like me to:
1. Update all critical components systematically?
2. Create a helper script to find all hardcoded strings?
3. Update specific components you prioritize?


