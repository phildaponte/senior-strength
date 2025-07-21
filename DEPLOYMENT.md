# 🚀 Senior Strength - Deployment Guide

## Phase 2 Features Deployment Checklist

### Prerequisites

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Install Expo CLI** (if not already installed)
   ```bash
   npm install -g @expo/cli
   ```

3. **Environment Variables**
   Make sure your `.env` file contains:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   EXPO_PUBLIC_PROJECT_ID=your_expo_project_id
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
   ```

### 🔧 Supabase Edge Functions Deployment

1. **Login to Supabase**
   ```bash
   supabase login
   ```

2. **Link to your project**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Deploy all functions**
   ```bash
   cd supabase/functions
   supabase functions deploy weekly-report
   supabase functions deploy send-push-notification
   supabase functions deploy check-inactivity
   ```

4. **Set Environment Variables in Supabase Dashboard**
   Go to Settings > Edge Functions and add:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   RESEND_API_KEY=your_resend_api_key
   ```

### 📧 Resend Setup

1. **Create Resend Account** at https://resend.com
2. **Create a Server** and get your Server Token
3. **Verify your sender domain** or use a verified email
4. **Update the sender email** in the weekly-report function if needed

### 📱 Expo Push Notifications Setup

1. **Get your Expo Project ID** from your Expo dashboard
2. **Update EXPO_PUBLIC_PROJECT_ID** in your .env file
3. **Test push notifications** work on physical devices (not simulator)

### ⏰ Automated Scheduling (Optional)

Set up cron jobs for automated reports:

**Option 1: GitHub Actions**
Create `.github/workflows/weekly-reports.yml`:
```yaml
name: Weekly Reports
on:
  schedule:
    - cron: '0 6 * * 1'  # Every Monday at 6 AM UTC
jobs:
  send-reports:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Weekly Reports
        run: |
          curl -X POST "${{ secrets.SUPABASE_URL }}/functions/v1/weekly-report" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

**Option 2: External Cron Service**
Use services like cron-job.org or EasyCron:
- Weekly reports: `https://your-project.supabase.co/functions/v1/weekly-report`
- Inactivity check: `https://your-project.supabase.co/functions/v1/check-inactivity`

## 🧪 Testing Checklist

### App Features Testing

- [ ] **Progress Screen**
  - [ ] Stats tab shows correct workout counts
  - [ ] Calendar tab displays workout days
  - [ ] Journal tab shows entries with sentiment badges
  - [ ] Modal opens for full journal view

- [ ] **Profile Screen**
  - [ ] "Send Test Weekly Report" button works
  - [ ] "Test Push Notification" schedules local notification
  - [ ] "View Weekly Stats" shows current data
  - [ ] "Notification Settings" displays permission status

### Backend Functions Testing

- [ ] **Weekly Report Function**
  ```bash
  curl -X POST "https://your-project.supabase.co/functions/v1/weekly-report" \
    -H "Authorization: Bearer YOUR_ANON_KEY" \
    -H "Content-Type: application/json"
  ```

- [ ] **Push Notification Function**
  ```bash
  curl -X POST "https://your-project.supabase.co/functions/v1/send-push-notification" \
    -H "Authorization: Bearer YOUR_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{"userId": "user-id", "title": "Test", "body": "Test notification"}'
  ```

- [ ] **Inactivity Check Function**
  ```bash
  curl -X POST "https://your-project.supabase.co/functions/v1/check-inactivity" \
    -H "Authorization: Bearer YOUR_ANON_KEY" \
    -H "Content-Type: application/json"
  ```

### Email Testing

- [ ] Set up a test user with a trusted contact email
- [ ] Complete a few workouts with journal entries
- [ ] Use "Send Test Weekly Report" in profile
- [ ] Check email delivery and formatting

### Push Notification Testing

- [ ] Install app on physical device
- [ ] Grant notification permissions
- [ ] Test local notification from profile screen
- [ ] Test inactivity reminders (simulate 48+ hour gap)

## 🐛 Troubleshooting

### Common Issues

1. **TypeScript Errors in Edge Functions**
   - These are expected for Deno functions
   - Functions will work correctly when deployed
   - Ignore IDE warnings for supabase/functions/*.ts files

2. **Push Notifications Not Working**
   - Ensure you're testing on a physical device
   - Check notification permissions in device settings
   - Verify EXPO_PUBLIC_PROJECT_ID is correct

3. **Email Not Sending**
   - Verify Resend API key
   - Check sender email is verified in Resend
   - Look at Supabase Edge Function logs

4. **Database Connection Issues**
   - Verify RLS policies allow function access
   - Check service role key has proper permissions
   - Ensure database schema matches function queries

### Monitoring

- **Supabase Dashboard**: Monitor Edge Function logs
- **Resend Dashboard**: Track email delivery
- **Expo Dashboard**: Monitor push notification delivery

## 🎯 Next Steps

1. **Deploy to production** following this checklist
2. **Test all features** thoroughly
3. **Set up monitoring** for functions and emails
4. **Configure automated scheduling** for reports
5. **Consider adding Stripe subscriptions** (next phase)

## 📞 Support

If you encounter issues:
1. Check Supabase Edge Function logs
2. Verify all environment variables are set
3. Test functions individually using curl
4. Check database permissions and RLS policies
