import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Platform, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORS, SHADOWS } from '../../components/progress/styles/sharedStyles'

export default function TabLayout() {
  // Get safe area insets to handle the home indicator on newer iPhones
  const insets = useSafeAreaInsets()
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.lightBlue,
        tabBarInactiveTintColor: COLORS.softWhite,
        tabBarStyle: {
          backgroundColor: COLORS.secondary,
          borderTopWidth: 0,
          paddingTop: 8,
          // Add padding for the home indicator on iOS
          paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 8) : 8,
          height: Platform.OS === 'ios' ? 60 + Math.max(insets.bottom, 8) : 60,
          ...SHADOWS.medium,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        headerStyle: {
          backgroundColor: COLORS.softWhite,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
          ...SHADOWS.small,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: COLORS.darkBlue,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Workouts',
          headerTitle: 'Workout Library',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          headerTitle: 'My Progress',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
