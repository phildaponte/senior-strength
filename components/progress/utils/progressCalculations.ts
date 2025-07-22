import { ProgressStats } from '../types'

/**
 * Calculate level and XP based on total workouts and minutes
 * XP Formula: (totalWorkouts * 10) + (totalMinutes / 5)
 * Level Formula: (XP / 100) + 1
 */
export const calculateLevelInfo = (totalWorkouts: number, totalMinutes: number) => {
  const xp = totalWorkouts * 10 + Math.floor(totalMinutes / 5)
  const level = Math.floor(xp / 100) + 1
  const currentLevelXp = xp % 100
  const nextLevelXp = 100
  
  return { 
    level, 
    xp: currentLevelXp, 
    nextLevelXp 
  }
}

/**
 * Calculate workout statistics for different time periods
 */
export const calculateTimeBasedStats = (workoutLogs: any[]) => {
  const now = new Date()
  
  // Calculate this week's workouts (last 7 days)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const thisWeekWorkouts = workoutLogs.filter(
    log => new Date(log.date) >= oneWeekAgo
  ).length

  // Calculate this month's workouts (last 30 days)
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  const thisMonthWorkouts = workoutLogs.filter(
    log => new Date(log.date) >= oneMonthAgo
  ).length

  // Calculate this year's workouts (last 365 days)
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  const thisYearWorkouts = workoutLogs.filter(
    log => new Date(log.date) >= oneYearAgo
  ).length

  return {
    thisWeekWorkouts,
    thisMonthWorkouts,
    thisYearWorkouts
  }
}

/**
 * Calculate total workout statistics
 */
export const calculateTotalStats = (workoutLogs: any[]) => {
  const totalWorkouts = workoutLogs.length
  const totalMinutes = Math.round(
    workoutLogs.reduce((sum, log) => sum + log.duration_seconds, 0) / 60
  )
  
  return { totalWorkouts, totalMinutes }
}

/**
 * Generate motivational messages based on progress level
 */
export const getMotivationalMessage = (stats: ProgressStats): string => {
  const messages = {
    beginner: [
      "Every journey begins with a single step! 🌟",
      "You're building healthy habits one day at a time! 💪",
      "Great job starting your fitness journey! 🎯",
    ],
    intermediate: [
      "You're making excellent progress! Keep it up! 🚀",
      "Your consistency is paying off! 📈",
      "You're becoming stronger every day! 💪",
    ],
    advanced: [
      "You're a fitness champion! Incredible dedication! 🏆",
      "Your commitment is truly inspiring! ⭐",
      "You've mastered the art of consistency! 🔥",
    ],
  }

  let category: keyof typeof messages = 'beginner'
  if (stats.totalWorkouts >= 50) category = 'advanced'
  else if (stats.totalWorkouts >= 15) category = 'intermediate'

  const categoryMessages = messages[category]
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)]
}
