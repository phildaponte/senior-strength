import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import * as Haptics from 'expo-haptics'
import { Audio } from 'expo-av'

type Exercise = {
  name: string
  type: 'time' | 'reps'
  duration?: number // in seconds
  sets?: number
  reps?: number
  description?: string
}

type Workout = {
  id: string
  title: string
  type: 'sitting' | 'standing'
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  exercises: Exercise[]
}

export default function WorkoutFlowScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (id) {
      fetchWorkout()
    }
  }, [id])

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Exercise completed
            handleExerciseComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, timeRemaining])

  const fetchWorkout = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        Alert.alert('Error', 'Failed to load workout')
        router.back()
      } else {
        setWorkout(data)
        // Initialize first exercise if it's time-based
        if (data.exercises[0]?.type === 'time') {
          setTimeRemaining(data.exercises[0].duration || 30)
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred')
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const startWorkout = () => {
    setWorkoutStartTime(new Date())
    if (workout?.exercises[0]?.type === 'time') {
      setIsActive(true)
    }
  }

  const handleExerciseComplete = async () => {
    // Provide haptic feedback and sound
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    
    const currentExercise = workout?.exercises[currentExerciseIndex]
    
    if (currentExercise?.type === 'reps' && currentSet < (currentExercise.sets || 1)) {
      // Move to next set
      setCurrentSet(prev => prev + 1)
      setIsActive(false)
    } else {
      // Move to next exercise
      if (currentExerciseIndex < (workout?.exercises.length || 0) - 1) {
        setCurrentExerciseIndex(prev => prev + 1)
        setCurrentSet(1)
        setIsActive(false)
        
        // Set up next exercise
        const nextExercise = workout?.exercises[currentExerciseIndex + 1]
        if (nextExercise?.type === 'time') {
          setTimeRemaining(nextExercise.duration || 30)
        }
      } else {
        // Workout completed
        handleWorkoutComplete()
      }
    }
  }

  const handleWorkoutComplete = () => {
    setIsActive(false)
    // Navigate to journal entry screen
    const workoutDuration = workoutStartTime 
      ? Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 1000)
      : workout?.duration ? workout.duration * 60 : 0
    
    router.push({
      pathname: '/workout/complete',
      params: { 
        workoutId: id as string,
        duration: workoutDuration.toString()
      }
    })
  }

  const startExercise = () => {
    const currentExercise = workout?.exercises[currentExerciseIndex]
    if (currentExercise?.type === 'time') {
      setIsActive(true)
    }
  }

  const pauseExercise = () => {
    setIsActive(false)
  }

  const skipExercise = () => {
    handleExerciseComplete()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    )
  }

  if (!workout) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Workout not found</Text>
      </View>
    )
  }

  const currentExercise = workout.exercises[currentExerciseIndex]
  const progress = ((currentExerciseIndex + 1) / workout.exercises.length) * 100

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.workoutTitle}>{workout.title}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
        </Text>
      </View>

      {/* Current Exercise */}
      <View style={styles.exerciseContainer}>
        <Text style={styles.exerciseName}>{currentExercise.name}</Text>
        
        {currentExercise.description && (
          <Text style={styles.exerciseDescription}>{currentExercise.description}</Text>
        )}

        {currentExercise.type === 'time' ? (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <View style={styles.timerButtons}>
              {!workoutStartTime ? (
                <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
                  <Text style={styles.buttonText}>Start Workout</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity 
                    style={[styles.actionButton, isActive ? styles.pauseButton : styles.playButton]} 
                    onPress={isActive ? pauseExercise : startExercise}
                  >
                    <Text style={styles.buttonText}>{isActive ? 'Pause' : 'Start'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.skipButton} onPress={skipExercise}>
                    <Text style={styles.buttonText}>Skip</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.repsContainer}>
            <Text style={styles.repsText}>
              {currentExercise.reps} reps × {currentExercise.sets} sets
            </Text>
            <Text style={styles.currentSetText}>Set {currentSet} of {currentExercise.sets}</Text>
            
            <View style={styles.repsButtons}>
              {!workoutStartTime ? (
                <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
                  <Text style={styles.buttonText}>Start Workout</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={styles.completeButton} onPress={handleExerciseComplete}>
                    <Text style={styles.buttonText}>Complete Set</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.skipButton} onPress={skipExercise}>
                    <Text style={styles.buttonText}>Skip Exercise</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Exercise List Preview */}
      <View style={styles.exerciseListContainer}>
        <Text style={styles.exerciseListTitle}>Upcoming Exercises</Text>
        {workout.exercises.slice(currentExerciseIndex + 1).map((exercise, index) => (
          <View key={index} style={styles.exerciseListItem}>
            <Text style={styles.exerciseListName}>{exercise.name}</Text>
            <Text style={styles.exerciseListDetails}>
              {exercise.type === 'time' 
                ? `${exercise.duration}s` 
                : `${exercise.reps} reps × ${exercise.sets} sets`
              }
            </Text>
          </View>
        ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  progressContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  exerciseContainer: {
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
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 20,
  },
  timerButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  repsContainer: {
    alignItems: 'center',
  },
  repsText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  currentSetText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
  },
  repsButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  startButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  actionButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  playButton: {
    backgroundColor: '#28a745',
  },
  pauseButton: {
    backgroundColor: '#ffc107',
  },
  completeButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  skipButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseListContainer: {
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
  exerciseListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  exerciseListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  exerciseListName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  exerciseListDetails: {
    fontSize: 14,
    color: '#6c757d',
  },
  loadingText: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 100,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 100,
  },
})
