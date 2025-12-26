# Vercel Timeout Fix for Subdomains

## Problem

When accessing subdomains on Vercel (e.g., `test.passbangla.com/login`), you may encounter:
- `500 Internal Server Error`
- `504 Gateway Timeout`
- `FUNCTION_INVOCATION_TIMEOUT`

## Root Cause

The `getSession()` function in `src/lib/session.ts` makes a database query on every page load to verify the session token. If the database connection is slow or times out, the entire page request fails.

## Solution Applied

### 1. Added Timeout Handling to `getSession()`

The function now:
- Uses `Promise.race()` to add a 5-second timeout to database queries
- Falls back to JWT verification only if the database query fails
- Allows the app to continue working even if the database is slow/unavailable

### 2. Added Error Handling to Auth Layout

The auth layout now:
- Catches errors from `getSession()` 
- Allows the page to render even if session check fails
- Prevents the entire page from crashing due to database timeouts

## Additional Recommendations

### 1. Database Connection Pooling

Ensure your database provider (e.g., PlanetScale, Supabase, Neon) has:
- Connection pooling enabled
- Sufficient connection limits
- Fast connection times

### 2. Vercel Function Timeout

Vercel has different timeout limits:
- **Hobby Plan**: 10 seconds
- **Pro Plan**: 60 seconds
- **Enterprise**: Custom

If you're on Hobby plan and queries take longer, consider:
- Optimizing database queries
- Using caching (Redis, Upstash)
- Upgrading to Pro plan

### 3. Database Query Optimization

Consider:
- Adding indexes on `sessionToken` column
- Using connection pooling
- Implementing session caching (Redis)

### 4. Environment Variables

Ensure these are set in Vercel:
- `DATABASE_URL` - Your database connection string
- `SESSION_SECRET` - Secure session secret
- Any other required environment variables

## Testing

After deploying the fix:

1. **Test subdomain access:**
   - Visit: `https://test.passbangla.com/login`
   - Should load without timeout errors

2. **Test with slow database:**
   - The page should still load (with graceful degradation)
   - Login should still work

3. **Check Vercel logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Check for any timeout errors
   - Review function execution times

## Monitoring

Monitor these metrics:
- Function execution time (should be < 5 seconds)
- Database query time (should be < 1 second)
- Error rate (should decrease after fix)

## If Issues Persist

1. **Check Vercel Function Logs:**
   - Look for specific error messages
   - Check function execution times

2. **Check Database:**
   - Verify connection string is correct
   - Check database is accessible from Vercel
   - Review database connection limits

3. **Check Environment Variables:**
   - Ensure all required vars are set
   - Verify they're correct for production

4. **Consider Caching:**
   - Implement Redis/Upstash for session caching
   - Cache database queries where possible

