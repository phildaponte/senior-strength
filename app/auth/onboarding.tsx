import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'

export default function Onboarding() {
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [trustedContactEmail, setTrustedContactEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name')
      return false
    }

    if (!dob.trim()) {
      Alert.alert('Error', 'Please enter your date of birth')
      return false
    }

    // Basic date validation (YYYY-MM-DD format)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dob)) {
      Alert.alert('Error', 'Please enter date in YYYY-MM-DD format (e.g., 1950-01-15)')
      return false
    }

    const birthDate = new Date(dob)
    const today = new Date()
    if (birthDate >= today) {
      Alert.alert('Error', 'Please enter a valid birth date')
      return false
    }

    if (!trustedContactEmail.trim()) {
      Alert.alert('Error', 'Please enter a trusted contact email')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trustedContactEmail)) {
      Alert.alert('Error', 'Please enter a valid email address for your trusted contact')
      return false
    }

    return true
  }

  const handleComplete = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        Alert.alert('Error', 'No user found. Please log in again.')
        router.replace('/auth/login')
        return
      }

      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName.trim(),
          dob: dob,
          trusted_contact_email: trustedContactEmail.trim().toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        Alert.alert('Error', 'Failed to save profile information')
        console.error('Profile update error:', error)
      } else {
        // Profile completed successfully, navigate to main app
        router.replace('/(tabs)')
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred')
      console.error('Onboarding error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Help us personalize your Senior Strength experience
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                value={dob}
                onChangeText={setDob}
                placeholder="YYYY-MM-DD (e.g., 1950-01-15)"
                keyboardType="numeric"
              />
              <Text style={styles.helpText}>
                This helps us customize workouts for your age group
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Trusted Contact Email</Text>
              <TextInput
                style={styles.input}
                value={trustedContactEmail}
                onChangeText={setTrustedContactEmail}
                placeholder="family.member@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.helpText}>
                We'll send weekly progress reports to this person
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleComplete}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Saving...' : 'Complete Setup'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60, // Account for status bar
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#6b7280',
    textDecorationLine: 'underline',
  },
})
