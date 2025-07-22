import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ProgressStats } from '../types'
import { COLORS as colors, TYPOGRAPHY as typography, SPACING as spacing } from '../styles/sharedStyles'

interface QuickStatsProps {
  stats: ProgressStats
}

/**
 * QuickStats Component
 * 
 * Displays key statistics in a grid layout with icons and clear labels.
 * Designed for quick overview of workout progress with senior-friendly design.
 */
const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  // Format total time for display
  const formatTotalTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours === 0) {
      return `${remainingMinutes}m`
    } else if (remainingMinutes === 0) {
      return `${hours}h`
    } else {
      return `${hours}h ${remainingMinutes}m`
    }
  }

  const quickStatsData = [
    {
      id: 'total-workouts',
      icon: 'fitness' as const,
      value: stats.totalWorkouts,
      label: 'Total Workouts',
      color: colors.primary,
    },
    {
      id: 'total-time',
      icon: 'time' as const,
      value: formatTotalTime(stats.totalMinutes),
      label: 'Total Time',
      color: colors.success,
    },
    {
      id: 'current-streak',
      icon: 'flame' as const,
      value: stats.currentStreak,
      label: 'Current Streak',
      color: '#FF6B35', // Orange for streak
    },
    {
      id: 'longest-streak',
      icon: 'trophy' as const,
      value: stats.longestStreak,
      label: 'Best Streak',
      color: '#FFD700', // Gold for achievement
    },
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Stats</Text>
      <View style={styles.statsGrid}>
        {quickStatsData.map((stat) => (
          <QuickStatCard
            key={stat.id}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            color={stat.color}
          />
        ))}
      </View>
    </View>
  )
}

/**
 * Individual Quick Stat Card Component
 */
interface QuickStatCardProps {
  icon: keyof typeof Ionicons.glyphMap
  value: string | number
  label: string
  color: string
}

const QuickStatCard: React.FC<QuickStatCardProps> = ({
  icon,
  value,
  label,
  color
}) => {
  return (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color={colors.background} />
      </View>
      
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    margin: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: spacing.sm,
    padding: spacing.md,
    width: '48%', // Two cards per row with gap
    minHeight: 80, // Ensure adequate touch target
    borderWidth: 1,
    borderColor: colors.border,
    
    // Add subtle shadow
    shadowColor: colors.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statValue: {
    ...typography.title,
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'left',
    lineHeight: 16,
  },
})

export default QuickStats
