import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { StatCardProps } from '../types'
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../styles/sharedStyles'

/**
 * StatCard Component
 * 
 * A reusable card component for displaying statistics with title, value, and optional subtitle.
 * Designed with senior-friendly typography and accessibility in mind.
 * 
 * @param title - The main label for the statistic
 * @param value - The numeric or text value to display prominently
 * @param subtitle - Optional descriptive text below the value
 */
const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.softWhite,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightBlue,
    ...SHADOWS.small,
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
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
})

export default StatCard
