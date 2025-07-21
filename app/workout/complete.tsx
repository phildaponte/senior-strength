import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { analyzeSentiment, getSentimentDescription } from '../../lib/sentiment'
import { checkEarnedBadges } from '../../components/BadgeSystem'
import * as Haptics from 'expo-haptics'

// Mood scale options
const MOOD_OPTIONS = [
  { emoji: '😫', label: 'Exhausted', value: 1 },
  { emoji: '😕', label: 'Tired', value: 2 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '😊', label: 'Good', value: 4 },
  { emoji: '🤩', label: 'Amazing', value: 5 },
]

export default function WorkoutCompleteScreen() {
  const { workoutId, duration } = useLocalSearchParams()
  const router = useRouter()
  const [journalText, setJournalText] = useState('')
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [workout, setWorkout] = useState<any>(null)

  useEffect(() => {
    fetchWorkout()
    // Celebrate completion with haptics
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }, [])

  const fetchWorkout = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('title, type, duration')
        .eq('id', workoutId)
        .single()

      if (error) {
        console.error('Error fetching workout:', error)
      } else {
        setWorkout(data)
      }
    } catch (error) {
      console.error('Error fetching workout:', error)
    }
  }



  const saveWorkoutLog = async () => {
    if (!selectedMood) {
      Alert.alert('Missing Information', 'Please select how you feel after the workout.')
      return
    }

    setLoading(true)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        Alert.alert('Error', 'Please log in to save your workout.')
        return
      }

      // Analyze sentiment of journal text
      const sentimentTag = journalText ? await analyzeSentiment(journalText) : 'neutral'

      // Save workout log
      const { error: logError } = await supabase
        .from('workout_logs')
        .insert({
          user_id: user.id,
          workout_id: workoutId,
          date: new Date().toISOString().split('T')[0], // Current date
          duration_seconds: parseInt(duration as string) || 0,
          journal_text: journalText || null,
          sentiment_tag: sentimentTag,
        })

      if (logError) {
        Alert.alert('Error', 'Failed to save workout log.')
        console.error('Error saving workout log:', logError)
        return
      }

      // Update user streak (simplified logic - in real app you'd have more complex streak calculation)
      await updateUserStreak(user.id)

      // Check for new badges
      await checkAndAwardBadges(user.id)

      Alert.alert(
        'Workout Saved! 🎉',
        'Great job completing your workout! Your progress has been recorded.',
        [
          {
            text: 'Continue',
            onPress: () => router.push('/(tabs)/')
          }
        ]
      )

    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.')
      console.error('Error saving workout:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserStreak = async (userId: string) => {
    try {
      // Get user's current streak data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('current_streak, longest_streak')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('Error fetching user data:', userError)
        return
      }

      // Check if user worked out yesterday
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const { data: yesterdayLog } = await supabase
        .from('workout_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('date', yesterdayStr)
        .limit(1)

      let newStreak = 1
      if (yesterdayLog && yesterdayLog.length > 0) {
        // Continue streak
        newStreak = (userData.current_streak || 0) + 1
      }

      const newLongestStreak = Math.max(newStreak, userData.longest_streak || 0)

      // Update user streak
      await supabase
        .from('users')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
        })
        .eq('id', userId)

    } catch (error) {
      console.error('Error updating streak:', error)
    }
  }

  const checkAndAwardBadges = async (userId: string) => {
    try {
      // Get current user stats for badge calculation
      const { data: userData } = await supabase
        .from('users')
        .select('current_streak, longest_streak')
        .eq('id', userId)
        .single()

      const { data: workoutLogs } = await supabase
        .from('workout_logs')
        .select('duration_seconds, sentiment_tag')
        .eq('user_id', userId)

      if (workoutLogs && userData) {
        const totalWorkouts = workoutLogs.length
        const totalMinutes = Math.round(
          workoutLogs.reduce((sum, log) => sum + log.duration_seconds, 0) / 60
        )
        const positiveMoodCount = workoutLogs.filter(log => log.sentiment_tag === 'positive').length

        // Check which badges should be earned
        const earnedBadgeIds = checkEarnedBadges({
          totalWorkouts,
          totalMinutes,
          currentStreak: userData.current_streak || 0,
          longestStreak: userData.longest_streak || 0,
          positiveMoodCount,
          weeklyConsistencyWeeks: Math.floor(totalWorkouts / 4),
        })

        // Update user's badges in database (simplified - in real app you'd store badge earn dates)
        await supabase
          .from('users')
          .update({ badges: earnedBadgeIds })
          .eq('id', userId)
      }
    } catch (error) {
      console.error('Error checking badges:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins}m ${secs}s`
    }
    return `${secs}s`
  }

  return (
    <ScrollView style={styles.container}>
      {/* Celebration Header */}
      <View style={styles.celebrationContainer}>
        <Text style={styles.celebrationEmoji}>🎉</Text>
        <Text style={styles.celebrationTitle}>Workout Complete!</Text>
        <Text style={styles.celebrationSubtitle}>
          You finished {workout?.title || 'your workout'}
        </Text>
        
        {/* Workout Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(parseInt(duration as string) || 0)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workout?.type || 'Unknown'}</Text>
            <Text style={styles.statLabel}>Type</Text>
          </View>
        </View>
      </View>

      {/* Mood Selection */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>How do you feel?</Text>
        <View style={styles.moodContainer}>
          {MOOD_OPTIONS.map((mood) => (
            <TouchableOpacity
              key={mood.value}
              style={[
                styles.moodOption,
                selectedMood === mood.value && styles.moodOptionSelected
              ]}
              onPress={() => setSelectedMood(mood.value)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[
                styles.moodLabel,
                selectedMood === mood.value && styles.moodLabelSelected
              ]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Journal Entry */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>How did it go? (Optional)</Text>
        <Text style={styles.sectionSubtitle}>
          Share your thoughts about today's workout
        </Text>
        <TextInput
          style={styles.journalInput}
          multiline
          numberOfLines={4}
          placeholder="I felt great during the stretches... The standing exercises were challenging but I pushed through..."
          placeholderTextColor="#adb5bd"
          value={journalText}
          onChangeText={setJournalText}
          textAlignVertical="top"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={saveWorkoutLog}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Workout'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.push('/(tabs)/')}
        >
          <Text style={styles.skipButtonText}>Skip Journal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  celebrationContainer: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 80,
    backgroundColor: '#fff',
  },
  celebrationEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    textTransform: 'capitalize',
  },
  sectionContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  moodOption: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    minWidth: (width - 80) / 5 - 5,
    marginBottom: 10,
  },
  moodOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#007bff',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: '#007bff',
    fontWeight: '600',
  },
  journalInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    minHeight: 120,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6c757d',
    fontSize: 16,
  },
})
