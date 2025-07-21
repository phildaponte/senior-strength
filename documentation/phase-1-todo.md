# ✅ Phase 1 – TODO Checklist (Expanded Scope)

This checklist reflects all deliverables for the Senior Strength native app, including new Phase 1 features: video demos, AI sentiment analysis, streaks, and Stripe subscriptions.

---

## 🔧 Project Setup
- [x] Initialize Expo project (`npx create-expo-app`)
- [x] Setup EAS build and configure iOS/Android bundle IDs
- [x] Install core packages:
  - [x] `supabase-js`
  - [x] `tamagui`, `@tamagui/core`, `expo-router`
  - [x] `expo-av` for video playback
  - [x] `expo-notifications`, `expo-haptics`, `expo-speech`
  - [x] `@stripe/stripe-react-native`
  - [x] `openai` for sentiment analysis (optional server-side)
- [x] Setup folder structure
  - `/app`, `/components`, `/lib`, `/assets`, `/supabase`

---

## 📄 Supabase Schema & RLS Setup
- [x] Create SQL schema for the following tables:
  - [x] `users` (custom fields: full_name, dob, trusted_contact_email, push_token, current_streak, badges, is_subscribed)
  - [x] `workouts` (title, type, duration, difficulty, video_url, exercises JSON)
  - [x] `workout_logs` (user_id, workout_id, date, duration_seconds, journal_text, sentiment_tag)
  - [x] `streaks` (optional: or calculated in `users`)
  - [x] `weekly_reports` (optional: cached weekly data)
- [x] Define foreign keys and indexing (e.g., `workout_logs.user_id → users.id`)
- [x] Write and run SQL migrations in Supabase SQL Editor
- [x] Enable **Row-Level Security (RLS)** on all tables
- [x] Create **RLS policies**:
  - [x] `users`: users can only read/write their own profile
  - [x] `workout_logs`: user can insert and read only their own logs
  - [x] `workouts`: public read access (preloaded workouts)
  - [x] `weekly_reports`: user can read only their own report (if used)

---

## 👤 Auth & Onboarding
- [x] Connect Supabase + environment setup
- [x] Implement login and signup
- [x] Onboarding screen:
  - [x] Name
  - [x] Date of birth
  - [x] Trusted Contact Email
- [x] Save profile data to `users` table

---

## 📚 Workout Library
- [x] Create `workouts` table in Supabase:
  - `title`, `type`, `duration`, `difficulty`, `exercises (JSON)`, `video_url`
- [x] Build Workout Library screen:
  - [x] Sitting vs. Standing filter
  - [x] Workout cards with title, duration, preview
  - [x] Navigation to workout details/flow
  - [ ] Play video preview with Expo AV (placeholder for future)

---

## 🏋️ Workout Flow
- [x] Step-by-step exercise flow (sets or time-based)
- [x] Add timer per exercise
- [x] Use vibration + haptic feedback when done
- [x] Mark workout complete
- [x] Progress tracking through exercises
- [x] Navigation between workout screens

---

## 📓 Journaling + Sentiment AI
- [x] End-of-workout journal prompt
  - "How did it go?" (text)
  - "How do you feel?" (emoji mood scale)
- [x] Save entry to `workout_logs`:
  - Include timestamp, duration, workout_id, sentiment
- [x] AI sentiment analysis utility (OpenAI + keyword fallback)
- [x] Store `sentiment_tag` (positive / neutral / negative)

---

## 📈 Streaks + Badges
- [x] Calculate streak based on consecutive workout days
- [x] Update `users` table with:
  - `current_streak`, `longest_streak`, `badges` (list)
- [x] Badge system:
  - "3-Day Streak", "First Workout", "Weekly Hero", and more
- [x] Show on progress screen with BadgeSystem component
- [x] Automatic badge awarding after workout completion

---

## 📆 Progress Summary
- [x] Weekly, monthly, and yearly stats:
  - Total minutes, workout count, active days
- [x] Calendar UI to show completed days (last 30 days)
- [x] List or grid of past journal entries with sentiment badges
- [x] Tabbed interface (Stats/Calendar/Journal views)
- [x] Modal for viewing all journal entries

---

## 📧 Weekly Report Email (Resend)
- [x] Supabase Edge Function to generate the report (`weekly-report`)
- [x] Send to `trusted_contact_email` with sentiment and daily summary
- [x] Beautiful HTML email template with:
  - Weekly stats (workouts, minutes, active days, streak)
  - Calendar grid showing workout days
  - Sentiment analysis summary with visual bar
  - Journal entry highlights
- [x] Test functionality in profile screen
- [x] Utility functions for triggering reports
- [x] Schedule Supabase Edge Function for Monday 6am
- [x] Fetch workout logs from past week
- [x] Generate:
  - Total workouts, active days, minutes
- [x] Include sentiment summary (e.g., 3 Positive / 1 Neutral)
- [x] Send to `trusted_contact_email` using Resend API

---

## 🔔 Push Notifications
- [x] Expo Push Notifications setup and registration
- [x] Push token storage in user profiles
- [x] Supabase Edge Function for sending notifications (`send-push-notification`)
- [x] Inactivity reminder system (`check-inactivity`):
  - 48-hour+ inactivity detection
  - Different message types based on inactivity duration
  - Streak preservation reminders
- [x] Notification handling and navigation
- [x] Test notification functionality in profile screen
- [x] Notification settings display
- [x] Store push token in `users` table
- [x] Create Edge Function:
  - Notify user if no workouts in last 48h
  - “Keep your streak alive!” type message
- [x] Send push via `https://exp.host/--/api/v2/push/send`

---

## 💳 Stripe Subscription
- [ ] Install and configure `@stripe/stripe-react-native`
- [ ] Create product + price in Stripe Dashboard
- [ ] Implement subscription screen:
  - [ ] Show $2.99/month with 5-day trial
  - [ ] Checkout flow
- [ ] On success:
  - Update `users` table with `is_subscribed = true`
- [ ] Add conditional access to workouts:
  - If not subscribed, lock access with prompt to upgrade
- [ ] Handle webhook to keep status in sync

---

## 📦 Internal Testing & Deployment
- [ ] Build `.ipa` and `.aab` with:
  ```bash
  npx eas build --platform ios
  npx eas build --platform android
  ```
- [ ] Upload to TestFlight and Google Play Console (Internal Testing)
- [ ] Test all features on device:
  - Workout log
  - Journal flow
  - Video playback
  - Push reminders
  - Weekly report (via logs)
  - Subscription access control

---

## 🧭 Final Phase 1 Completion Criteria
- [ ] User can sign up, browse workouts, and complete sessions
- [ ] Journal entries are saved and analyzed
- [ ] Weekly report is sent to trusted contact
- [ ] Push reminders work based on inactivity
- [ ] Streaks + badges display properly
- [ ] Stripe subscription flow works and limits access if unpaid
- [ ] Test builds available on iOS and Android

## 🔄 Recent Updates

### Email Provider Migration (Completed)
- [x] **Migrated from Postmark to Resend** for email delivery
- [x] Updated weekly-report Edge Function to use Resend API
- [x] Changed environment variable from `POSTMARK_SERVER_TOKEN` to `RESEND_API_KEY`
- [x] Updated all documentation and configuration files
- [x] Maintained Deno compatibility for Supabase Edge Functions

