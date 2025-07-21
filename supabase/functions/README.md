# Supabase Edge Functions

This directory contains the Supabase Edge Functions for the Senior Strength app. These functions run in the Deno runtime environment.

## Functions

### 1. `weekly-report`
Generates and sends weekly fitness reports via email to trusted contacts.

**Features:**
- Calculates weekly stats (workouts, minutes, active days, streak)
- Generates beautiful HTML email with calendar grid and sentiment analysis
- Sends via Postmark to user's trusted contact email

### 2. `send-push-notification`
Sends push notifications via Expo Push API.

**Features:**
- Supports individual user notifications
- Batch notification sending
- Integrates with Expo Push API

### 3. `check-inactivity`
Monitors user activity and sends reminder notifications for inactive users.

**Features:**
- Detects users inactive for 48+ hours
- Different message types based on inactivity duration
- Streak preservation reminders

## Deployment

### Prerequisites
1. Install Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Link to your project: `supabase link --project-ref YOUR_PROJECT_ID`

### Deploy Functions
```bash
# Deploy all functions
supabase functions deploy

# Deploy individual function
supabase functions deploy weekly-report
supabase functions deploy send-push-notification
supabase functions deploy check-inactivity
```

### Environment Variables
Set these in your Supabase project dashboard under Settings > Edge Functions:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
POSTMARK_SERVER_TOKEN=your_postmark_server_token
```

### Scheduling (Cron Jobs)
Set up cron jobs in your Supabase project or external service:

```bash
# Weekly reports - Every Monday at 6 AM
0 6 * * 1 curl -X POST "https://your-project.supabase.co/functions/v1/weekly-report"

# Inactivity check - Daily at 10 AM
0 10 * * * curl -X POST "https://your-project.supabase.co/functions/v1/check-inactivity"
```

## TypeScript Errors

The TypeScript errors you see in your IDE are expected because these functions are designed for the Deno runtime, not Node.js. The `@ts-ignore` comments suppress these errors.

**Common "errors" that are actually correct:**
- Deno import URLs (https://deno.land/...)
- Deno global object
- Request/Response types

These functions will work correctly when deployed to Supabase Edge Functions.

## Testing

You can test the functions locally using the Supabase CLI:

```bash
# Start local development
supabase start

# Test function locally
supabase functions serve

# Make test request
curl -X POST "http://localhost:54321/functions/v1/weekly-report" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Monitoring

Monitor function logs in your Supabase dashboard under Edge Functions > Logs.
