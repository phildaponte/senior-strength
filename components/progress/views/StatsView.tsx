import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import StatCard from '../components/StatCard'
import { ProgressStats, LevelInfo, Achievement } from '../types'
import { COLORS as colors, TYPOGRAPHY as typography, SPACING as spacing, SHADOWS, RADIUS } from '../styles/sharedStyles'

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
 * and motivational content. Enhanced with animations, icons, and vibrant design
 * while maintaining senior-friendly UI principles.
 */
const StatsView: React.FC<StatsViewProps> = ({
  stats,
  levelInfo,
  achievements,
  motivationalMessage,
  loading
}) => {
  // Animation references for smooth transitions
  const fadeAnim = useRef(new Animated.Value(0)).current
  const xpBarAnim = useRef(new Animated.Value(0)).current
  const statsAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  
  // Calculate XP progress percentage for the progress bar
  const xpProgress = levelInfo.nextLevelXp > 0 ? (levelInfo.xp / levelInfo.nextLevelXp) * 100 : 0
  const isCloseToLevelUp = xpProgress >= 80 // Add glow effect when close to leveling up

  // Get next achievement to unlock for motivation
  const nextAchievement = achievements.find(achievement => !achievement.unlocked)
  
  // Animate components on mount
  useEffect(() => {
    if (!loading) {
      // Stagger animations for smooth entrance
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(xpBarAnim, {
          toValue: xpProgress,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(statsAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start()
      
      // Pulse animation for close-to-level-up state
      if (isCloseToLevelUp) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start()
      }
    }
  }, [loading, xpProgress, isCloseToLevelUp])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section with Level and XP - Enhanced with animations */}
      <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.levelContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.levelLabel}>Level</Text>
          <Text style={styles.levelNumber}>{levelInfo.level}</Text>
          {isCloseToLevelUp && (
            <View style={styles.levelUpIndicator}>
              <Ionicons name="flash" size={16} color={colors.background} />
              <Text style={styles.levelUpText}>Almost there!</Text>
            </View>
          )}
        </Animated.View>
        
        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>
            {levelInfo.xp} / {levelInfo.nextLevelXp} XP
          </Text>
          <View style={[styles.xpBarBackground, isCloseToLevelUp && styles.xpBarGlow]}>
            <Animated.View 
              style={[
                styles.xpBarFill,
                isCloseToLevelUp && styles.xpBarFillGlow,
                { 
                  width: xpBarAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp'
                  })
                }
              ]} 
            />
          </View>
        </View>
      </Animated.View>

      {/* Enhanced Motivational Message with quote styling */}
      <Animated.View style={[styles.motivationContainer, { opacity: fadeAnim }]}>
        <View style={styles.quoteIconContainer}>
          <Ionicons name="chatbubble-ellipses" size={24} color={colors.primary} />
        </View>
        <Text style={styles.quoteText}>"{motivationalMessage}"</Text>
        <View style={styles.quoteDivider} />
      </Animated.View>

      {/* Enhanced Quick Stats Grid with icons and animations */}
      <Animated.View style={[styles.statsGrid, { opacity: statsAnim }]}>
        <StatCard
          title="Total Workouts"
          value={stats.totalWorkouts}
          subtitle="completed"
          icon="barbell"
          iconColor={colors.primary}
        />
        <StatCard
          title="Total Time"
          value={`${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`}
          subtitle="exercised"
          icon="stopwatch"
          iconColor={colors.secondary}
        />
        <StatCard
          title="Current Streak"
          value={stats.currentStreak}
          subtitle="days"
          icon="flame"
          iconColor={stats.currentStreak > 0 ? '#4CAF50' : colors.textSecondary}
          isStreak={true}
          streakType="current"
        />
        <StatCard
          title="Longest Streak"
          value={stats.longestStreak}
          subtitle="days"
          icon="trophy"
          iconColor={stats.longestStreak > 7 ? '#FFD700' : colors.textSecondary}
          isStreak={true}
          streakType="longest"
        />
      </Animated.View>

      {/* Enhanced Next Achievement Preview with badge visualization */}
      {nextAchievement && (
        <Animated.View style={[styles.nextAchievementContainer, { opacity: statsAnim }]}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="flag" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Next Goal</Text>
          </View>
          <View style={styles.achievementPreview}>
            <View style={styles.badgeContainer}>
              <View style={styles.badgeBackground}>
                <Text style={styles.achievementIcon}>{nextAchievement.icon}</Text>
              </View>
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>{nextAchievement.title}</Text>
              <Text style={styles.achievementDescription}>{nextAchievement.description}</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                  <Animated.View 
                    style={[
                      styles.progressBarFill,
                      styles.achievementProgressFill,
                      { width: `${Math.min((nextAchievement.progress / nextAchievement.target) * 100, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {nextAchievement.progress} / {nextAchievement.target}
                </Text>
              </View>
              <Text style={styles.progressPercentage}>
                {Math.round((nextAchievement.progress / nextAchievement.target) * 100)}% Complete
              </Text>
            </View>
          </View>
        </Animated.View>
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
    backgroundColor: colors.secondary,
    padding: spacing.xl,
    borderRadius: RADIUS.lg,
    margin: spacing.md,
    alignItems: 'center',
    ...SHADOWS.medium,
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
  levelUpIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: RADIUS.sm,
  },
  levelUpText: {
    ...typography.caption,
    color: colors.background,
    marginLeft: spacing.xs,
    fontWeight: '600',
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
  xpBarGlow: {
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.background,
    borderRadius: 6,
  },
  xpBarFillGlow: {
    backgroundColor: '#E8F5E8',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  motivationContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: RADIUS.md,
    margin: spacing.md,
    marginTop: 0,
    ...SHADOWS.small,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  quoteIconContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quoteText: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 24,
  },
  quoteDivider: {
    width: 40,
    height: 2,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    marginTop: spacing.sm,
    borderRadius: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  nextAchievementContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: RADIUS.md,
    margin: spacing.md,
    marginBottom: spacing.xl,
    ...SHADOWS.small,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  achievementPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  badgeContainer: {
    width: 80,
    height: 80,
    marginRight: spacing.md,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  achievementIcon: {
    fontSize: 32,
    color: colors.background,
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
  achievementProgressFill: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  progressPercentage: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    minWidth: 50,
    textAlign: 'right',
  },
})

export default StatsView
