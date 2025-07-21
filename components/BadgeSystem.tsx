import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'

export type Badge = {
  id: string
  name: string
  description: string
  emoji: string
  earned: boolean
  earnedDate?: string
}

type BadgeSystemProps = {
  badges: Badge[]
  title?: string
}

// Define available badges
export const AVAILABLE_BADGES: Omit<Badge, 'earned' | 'earnedDate'>[] = [
  {
    id: 'first_workout',
    name: 'First Steps',
    description: 'Complete your first workout',
    emoji: '🎯',
  },
  {
    id: 'streak_3',
    name: '3-Day Streak',
    description: 'Work out for 3 consecutive days',
    emoji: '🔥',
  },
  {
    id: 'streak_7',
    name: 'Weekly Warrior',
    description: 'Work out for 7 consecutive days',
    emoji: '⚡',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Work out for 30 consecutive days',
    emoji: '👑',
  },
  {
    id: 'workout_10',
    name: 'Perfect 10',
    description: 'Complete 10 total workouts',
    emoji: '💪',
  },
  {
    id: 'workout_50',
    name: 'Half Century',
    description: 'Complete 50 total workouts',
    emoji: '🏆',
  },
  {
    id: 'workout_100',
    name: 'Century Club',
    description: 'Complete 100 total workouts',
    emoji: '🎖️',
  },
  {
    id: 'minutes_60',
    name: 'Hour Power',
    description: 'Exercise for 60+ minutes total',
    emoji: '⏰',
  },
  {
    id: 'minutes_300',
    name: '5-Hour Hero',
    description: 'Exercise for 300+ minutes total',
    emoji: '🌟',
  },
  {
    id: 'minutes_1000',
    name: 'Time Champion',
    description: 'Exercise for 1000+ minutes total',
    emoji: '🚀',
  },
  {
    id: 'positive_mood',
    name: 'Mood Booster',
    description: 'Log 5 positive workout experiences',
    emoji: '😊',
  },
  {
    id: 'consistency',
    name: 'Steady Eddie',
    description: 'Work out at least once per week for 4 weeks',
    emoji: '📈',
  },
]

/**
 * Check which badges a user has earned based on their stats
 */
export function checkEarnedBadges(stats: {
  totalWorkouts: number
  totalMinutes: number
  currentStreak: number
  longestStreak: number
  positiveMoodCount?: number
  weeklyConsistencyWeeks?: number
}): string[] {
  const earnedBadgeIds: string[] = []

  // First workout
  if (stats.totalWorkouts >= 1) {
    earnedBadgeIds.push('first_workout')
  }

  // Streak badges
  if (stats.longestStreak >= 3) {
    earnedBadgeIds.push('streak_3')
  }
  if (stats.longestStreak >= 7) {
    earnedBadgeIds.push('streak_7')
  }
  if (stats.longestStreak >= 30) {
    earnedBadgeIds.push('streak_30')
  }

  // Workout count badges
  if (stats.totalWorkouts >= 10) {
    earnedBadgeIds.push('workout_10')
  }
  if (stats.totalWorkouts >= 50) {
    earnedBadgeIds.push('workout_50')
  }
  if (stats.totalWorkouts >= 100) {
    earnedBadgeIds.push('workout_100')
  }

  // Time-based badges
  if (stats.totalMinutes >= 60) {
    earnedBadgeIds.push('minutes_60')
  }
  if (stats.totalMinutes >= 300) {
    earnedBadgeIds.push('minutes_300')
  }
  if (stats.totalMinutes >= 1000) {
    earnedBadgeIds.push('minutes_1000')
  }

  // Mood-based badges
  if (stats.positiveMoodCount && stats.positiveMoodCount >= 5) {
    earnedBadgeIds.push('positive_mood')
  }

  // Consistency badge
  if (stats.weeklyConsistencyWeeks && stats.weeklyConsistencyWeeks >= 4) {
    earnedBadgeIds.push('consistency')
  }

  return earnedBadgeIds
}

export default function BadgeSystem({ badges, title = 'Your Badges' }: BadgeSystemProps) {
  const earnedBadges = badges.filter(badge => badge.earned)
  const unearnedBadges = badges.filter(badge => !badge.earned)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {earnedBadges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earned ({earnedBadges.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
            {earnedBadges.map((badge) => (
              <View key={badge.id} style={[styles.badge, styles.earnedBadge]}>
                <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
                {badge.earnedDate && (
                  <Text style={styles.earnedDate}>
                    Earned {new Date(badge.earnedDate).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {unearnedBadges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available ({unearnedBadges.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
            {unearnedBadges.map((badge) => (
              <View key={badge.id} style={[styles.badge, styles.unearnedBadge]}>
                <Text style={[styles.badgeEmoji, styles.unearnedEmoji]}>{badge.emoji}</Text>
                <Text style={[styles.badgeName, styles.unearnedText]}>{badge.name}</Text>
                <Text style={[styles.badgeDescription, styles.unearnedText]}>{badge.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {earnedBadges.length === 0 && unearnedBadges.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No badges available</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 10,
  },
  badgeScroll: {
    flexDirection: 'row',
  },
  badge: {
    width: 120,
    padding: 15,
    borderRadius: 12,
    marginRight: 15,
    alignItems: 'center',
    minHeight: 140,
  },
  earnedBadge: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#007bff',
  },
  unearnedBadge: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  unearnedEmoji: {
    opacity: 0.5,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  badgeDescription: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 16,
  },
  unearnedText: {
    opacity: 0.6,
  },
  earnedDate: {
    fontSize: 10,
    color: '#007bff',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
  },
})
