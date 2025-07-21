import { useEffect } from 'react'
import { router } from 'expo-router'
import { View, Text, ActivityIndicator } from 'react-native'
import { supabase } from '../lib/supabase'

export default function Index() {
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Check if user has completed onboarding
        const { data: user } = await supabase
          .from('users')
          .select('full_name, dob, trusted_contact_email')
          .eq('id', session.user.id)
          .single()

        if (user && user.full_name && user.dob && user.trusted_contact_email) {
          // User is fully onboarded, go to main app
          router.replace('/(tabs)')
        } else {
          // User needs to complete onboarding
          router.replace('/auth/onboarding')
        }
      } else {
        // No session, go to login
        router.replace('/auth/login')
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      router.replace('/auth/login')
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0066cc" />
      <Text style={{ marginTop: 16, fontSize: 16 }}>Loading Senior Strength...</Text>
    </View>
  )
}
