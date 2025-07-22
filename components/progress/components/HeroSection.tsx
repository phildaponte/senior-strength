import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { LevelInfo } from '../types'
import { COLORS as colors, TYPOGRAPHY as typography, SPACING as spacing } from '../styles/sharedStyles'

interface HeroSectionProps {
  levelInfo: LevelInfo
  motivationalMessage: string
}

/**
 * HeroSection Component
 * 
 * Displays the user's level, XP progress, and motivational message.
 * Features a prominent design with progress visualization for senior users.
 */
const HeroSection: React.FC<HeroSectionProps> = ({
  levelInfo,
  motivationalMessage
}) => {
  // Calculate XP progress percentage for the progress bar
  const xpProgress = levelInfo.nextLevelXp > 0 ? (levelInfo.xp / levelInfo.nextLevelXp) * 100 : 0

  return (
    <View style={styles.container}>
      {/* Level Display */}
      <View style={styles.levelContainer}>
        <Text style={styles.levelLabel}>Level</Text>
        <Text style={styles.levelNumber}>{levelInfo.level}</Text>
      </View>
      
      {/* XP Progress */}
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
        <Text style={styles.xpPercentage}>
          {Math.round(xpProgress)}% to next level
        </Text>
      </View>

      {/* Motivational Message */}
      {motivationalMessage && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{motivationalMessage}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
    padding: spacing.xl,
    borderRadius: spacing.md,
    margin: spacing.md,
    alignItems: 'center',
    // Add subtle shadow for depth
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  levelLabel: {
    ...typography.caption,
    color: colors.background,
    marginBottom: spacing.xs,
    fontSize: 16, // Larger for senior accessibility
  },
  levelNumber: {
    ...typography.hero,
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 48, // Extra large for visual impact
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  xpContainer: {
    width: '100%',
    alignItems: 'center',
  },
  xpText: {
    ...typography.body,
    color: colors.background,
    marginBottom: spacing.sm,
    fontSize: 18, // Larger for readability
    fontWeight: '600',
  },
  xpBarBackground: {
    width: '100%',
    height: 16, // Thicker progress bar for better visibility
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.background,
    borderRadius: 8,
    // Add subtle animation feel with transition
    minWidth: 4, // Ensure some visual feedback even at 0%
  },
  xpPercentage: {
    ...typography.caption,
    color: colors.background,
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
  },
  messageContainer: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    width: '100%',
  },
  messageText: {
    ...typography.body,
    color: colors.background,
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
})

export default HeroSection
