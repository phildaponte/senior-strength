import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { supabase } from './supabase'

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export interface PushNotificationToken {
  token: string
  platform: 'ios' | 'android'
}

/**
 * Register for push notifications and get the Expo push token
 * This function handles permission requests and device registration
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null

  // Check if running on a physical device
  if (Device.isDevice) {
    // Get existing permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    // Request permissions if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    // If permission denied, return null
    if (finalStatus !== 'granted') {
      console.log('Push notification permission denied')
      return null
    }

    // Get the Expo push token
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID, // Your Expo project ID
      })
      token = tokenData.data
      console.log('Push token obtained:', token)
    } catch (error) {
      console.error('Failed to get push token:', error)
      return null
    }
  } else {
    console.log('Push notifications require a physical device')
  }

  // Configure notification channels for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }

  return token
}

/**
 * Save push token to user profile in Supabase
 */
export async function savePushTokenToProfile(token: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('No authenticated user found')
      return false
    }

    const { error } = await supabase
      .from('users')
      .update({ push_token: token })
      .eq('id', user.id)

    if (error) {
      console.error('Failed to save push token:', error)
      return false
    }

    console.log('Push token saved successfully')
    return true
  } catch (error) {
    console.error('Error saving push token:', error)
    return false
  }
}

/**
 * Initialize push notifications for the app
 * Call this on app startup after user authentication
 */
export async function initializePushNotifications(): Promise<void> {
  try {
    const token = await registerForPushNotificationsAsync()
    
    if (token) {
      await savePushTokenToProfile(token)
    }
  } catch (error) {
    console.error('Failed to initialize push notifications:', error)
  }
}

/**
 * Schedule a local notification (for testing purposes)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  delaySeconds: number = 5
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: {
        seconds: delaySeconds,
      },
    })
    console.log('Local notification scheduled')
  } catch (error) {
    console.error('Failed to schedule local notification:', error)
  }
}

/**
 * Send push notification via Supabase Edge Function
 * This would typically be called from a server-side function
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        userId,
        title,
        body,
        data,
      },
    })

    if (error) {
      console.error('Failed to send push notification:', error)
      return false
    }

    console.log('Push notification sent successfully:', data)
    return true
  } catch (error) {
    console.error('Error sending push notification:', error)
    return false
  }
}

/**
 * Handle notification received while app is in foreground
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback)
}

/**
 * Handle notification response (when user taps notification)
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback)
}

/**
 * Clear all delivered notifications
 */
export async function clearAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync()
    console.log('All notifications cleared')
  } catch (error) {
    console.error('Failed to clear notifications:', error)
  }
}

/**
 * Get notification settings for the app
 */
export async function getNotificationSettings(): Promise<Notifications.NotificationPermissionsStatus | null> {
  try {
    const settings = await Notifications.getPermissionsAsync()
    return settings
  } catch (error) {
    console.error('Failed to get notification settings:', error)
    return null
  }
}
