import { Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import { initializePushNotifications, addNotificationResponseReceivedListener } from '../lib/notifications'
import { router } from 'expo-router'

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setLoading(false)
      
      // Initialize push notifications when user signs in
      if (event === 'SIGNED_IN' && session) {
        await initializePushNotifications()
      }
    })

    // Handle notification taps
    const notificationSubscription = addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data
      
      // Navigate based on notification data
      if (data?.action === 'open_workouts') {
        router.push('/(tabs)/')
      } else if (data?.action === 'open_progress') {
        router.push('/(tabs)/progress')
      }
    })

    return () => {
      subscription.unsubscribe()
      notificationSubscription.remove()
    }
  }, [])

  if (loading) {
    // You can replace this with a proper loading screen component
    return null
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Auth screens */}
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />
      <Stack.Screen name="auth/onboarding" />
      
      {/* Main app screens */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  )
}
