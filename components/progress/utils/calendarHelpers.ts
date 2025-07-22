import { WorkoutDay } from '../types'

/**
 * Generate calendar data for a specific month showing workout activity
 * Creates a 42-day grid (6 weeks) with proper day alignment
 */
export const generateCalendarData = (workoutLogs: any[], targetDate: Date): WorkoutDay[] => {
  const days: WorkoutDay[] = []
  const today = new Date()
  const year = targetDate.getFullYear()
  const month = targetDate.getMonth()
  
  // Get first day of the month and how many days in the month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() // 0 = Sunday
  
  // Add empty days for the start of the calendar (previous month)
  const prevMonth = new Date(year, month - 1, 0)
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonth.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayWorkouts = workoutLogs.filter(log => log.date.startsWith(dateStr))
    
    days.push({
      date: dateStr,
      hasWorkout: dayWorkouts.length > 0,
      workoutCount: dayWorkouts.length,
      dayOfWeek: date.getDay(),
      isToday: dateStr === today.toISOString().split('T')[0],
      isCurrentMonth: false,
    })
  }
  
  // Add days for the current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0]
    const dayWorkouts = workoutLogs.filter(log => log.date.startsWith(dateStr))
    
    days.push({
      date: dateStr,
      hasWorkout: dayWorkouts.length > 0,
      workoutCount: dayWorkouts.length,
      dayOfWeek: date.getDay(),
      isToday: dateStr === today.toISOString().split('T')[0],
      isCurrentMonth: true,
    })
  }
  
  // Add days for the next month to fill the calendar grid (42 days total = 6 weeks)
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    const dateStr = date.toISOString().split('T')[0]
    const dayWorkouts = workoutLogs.filter(log => log.date.startsWith(dateStr))
    
    days.push({
      date: dateStr,
      hasWorkout: dayWorkouts.length > 0,
      workoutCount: dayWorkouts.length,
      dayOfWeek: date.getDay(),
      isToday: dateStr === today.toISOString().split('T')[0],
      isCurrentMonth: false,
    })
  }
  
  return days
}

/**
 * Navigate to the previous or next month
 */
export const navigateMonth = (currentDate: Date, direction: 'prev' | 'next'): Date => {
  const newDate = new Date(currentDate)
  if (direction === 'prev') {
    newDate.setMonth(newDate.getMonth() - 1)
  } else {
    newDate.setMonth(newDate.getMonth() + 1)
  }
  return newDate
}

/**
 * Format month and year for display
 */
export const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/**
 * Get day names for calendar header
 */
export const getDayHeaders = (): string[] => {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
}
