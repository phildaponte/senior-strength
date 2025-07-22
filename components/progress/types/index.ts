// Progress Statistics Types
export type ProgressStats = {
  totalWorkouts: number
  totalMinutes: number
  currentStreak: number
  longestStreak: number
  thisWeekWorkouts: number
  thisMonthWorkouts: number
  thisYearWorkouts: number
}

// Calendar Types
export type WorkoutDay = {
  date: string
  hasWorkout: boolean
  workoutCount: number
  dayOfWeek: number
  isToday: boolean
  isCurrentMonth: boolean
  totalMinutes?: number // Optional field for total workout minutes on this day
}

// Journal Types
export type JournalEntry = {
  id: string
  date: string
  journal_text: string
  sentiment_tag: string
  workout_title?: string
}

// Achievement Types
export type Achievement = {
  id: string
  title: string
  description: string
  icon: string
  progress: number
  target: number
  unlocked: boolean
}

// Level/XP Types
export type LevelInfo = {
  level: number
  xp: number
  nextLevelXp: number
}

// View Types
export type ProgressView = 'stats' | 'calendar' | 'journal' | 'achievements'

// Badge Types (from existing BadgeSystem)
export type Badge = {
  id: string
  name: string
  description: string
  emoji: string
  earned: boolean
  earnedDate?: string
}

// Component Props Types
export type StatCardProps = {
  title: string
  value: string | number
  subtitle?: string
}

export type ViewSelectorProps = {
  selectedView: ProgressView
  onViewChange: (view: ProgressView) => void
}

export type CalendarViewProps = {
  calendarDays: WorkoutDay[]
  currentDate: Date
  onNavigateMonth: (direction: 'prev' | 'next') => void
}

export type JournalViewProps = {
  journalEntries: JournalEntry[]
  onShowModal: () => void
}

export type AchievementsViewProps = {
  achievements: Achievement[]
}

export type StatsViewProps = {
  stats: ProgressStats
}
