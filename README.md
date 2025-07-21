# Senior Strength - Fitness App for Seniors

A React Native fitness app built with Expo and Supabase, designed specifically for senior citizens to track workouts, maintain streaks, and share progress with trusted contacts.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account

### Setup Instructions

1. **Clone and Install Dependencies**
   ```bash
   cd senior-strength
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Setup Supabase Database**
   - Create a new Supabase project
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase/schema.sql`
   - Run the SQL to create tables, RLS policies, and sample data

4. **Start Development Server**
   ```bash
   npm start
   ```

5. **Run on Device/Simulator**
   - Install Expo Go app on your phone
   - Scan QR code from terminal
   - Or press `i` for iOS simulator, `a` for Android emulator

## 🏗️ Project Structure

```
senior-strength/
├── app/                    # Expo Router pages
│   ├── auth/              # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── components/            # Reusable components
├── lib/                   # Utilities and configurations
│   └── supabase.ts       # Supabase client setup
├── assets/               # Images, fonts, etc.
├── supabase/             # Database schema and migrations
└── documentation/        # Project docs and requirements
```

## 🛠️ Tech Stack

- **Frontend**: React Native (Expo SDK 53)
- **Navigation**: Expo Router
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI Components**: Native React Native components
- **State Management**: React hooks
- **Notifications**: Expo Notifications
- **Payments**: Stripe React Native SDK
- **AI**: OpenAI API (for sentiment analysis)

## 📱 Features

### Phase 1 (Current)
- ✅ User authentication (email/password)
- ✅ User onboarding with profile setup
- ✅ Workout library with sitting/standing filters
- ✅ Progress tracking and statistics
- ✅ User profile management
- ✅ Database schema with RLS policies

### Upcoming Features
- Workout execution flow with timers
- Journal entries with AI sentiment analysis
- Streak tracking and badges
- Weekly email reports to trusted contacts
- Push notifications
- Stripe subscription integration

## 🗄️ Database Schema

The app uses the following main tables:
- `users` - Extended user profiles with fitness data
- `workouts` - Library of available exercises
- `workout_logs` - Completed workout sessions with journal entries

See `supabase/schema.sql` for complete schema definition.

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Supabase handles authentication and authorization
- Environment variables for sensitive configuration

## 🧪 Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
# iOS
eas build --platform ios

# Android  
eas build --platform android
```

### Database Migrations
When updating the database schema:
1. Update `supabase/schema.sql`
2. Run the new SQL in Supabase SQL Editor
3. Update TypeScript types in `lib/supabase.ts`

## 📋 Environment Variables

Required environment variables:
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key (for sentiment analysis)
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `POSTMARK_API_TOKEN` - Postmark API token (for emails)

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add meaningful comments for complex logic
3. Test on both iOS and Android
4. Update documentation for new features

## 📄 License

This project is proprietary software for Senior Strength fitness app.
