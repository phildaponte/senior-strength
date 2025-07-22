import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import { supabase } from '../../../lib/supabase'
import { 
  calculateLevelInfo, 
  calculateTimeBasedStats, 
  calculateTotalStats, 
  getMotivationalMessage 
} from '../utils/progressCalculations'
import { generateAchievements } from '../utils/achievementHelpers'
import { checkEarnedBadges, AVAILABLE_BADGES } from '../../BadgeSystem'
import { ProgressStats, LevelInfo, Achievement, Badge } from '../types'

/**
 * Custom hook for managing progress statistics and related data
 * Handles fetching workout data, calculating stats, and managing loading states
 */
export const useProgressStats = () => {
  // Core statistics state
  const [stats, setStats] = useState<ProgressStats>({
    totalWorkouts: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    thisWeekWorkouts: 0,
    thisMonthWorkouts: 0,
    thisYearWorkouts: 0,
  })

  // Related data state
  const [badges, setBadges] = useState<Badge[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [motivationalMessage, setMotivationalMessage] = useState('')
  const [levelInfo, setLevelInfo] = useState<LevelInfo>({ level: 1, xp: 0, nextLevelXp: 100 })
  
  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetches and calculates all progress statistics
   * This includes workout data, streaks, badges, achievements, and level info
   */
  const fetchProgressStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get user streak data from users table
      const { data: userData } = await supabase
        .from('users')
        .select('current_streak, longest_streak')
        .eq('id', user.id)
        .single()

      // Get all workout logs for comprehensive calculations
      const { data: workoutLogs } = await supabase
        .from('workout_logs')
        .select('duration_seconds, date')
        .eq('user_id', user.id)

      if (workoutLogs) {
        // Calculate core statistics using utility functions
        const { totalWorkouts, totalMinutes } = calculateTotalStats(workoutLogs)
        const { thisWeekWorkouts, thisMonthWorkouts, thisYearWorkouts } = calculateTimeBasedStats(workoutLogs)

        // Get positive mood entries for badge calculations
        const { data: positiveMoodLogs } = await supabase
          .from('workout_logs')
          .select('id')
          .eq('user_id', user.id)
          .eq('sentiment_tag', 'positive')

        const positiveMoodCount = positiveMoodLogs?.length || 0

        // Build comprehensive stats object
        const newStats: ProgressStats = {
          totalWorkouts,
          totalMinutes,
          currentStreak: userData?.current_streak || 0,
          longestStreak: userData?.longest_streak || 0,
          thisWeekWorkouts,
          thisMonthWorkouts,
          thisYearWorkouts,
        }

        // Calculate level and XP progression
        const levelData = calculateLevelInfo(totalWorkouts, totalMinutes)
        setLevelInfo(levelData)

        // Generate dynamic achievements based on current progress
        const achievementData = generateAchievements(newStats, totalMinutes)
        setAchievements(achievementData)

        // Set contextual motivational message
        setMotivationalMessage(getMotivationalMessage(newStats))

        // Calculate earned badges with comprehensive criteria
        const earnedBadgeIds = checkEarnedBadges({
          ...newStats,
          positiveMoodCount,
          weeklyConsistencyWeeks: Math.floor(totalWorkouts / 4), // Simplified weekly consistency calculation
        })

        // Create badge objects with earned status and dates
        const badgeObjects: Badge[] = AVAILABLE_BADGES.map(badge => ({
          ...badge,
          earned: earnedBadgeIds.includes(badge.id),
          earnedDate: earnedBadgeIds.includes(badge.id) ? new Date().toISOString() : undefined,
        }))

        // Update all state with calculated data
        setStats(newStats)
        setBadges(badgeObjects)

        return { workoutLogs, stats: newStats } // Return data for other hooks to use
      }
    } catch (error) {
      const errorMessage = 'Failed to load progress data'
      setError(errorMessage)
      Alert.alert('Error', errorMessage)
      console.error('Fetch progress error:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Refreshes all progress data
   * Useful for manual refresh or after completing workouts
   */
  const refreshStats = () => {
    fetchProgressStats()
  }

  // Initial data fetch on mount
  useEffect(() => {
    fetchProgressStats()
  }, [])

  return {
    // Data
    stats,
    badges,
    achievements,
    motivationalMessage,
    levelInfo,
    
    // State
    loading,
    error,
    
    // Actions
    fetchProgressStats,
    refreshStats,
  }
}
