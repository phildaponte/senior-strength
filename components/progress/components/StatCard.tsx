import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StatCardProps } from '../types'
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../styles/sharedStyles'

/**
 * StatCard Component
 * 
 * A reusable card component for displaying statistics with title, value, and optional subtitle.
 * Enhanced with icons, colors, and special styling for streaks.
 * Designed with senior-friendly typography and accessibility in mind.
 * 
 * @param title - The main label for the statistic
 * @param value - The numeric or text value to display prominently
 * @param subtitle - Optional descriptive text below the value
 * @param icon - Optional Ionicon name to display above the title
 * @param iconColor - Color for the icon
 * @param isStreak - Whether this card represents a streak stat
 * @param streakType - Type of streak ('current' or 'longest') for special styling
 */
const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconColor, 
  isStreak = false, 
  streakType 
}) => {
  // Determine card styling based on streak type and value
  const getCardStyle = () => {
    if (isStreak && streakType === 'current' && Number(value) > 0) {
      return [styles.card, styles.currentStreakCard]
    }
    if (isStreak && streakType === 'longest' && Number(value) > 7) {
      return [styles.card, styles.longestStreakCard]
    }
    return styles.card
  }

  const getValueStyle = () => {
    if (isStreak && streakType === 'current' && Number(value) > 0) {
      return [styles.value, styles.currentStreakValue]
    }
    if (isStreak && streakType === 'longest' && Number(value) > 7) {
      return [styles.value, styles.longestStreakValue]
    }
    return styles.value
  }

  return (
    <View style={getCardStyle()}>
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons 
            name={icon as any} 
            size={24} 
            color={iconColor || COLORS.primary} 
          />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={getValueStyle()}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {isStreak && Number(value) > 0 && streakType === 'current' && (
        <View style={styles.streakIndicator}>
          <Text style={styles.streakText}>Active!</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.softWhite,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    width: '48%',  // Make cards take up equal width (with small gap between)
    aspectRatio: 1, // Make cards square
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightBlue,
    marginBottom: SPACING.md, // Add consistent margin
    ...SHADOWS.small,
  },
  currentStreakCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  longestStreakCard: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFDE7',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: SPACING.xs,
    padding: SPACING.xs,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(126, 213, 249, 0.1)',
  },
  title: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  value: {
    ...TYPOGRAPHY.statNumber,
    color: COLORS.darkBlue,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  currentStreakValue: {
    color: '#2E7D32',
    fontWeight: '800',
  },
  longestStreakValue: {
    color: '#F57F17',
    fontWeight: '800',
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  streakIndicator: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: '#4CAF50',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  streakText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.softWhite,
    fontSize: 10,
    fontWeight: '600',
  },
})

export default StatCard
