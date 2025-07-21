import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { sendTestWeeklyReport, getUserWeeklyStats } from '../../lib/reports'
import { getNotificationSettings, scheduleLocalNotification } from '../../lib/notifications'

type UserProfile = {
  full_name: string | null
  email: string
  dob: string | null
  trusted_contact_email: string | null
  is_subscribed: boolean
  created_at: string
}

export default function ProfileTab() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('full_name, email, dob, trusted_contact_email, is_subscribed, created_at')
        .eq('id', user.id)
        .single()

      if (error) {
        Alert.alert('Error', 'Failed to load profile')
        console.error('Fetch profile error:', error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred')
      console.error('Fetch profile error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut()
            router.replace('/auth/login')
          },
        },
      ]
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const handleTestWeeklyReport = async () => {
    try {
      Alert.alert(
        'Sending Test Report',
        'This will send a test weekly report to your trusted contact email. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send',
            onPress: async () => {
              const result = await sendTestWeeklyReport()
              Alert.alert(
                result.success ? 'Success' : 'Error',
                result.message
              )
            }
          }
        ]
      )
    } catch (error) {
      Alert.alert('Error', 'Failed to send test report')
    }
  }

  const handleTestNotification = async () => {
    try {
      await scheduleLocalNotification(
        'Test Notification 🔔',
        'This is a test push notification from Senior Strength!',
        3
      )
      Alert.alert(
        'Test Scheduled',
        'A test notification will appear in 3 seconds'
      )
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule test notification')
    }
  }

  const handleViewWeeklyStats = async () => {
    try {
      const stats = await getUserWeeklyStats()
      if (stats) {
        Alert.alert(
          'Weekly Stats',
          `Workouts: ${stats.totalWorkouts}\n` +
          `Minutes: ${stats.totalMinutes}\n` +
          `Active Days: ${stats.activeDays}\n` +
          `Current Streak: ${stats.currentStreak}\n\n` +
          `Mood Summary:\n` +
          `Positive: ${stats.sentimentSummary.positive}\n` +
          `Neutral: ${stats.sentimentSummary.neutral}\n` +
          `Negative: ${stats.sentimentSummary.negative}`
        )
      } else {
        Alert.alert('No Data', 'No weekly stats available')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load weekly stats')
    }
  }

  const handleNotificationSettings = async () => {
    try {
      const settings = await getNotificationSettings()
      if (settings) {
        Alert.alert(
          'Notification Settings',
          `Status: ${settings.status}\n` +
          `Can Ask Again: ${settings.canAskAgain}\n` +
          `Granted: ${settings.granted}\n\n` +
          'To change notification settings, go to your device Settings > Senior Strength > Notifications'
        )
      } else {
        Alert.alert('Error', 'Failed to get notification settings')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check notification settings')
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    )
  }

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {profile.full_name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.nameText}>{profile.full_name || 'User'}</Text>
        <Text style={styles.emailText}>{profile.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>
              {profile.dob ? formatDate(profile.dob) : 'Not set'}
            </Text>
          </View>
          
          {profile.dob && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{calculateAge(profile.dob)} years</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trusted Contact</Text>
            <Text style={styles.infoValue}>
              {profile.trusted_contact_email || 'Not set'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              {formatDate(profile.created_at)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={[
              styles.statusBadge, 
              profile.is_subscribed ? styles.statusActive : styles.statusInactive
            ]}>
              <Text style={[
                styles.statusText,
                profile.is_subscribed ? styles.statusTextActive : styles.statusTextInactive
              ]}>
                {profile.is_subscribed ? 'Active' : 'Free Trial'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reports & Notifications</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleTestWeeklyReport}
        >
          <Text style={styles.actionButtonText}>Send Test Weekly Report</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleTestNotification}
        >
          <Text style={styles.actionButtonText}>Test Push Notification</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleViewWeeklyStats}
        >
          <Text style={styles.actionButtonText}>View Weekly Stats</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleNotificationSettings}
        >
          <Text style={styles.actionButtonText}>Notification Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Help & Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.signOutButton]} onPress={handleSignOut}>
          <Text style={[styles.actionButtonText, styles.signOutButtonText]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusInactive: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#166534',
  },
  statusTextInactive: {
    color: '#92400e',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutButtonText: {
    color: '#dc2626',
  },
})
