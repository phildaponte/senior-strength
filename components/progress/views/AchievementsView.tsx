import React, { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Achievement } from '../types'
import { COLORS as colors, TYPOGRAPHY as typography, SPACING as spacing } from '../styles/sharedStyles'

interface AchievementsViewProps {
  achievements: Achievement[]
  loading: boolean
}

/**
 * AchievementsView Component
 * 
 * Displays achievements with progress indicators and animations.
 * Features senior-friendly design with large icons and clear progress bars.
 */
const AchievementsView: React.FC<AchievementsViewProps> = ({
  achievements,
  loading
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')

  // Filter achievements based on current filter
  const filteredAchievements = achievements.filter(achievement => {
    switch (filter) {
      case 'unlocked': return achievement.unlocked
      case 'locked': return !achievement.unlocked
      default: return true
    }
  })

  // Sort achievements: unlocked first, then by progress percentage
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1
    if (!a.unlocked && b.unlocked) return 1
    
    const aProgress = (a.progress / a.target) * 100
    const bProgress = (b.progress / b.target) * 100
    return bProgress - aProgress
  })

  // Calculate statistics
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0

  const renderAchievement = ({ item }: { item: Achievement }) => (
    <AchievementCard achievement={item} />
  )

  const renderHeader = () => (
    <View>
      {/* Progress Overview */}
      <View style={styles.overviewContainer}>
        <View style={styles.overviewStats}>
          <Text style={styles.overviewNumber}>{unlockedCount}</Text>
          <Text style={styles.overviewLabel}>Unlocked</Text>
        </View>
        <View style={styles.overviewDivider} />
        <View style={styles.overviewStats}>
          <Text style={styles.overviewNumber}>{totalCount}</Text>
          <Text style={styles.overviewLabel}>Total</Text>
        </View>
        <View style={styles.overviewDivider} />
        <View style={styles.overviewStats}>
          <Text style={styles.overviewNumber}>{completionPercentage}%</Text>
          <Text style={styles.overviewLabel}>Complete</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FilterButton
          title="All"
          count={achievements.length}
          isActive={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        <FilterButton
          title="Unlocked"
          count={unlockedCount}
          isActive={filter === 'unlocked'}
          onPress={() => setFilter('unlocked')}
        />
        <FilterButton
          title="Locked"
          count={totalCount - unlockedCount}
          isActive={filter === 'locked'}
          onPress={() => setFilter('locked')}
        />
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>
        {filter === 'all' && 'All Achievements'}
        {filter === 'unlocked' && 'Unlocked Achievements'}
        {filter === 'locked' && 'Locked Achievements'}
      </Text>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </View>
    )
  }

  if (achievements.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="trophy" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>No Achievements Yet</Text>
        <Text style={styles.emptyText}>
          Complete workouts to unlock achievements and track your progress!
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedAchievements}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  )
}

/**
 * Individual Achievement Card Component
 */
interface AchievementCardProps {
  achievement: Achievement
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const [scaleAnim] = useState(new Animated.Value(1))
  
  const progressPercentage = Math.min((achievement.progress / achievement.target) * 100, 100)
  const isUnlocked = achievement.unlocked

  const handlePress = () => {
    // Add a subtle animation when pressed
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View 
        style={[
          styles.achievementCard,
          isUnlocked && styles.unlockedCard,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        {/* Achievement Icon */}
        <View style={[styles.iconContainer, isUnlocked && styles.unlockedIconContainer]}>
          <Text style={[styles.achievementIcon, isUnlocked && styles.unlockedIcon]}>
            {achievement.icon}
          </Text>
          {isUnlocked && (
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Achievement Details */}
        <View style={styles.achievementDetails}>
          <Text style={[styles.achievementTitle, isUnlocked && styles.unlockedTitle]}>
            {achievement.title}
          </Text>
          <Text style={[styles.achievementDescription, isUnlocked && styles.unlockedDescription]}>
            {achievement.description}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill,
                  isUnlocked && styles.unlockedProgressBar,
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, isUnlocked && styles.unlockedProgressText]}>
              {achievement.progress} / {achievement.target}
            </Text>
          </View>

          {/* Status Badge */}
          <View style={styles.statusContainer}>
            {isUnlocked ? (
              <View style={styles.unlockedBadge}>
                <Ionicons name="trophy" size={16} color={colors.background} />
                <Text style={styles.unlockedBadgeText}>Unlocked!</Text>
              </View>
            ) : (
              <View style={styles.lockedBadge}>
                <Ionicons name="lock-closed" size={16} color={colors.textSecondary} />
                <Text style={styles.lockedBadgeText}>
                  {achievement.target - achievement.progress} more to go
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  )
}

/**
 * Filter Button Component
 */
interface FilterButtonProps {
  title: string
  count: number
  isActive: boolean
  onPress: () => void
}

const FilterButton: React.FC<FilterButtonProps> = ({ title, count, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.filterButton, isActive && styles.activeFilterButton]}
    onPress={onPress}
    accessibilityLabel={`Filter by ${title}, ${count} items`}
  >
    <Text style={[styles.filterButtonText, isActive && styles.activeFilterButtonText]}>
      {title}
    </Text>
    <Text style={[styles.filterCount, isActive && styles.activeFilterCount]}>
      {count}
    </Text>
  </TouchableOpacity>
)

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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    padding: spacing.md,
  },
  overviewContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  overviewStats: {
    flex: 1,
    alignItems: 'center',
  },
  overviewNumber: {
    ...typography.title,
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 28,
  },
  overviewLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  activeFilterButtonText: {
    color: colors.background,
    fontWeight: '600',
  },
  filterCount: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  activeFilterCount: {
    color: colors.background,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.7,
  },
  unlockedCard: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 2,
    opacity: 1,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    position: 'relative',
  },
  unlockedIconContainer: {
    backgroundColor: colors.primary,
  },
  achievementIcon: {
    fontSize: 32,
    opacity: 0.6,
  },
  unlockedIcon: {
    opacity: 1,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  achievementDetails: {
    flex: 1,
  },
  achievementTitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  unlockedTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  achievementDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  unlockedDescription: {
    color: colors.textPrimary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    backgroundColor: colors.textSecondary,
    borderRadius: 4,
  },
  unlockedProgressBar: {
    backgroundColor: colors.primary,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    minWidth: 50,
    textAlign: 'right',
  },
  unlockedProgressText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
  },
  unlockedBadgeText: {
    ...typography.caption,
    color: colors.background,
    marginLeft: spacing.xs,
    fontWeight: 'bold',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
  },
  lockedBadgeText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
})

export default AchievementsView
