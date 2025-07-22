import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import StatCard from '../components/StatCard'
import { ProgressStats, LevelInfo, Achievement } from '../types'
import { COLORS as colors, TYPOGRAPHY as typography, SPACING as spacing } from '../styles/sharedStyles'

interface StatsViewProps {
  stats: ProgressStats
  levelInfo: LevelInfo
  achievements: Achievement[]
  motivationalMessage: string
  loading: boolean
}

/**
 * StatsView Component
 * 
 * Displays the main statistics view with workout stats, level progression,
 * and motivational content. Designed with senior-friendly UI principles.
 */
const StatsView: React.FC<StatsViewProps> = ({
  stats,
  levelInfo,
  achievements,
  motivationalMessage,
  loading
}) => {
  // Calculate XP progress percentage for the progress bar
  const xpProgress = levelInfo.nextLevelXp > 0 ? (levelInfo.xp / levelInfo.nextLevelXp) * 100 : 0

  // Get next achievement to unlock for motivation
  const nextAchievement = achievements.find(achievement => !achievement.unlocked)

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section with Level and XP */}
      <View style={styles.heroSection}>
        <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>Level</Text>
          <Text style={styles.levelNumber}>{levelInfo.level}</Text>
        </View>
        
        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>
            {levelInfo.xp} / {levelInfo.nextLevelXp} XP
          </Text>
          <View style={styles.xpBarBackground}>
            <View 
              style={[
                styles.xpBarFill, 
                { width: `${Math.min(xpProgress, 100)}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Motivational Message */}
      <View style={styles.motivationContainer}>
        <Text style={styles.motivationText}>{motivationalMessage}</Text>
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Workouts"
          value={stats.totalWorkouts}
          subtitle="completed"
        />
        <StatCard
          title="Total Time"
          value={`${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`}
          subtitle="exercised"
        />
        <StatCard
          title="Current Streak"
          value={stats.currentStreak}
          subtitle="days"
        />
        <StatCard
          title="Longest Streak"
          value={stats.longestStreak}
          subtitle="days"
        />
      </View>

      {/* Time-based Statistics */}
      <View style={styles.timeStatsContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.timeStatsGrid}>
          <View style={styles.timeStatItem}>
            <Text style={styles.timeStatNumber}>{stats.thisWeekWorkouts}</Text>
            <Text style={styles.timeStatLabel}>This Week</Text>
          </View>
          <View style={styles.timeStatItem}>
            <Text style={styles.timeStatNumber}>{stats.thisMonthWorkouts}</Text>
            <Text style={styles.timeStatLabel}>This Month</Text>
          </View>
          <View style={styles.timeStatItem}>
            <Text style={styles.timeStatNumber}>{stats.thisYearWorkouts}</Text>
            <Text style={styles.timeStatLabel}>This Year</Text>
          </View>
        </View>
      </View>

      {/* Next Achievement Preview */}
      {nextAchievement && (
        <View style={styles.nextAchievementContainer}>
          <Text style={styles.sectionTitle}>Next Goal</Text>
          <View style={styles.achievementPreview}>
            <Text style={styles.achievementIcon}>{nextAchievement.icon}</Text>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>{nextAchievement.title}</Text>
              <Text style={styles.achievementDescription}>{nextAchievement.description}</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${Math.min((nextAchievement.progress / nextAchievement.target) * 100, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {nextAchievement.progress} / {nextAchievement.target}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  heroSection: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    borderRadius: spacing.md,
    margin: spacing.md,
    alignItems: 'center',
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  levelLabel: {
    ...typography.caption,
    color: colors.background,
    marginBottom: spacing.xs,
  },
  levelNumber: {
    ...typography.hero,
    color: colors.background,
    fontWeight: 'bold',
  },
  xpContainer: {
    width: '100%',
    alignItems: 'center',
  },
  xpText: {
    ...typography.body,
    color: colors.background,
    marginBottom: spacing.sm,
  },
  xpBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.background,
    borderRadius: 6,
  },
  motivationContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: spacing.md,
    margin: spacing.md,
    marginTop: 0,
  },
  motivationText: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  timeStatsContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: spacing.md,
    margin: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  timeStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeStatItem: {
    alignItems: 'center',
  },
  timeStatNumber: {
    ...typography.title,
    color: colors.primary,
    fontWeight: 'bold',
  },
  timeStatLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  nextAchievementContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: spacing.md,
    margin: spacing.md,
    marginBottom: spacing.xl,
  },
  achievementPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  achievementDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    minWidth: 50,
    textAlign: 'right',
  },
})

export default StatsView
