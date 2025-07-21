# 📘 Product Requirements Document (PRD)

## 🧱 Project: Senior Strength (Native Rebuild)

Senior Strength is a fitness training app designed specifically for senior citizens. This rebuild uses **React Native (via Expo)** and **Supabase** to deliver a polished, performant, and fully native experience on iOS and Android.

---

## 🎯 Goals

- Deliver a native fitness app that is accessible and easy to use for seniors.
- Enable tracking of completed workouts, time spent, and journaling.
- Allow users to browse a variety of sitting or standing workouts — not a fixed daily plan.
- Send a weekly email report to a trusted contact showing progress.
- Include video demos, gamified progress (streaks + badges), and AI-powered journaling.
- Support subscription and reminders via push notifications.
- ✅ Use Expo Notifications and Tamagui UI to ensure fast iteration and native performance.

---

## 📱 Core Features

### 1. **Authentication**
- Sign up / login with email + password.
- Support magic link login.
- Optional social login (Google/Facebook).
- Profile setup: Name, DOB, Trusted Contact Email.

### 2. **Workout Library**
- Browse from a categorized list of workouts:
  - Sitting workouts
  - Standing workouts
- Filter or search based on type.
- Each workout shows:
  - Title, duration, difficulty
  - Video preview or demo

### 3. **Workout Flow & Logging**
- User selects a workout to begin.
- Step-by-step flow through each exercise (sets or time-based).
- Timer with sound + haptics.
- At end of workout:
  - Show completion screen
  - Prompt user to fill out journal entry:
    - How did it go?
    - How do you feel?
- Store journal + workout stats in Supabase.

### 4. **Progress Tracking**
- Show weekly/monthly/yearly stats:
  - Total workouts completed
  - Total minutes
  - Active days
- Streak tracking (consecutive days or weeks)
- Gamified badges (e.g., "3-Day Streak", "Workout Hero")

### 5. **AI Journal Sentiment Analysis**
- Use OpenAI to analyze tone of user journal
- Track patterns over time (e.g., “positive trend”)
- Optionally show mood graph or summary

### 6. **Weekly Report Email**
- Every Monday at 6:00 AM.
- Summary of completed workouts, total minutes, and active days.
- Sent via Resend to trusted contact.
- Includes calendar grid + optional AI journal summary.

### 7. **Subscription**
- Monthly plan: $2.99/month (5-day free trial).
- Managed via **Stripe**
- Show subscription status and allow cancellation.
- Trigger access restrictions if not subscribed.

### 8. **Notifications**
- Push notifications via **Expo Notifications API**
  - Register device push token
  - Triggered via Supabase Edge Functions
  - Reminder for inactivity or to complete a streak

---

## 🛠 Stack

| Layer | Tech |
|-------|------|
| Frontend | React Native (Expo SDK 50+) |
| UI Components | **Tamagui** (Shadcn-inspired, cross-platform native UI) |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Email | Resend |
| Notifications | Expo Notifications |
| Payments | **Stripe (mobile SDK)** |
| AI | OpenAI API (sentiment analysis) |
| Deployment | Expo EAS Build + TestFlight / Google Play |

---

## 🧪 Phase 1 Scope (Confirmed)

- Workout library + filtering
- Workout logging with journaling
- Video previews per exercise
- AI journal sentiment tagging
- Weekly email report to trusted contact
- Streak tracking + gamified badges
- Stripe subscription system
- Push notification reminders

---

## 📅 Timeline

| Milestone | Target |
|----------|--------|
| Project Setup & Auth | Week 1 |
| Workout Library + Flow + Video | Week 2 |
| Journaling + AI Analysis + Streaks | Week 3 |
| Stripe Subscriptions + Notifications | Week 4 |
| TestFlight Beta & Launch Prep | Week 5 |

---

## 👤 Target User

- Age: 60+
- Needs: Simple UI, flexible workout options, positive encouragement.
- Secondary: Children/caregivers receiving weekly reports.

---

## 🧭 Success Criteria

- More than 50% of users submit a journal entry after completing a workout.
- Weekly reports are delivered to trusted contacts over 90% of the time.
- 70% subscription retention rate after 30 days.
- Users begin earning streak badges within their first week.

---
