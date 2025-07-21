import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'

type Workout = {
  id: string
  title: string
  type: 'sitting' | 'standing'
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  exercises: any[]
}

export default function WorkoutsTab() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'sitting' | 'standing'>('all')

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const fetchWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        Alert.alert('Error', 'Failed to load workouts')
        console.error('Fetch workouts error:', error)
      } else {
        setWorkouts(data || [])
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred')
      console.error('Fetch workouts error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredWorkouts = workouts.filter(workout => 
    filter === 'all' || workout.type === filter
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10b981'
      case 'medium': return '#f59e0b'
      case 'hard': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const handleStartWorkout = (workoutId: string) => {
    router.push(`/workout/${workoutId}`)
  }

  const renderWorkout = ({ item }: { item: Workout }) => (
    <TouchableOpacity style={styles.workoutCard}>
      <View style={styles.workoutHeader}>
        <Text style={styles.workoutTitle}>{item.title}</Text>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
          <Text style={styles.difficultyText}>{item.difficulty.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.workoutDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={styles.detailValue}>{item.type}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailValue}>{item.duration} min</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Exercises:</Text>
          <Text style={styles.detailValue}>{item.exercises?.length || 0}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => handleStartWorkout(item.id)}
      >
        <Text style={styles.startButtonText}>Start Workout</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading workouts...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'sitting' && styles.filterButtonActive]}
          onPress={() => setFilter('sitting')}
        >
          <Text style={[styles.filterText, filter === 'sitting' && styles.filterTextActive]}>
            Sitting
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'standing' && styles.filterButtonActive]}
          onPress={() => setFilter('standing')}
        >
          <Text style={[styles.filterText, filter === 'standing' && styles.filterTextActive]}>
            Standing
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredWorkouts}
        renderItem={renderWorkout}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  startButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})
