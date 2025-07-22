import { ProgressStats, Achievement } from '../types'

/**
 * Generate achievement data based on current progress statistics
 * Each achievement has progress tracking and unlock status
 */
export const generateAchievements = (stats: ProgressStats, totalMinutes: number): Achievement[] => {
  return [
    {
      id: 'first_workout',
      title: 'First Steps',
      description: 'Complete your first workout',
      icon: '🎯',
      progress: Math.min(stats.totalWorkouts, 1),
      target: 1,
      unlocked: stats.totalWorkouts >= 1,
    },
    {
      id: 'week_warrior',
      title: 'Week Warrior',
      description: 'Complete 7 workouts',
      icon: '💪',
      progress: Math.min(stats.totalWorkouts, 7),
      target: 7,
      unlocked: stats.totalWorkouts >= 7,
    },
    {
      id: 'consistency_king',
      title: 'Consistency Champion',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      progress: Math.min(stats.currentStreak, 7),
      target: 7,
      unlocked: stats.currentStreak >= 7,
    },
    {
      id: 'time_master',
      title: 'Time Master',
      description: 'Exercise for 300 minutes total',
      icon: '⏰',
      progress: Math.min(totalMinutes, 300),
      target: 300,
      unlocked: totalMinutes >= 300,
    },
    {
      id: 'monthly_hero',
      title: 'Monthly Hero',
      description: 'Complete 20 workouts in a month',
      icon: '🏆',
      progress: Math.min(stats.thisMonthWorkouts, 20),
      target: 20,
      unlocked: stats.thisMonthWorkouts >= 20,
    },
    {
      id: 'streak_master',
      title: 'Streak Master',
      description: 'Maintain a 30-day streak',
      icon: '⚡',
      progress: Math.min(stats.currentStreak, 30),
      target: 30,
      unlocked: stats.currentStreak >= 30,
    },
    {
      id: 'century_club',
      title: 'Century Club',
      description: 'Complete 100 workouts',
      icon: '🌟',
      progress: Math.min(stats.totalWorkouts, 100),
      target: 100,
      unlocked: stats.totalWorkouts >= 100,
    },
    {
      id: 'endurance_expert',
      title: 'Endurance Expert',
      description: 'Exercise for 1000 minutes total',
      icon: '🏃‍♂️',
      progress: Math.min(totalMinutes, 1000),
      target: 1000,
      unlocked: totalMinutes >= 1000,
    },
  ]
}

/**
 * Calculate achievement completion percentage
 */
export const getAchievementProgress = (achievement: Achievement): number => {
  return Math.round((achievement.progress / achievement.target) * 100)
}

/**
 * Get achievements sorted by completion status (unlocked first, then by progress)
 */
export const getSortedAchievements = (achievements: Achievement[]): Achievement[] => {
  return [...achievements].sort((a, b) => {
    // Unlocked achievements first
    if (a.unlocked && !b.unlocked) return -1
    if (!a.unlocked && b.unlocked) return 1
    
    // Then sort by progress percentage
    const aProgress = getAchievementProgress(a)
    const bProgress = getAchievementProgress(b)
    return bProgress - aProgress
  })
}

/**
 * Get the next achievement to unlock (closest to completion)
 */
export const getNextAchievement = (achievements: Achievement[]): Achievement | null => {
  const locked = achievements.filter(a => !a.unlocked)
  if (locked.length === 0) return null
  
  return locked.reduce((closest, current) => {
    const closestProgress = getAchievementProgress(closest)
    const currentProgress = getAchievementProgress(current)
    return currentProgress > closestProgress ? current : closest
  })
}
