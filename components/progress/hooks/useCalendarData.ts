import { useState, useEffect } from 'react'
import { 
  generateCalendarData, 
  navigateMonth as navigateMonthHelper,
  formatMonthYear,
  getDayHeaders 
} from '../utils/calendarHelpers'
import { WorkoutDay } from '../types'

/**
 * Custom hook for managing calendar data and navigation
 * Handles calendar generation, month navigation, and workout day processing
 */
export const useCalendarData = () => {
  // Calendar state
  const [calendarDays, setCalendarDays] = useState<WorkoutDay[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([])
  
  // Loading state
  const [loading, setLoading] = useState(false)

  /**
   * Updates the calendar data based on workout logs and current date
   * This is called whenever workout data or the current month changes
   */
  const updateCalendarData = (logs: any[]) => {
    setLoading(true)
    try {
      // Generate calendar grid for the current month with workout data
      const calendarData = generateCalendarData(logs, currentDate)
      setCalendarDays(calendarData)
      setWorkoutLogs(logs)
    } catch (error) {
      console.error('Failed to update calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Navigates to the previous or next month
   * Updates the current date and regenerates calendar data
   */
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = navigateMonthHelper(currentDate, direction)
    setCurrentDate(newDate)
  }

  /**
   * Navigates directly to a specific month and year
   */
  const navigateToDate = (date: Date) => {
    setCurrentDate(date)
  }

  /**
   * Gets the formatted month and year string for display
   */
  const getFormattedMonthYear = (): string => {
    return formatMonthYear(currentDate)
  }

  /**
   * Gets the day headers for the calendar (Sun, Mon, Tue, etc.)
   */
  const getDayHeadersArray = (): string[] => {
    return getDayHeaders()
  }

  /**
   * Gets workout statistics for the current month
   */
  const getCurrentMonthStats = () => {
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    // Filter workout days for the current month
    const currentMonthDays = calendarDays.filter(day => {
      if (!day.date) return false
      const dayDate = new Date(day.date)
      return dayDate.getMonth() === currentMonth && dayDate.getFullYear() === currentYear
    })

    // Calculate statistics
    const workoutDays = currentMonthDays.filter(day => day.hasWorkout)
    const totalWorkouts = workoutDays.length
    const totalMinutes = workoutDays.reduce((sum, day) => sum + (day.totalMinutes || 0), 0)
    const averageMinutes = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0

    return {
      totalWorkouts,
      totalMinutes,
      averageMinutes,
      workoutDays: workoutDays.length,
      totalDaysInMonth: currentMonthDays.filter(day => day.date).length,
      workoutPercentage: currentMonthDays.filter(day => day.date).length > 0 
        ? Math.round((workoutDays.length / currentMonthDays.filter(day => day.date).length) * 100)
        : 0
    }
  }

  /**
   * Gets workout data for a specific date
   */
  const getWorkoutForDate = (date: string): WorkoutDay | null => {
    return calendarDays.find(day => day.date === date) || null
  }

  /**
   * Checks if a specific date has a workout
   */
  const hasWorkoutOnDate = (date: string): boolean => {
    const workoutDay = getWorkoutForDate(date)
    return workoutDay?.hasWorkout || false
  }

  /**
   * Gets the current streak of workout days ending on today or the most recent workout
   */
  const getCurrentStreak = (): number => {
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]
    
    let streak = 0
    let checkDate = new Date(today)
    
    // Count backwards from today to find consecutive workout days
    while (checkDate >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)) {
      const dateString = checkDate.toISOString().split('T')[0]
      const hasWorkout = hasWorkoutOnDate(dateString)
      
      if (hasWorkout) {
        streak++
      } else if (streak > 0) {
        // If we've started counting and hit a non-workout day, break
        break
      }
      
      // Move to previous day
      checkDate.setDate(checkDate.getDate() - 1)
    }
    
    return streak
  }

  /**
   * Gets upcoming workout opportunities (days without workouts in current month)
   */
  const getUpcomingOpportunities = (): WorkoutDay[] => {
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]
    
    return calendarDays.filter(day => {
      if (!day.date) return false
      return day.date >= todayString && !day.hasWorkout
    }).slice(0, 7) // Next 7 opportunities
  }

  // Regenerate calendar data when current date changes
  useEffect(() => {
    if (workoutLogs.length > 0) {
      updateCalendarData(workoutLogs)
    }
  }, [currentDate])

  return {
    // Data
    calendarDays,
    currentDate,
    
    // State
    loading,
    
    // Navigation
    navigateMonth,
    navigateToDate,
    
    // Formatting
    getFormattedMonthYear,
    getDayHeadersArray,
    
    // Data management
    updateCalendarData,
    
    // Analytics
    getCurrentMonthStats,
    getWorkoutForDate,
    hasWorkoutOnDate,
    getCurrentStreak,
    getUpcomingOpportunities,
    
    // Computed properties
    monthYear: getFormattedMonthYear(),
    dayHeaders: getDayHeadersArray(),
    monthStats: getCurrentMonthStats(),
  }
}
