# Clerk Auth Deployment Guide

## What Clerk Does

We use Clerk for authentication. It handles:
- User signup/login (email/password + OAuth)
- JWT token generation
- User profile management (username, email)
- Webhooks to sync user data to our database

## Local Development

Currently using **ngrok** to forward webhooks from Clerk to your local machine:
- Ngrok URL: `https://xxxx.ngrok.io/webhooks/clerk`
- Configured in Clerk Dashboard → Webhooks

## Production Deployment Checklist

When you deploy to production:

### 1. Update Webhook URL in Clerk Dashboard
- Go to [Clerk Dashboard](https://dashboard.clerk.com)
- Navigate to: **Webhooks** section
- Delete the ngrok webhook endpoint
- Add new endpoint: `https://yourdomain.com/webhooks/clerk`
- Events to subscribe to:
  - `user.created`
  - `user.updated`
  - `user.deleted`

### 2. Update Environment Variables
Make sure your production backend has:
```
CLERK_PUBLISHABLE_KEY=pk_live_xxxx
CLERK_SECRET_KEY=sk_live_xxxx
CLERK_WEBHOOK_SECRET=whsec_xxxx
```
(Use **live** keys, not **test** keys)

### 3. Update Frontend Environment Variables
Update your production frontend:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxx
```

### 4. Update Redirect URLs in Clerk Dashboard
- Go to: **Paths** section
- Update these URLs to your production domain:
  - Sign-in URL: `https://yourdomain.com`
  - Sign-up URL: `https://yourdomain.com`
  - After sign-in: `https://yourdomain.com`
  - After sign-up: `https://yourdomain.com`

### 5. Configure Allowed Origins (CORS)
- Go to: **API Keys** section → **Advanced**
- Add your production frontend URL to allowed origins

## Testing Production Auth

1. Sign up with a new account on production
2. Check backend logs - should see: `INFO: Created local user (ID: X) for Clerk user: user_xxx`
3. Check database - user should exist in `users` table
4. Try username change in Clerk profile - should sync to DB
5. Try profanity username (e.g., "fuckthisshit") - should auto-sanitize to `user_xxxxxxxx`

## Troubleshooting

**Webhook not firing:**
- Check webhook URL is correct in Clerk Dashboard
- Verify webhook secret matches in `.env`
- Check backend logs for signature verification errors

**401 Unauthorized:**
- Verify you're using **live** keys in production (not test keys)
- Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set correctly in frontend
- Make sure backend `CLERK_SECRET_KEY` matches Clerk dashboard

**User not syncing:**
- Check webhook events are enabled (`user.created`, `user.updated`, `user.deleted`)
- Verify backend logs show webhook received
- Check database for user creation errors

## Important Notes

- **Profanity Filter**: Usernames are auto-filtered using `go-away` library. Users see sanitized usernames in app, original in Clerk.
- **No ngrok in prod**: Remove ngrok completely - use your actual domain for webhooks
- **Live vs Test keys**: Never mix test and live keys - they don't work together
