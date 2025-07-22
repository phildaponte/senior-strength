import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { WorkoutDay } from '../types'
import { COLORS as colors, TYPOGRAPHY as typography, SPACING as spacing } from '../styles/sharedStyles'

interface CalendarViewProps {
  calendarDays: WorkoutDay[]
  currentDate: Date
  onNavigateMonth: (direction: 'prev' | 'next') => void
  monthYear: string
  dayHeaders: string[]
  loading: boolean
}

/**
 * CalendarView Component
 * 
 * Displays a calendar grid showing workout days with senior-friendly design.
 * Features large touch targets, clear visual indicators, and accessible navigation.
 */
const CalendarView: React.FC<CalendarViewProps> = ({
  calendarDays,
  currentDate,
  onNavigateMonth,
  monthYear,
  dayHeaders,
  loading
}) => {
  // Calculate calendar statistics for the current month
  const currentMonthDays = calendarDays.filter(day => day.isCurrentMonth && day.date)
  const workoutDays = currentMonthDays.filter(day => day.hasWorkout)
  const workoutPercentage = currentMonthDays.length > 0 
    ? Math.round((workoutDays.length / currentMonthDays.length) * 100)
    : 0

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Calendar Header with Navigation */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => onNavigateMonth('prev')}
          accessibilityLabel="Previous month"
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <Text style={styles.monthYear}>{monthYear}</Text>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => onNavigateMonth('next')}
          accessibilityLabel="Next month"
        >
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Month Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{workoutDays.length}</Text>
          <Text style={styles.statLabel}>Workout Days</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{workoutPercentage}%</Text>
          <Text style={styles.statLabel}>Monthly Goal</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {workoutDays.reduce((sum, day) => sum + (day.totalMinutes || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Total Minutes</Text>
        </View>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        {/* Day Headers */}
        <View style={styles.dayHeadersRow}>
          {dayHeaders.map((day, index) => (
            <Text key={index} style={styles.dayHeader}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Days Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => (
            <CalendarDay
              key={index}
              day={day}
              isToday={day.isToday}
              hasWorkout={day.hasWorkout}
              isCurrentMonth={day.isCurrentMonth}
              workoutCount={day.workoutCount}
            />
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.workoutDot]} />
            <Text style={styles.legendText}>Workout Day</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.todayDot]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.regularDot]} />
            <Text style={styles.legendText}>Regular Day</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

/**
 * Individual Calendar Day Component
 * 
 * Represents a single day in the calendar with workout indicators
 */
interface CalendarDayProps {
  day: WorkoutDay
  isToday: boolean
  hasWorkout: boolean
  isCurrentMonth: boolean
  workoutCount: number
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  isToday,
  hasWorkout,
  isCurrentMonth,
  workoutCount
}) => {
  // Don't render days without dates (empty calendar cells)
  if (!day.date) {
    return <View style={styles.emptyDay} />
  }

  const dayNumber = new Date(day.date).getDate()

  return (
    <View style={[
      styles.calendarDay,
      isToday && styles.todayDay,
      hasWorkout && styles.workoutDay,
      !isCurrentMonth && styles.otherMonthDay
    ]}>
      <Text style={[
        styles.dayNumber,
        isToday && styles.todayDayNumber,
        hasWorkout && styles.workoutDayNumber,
        !isCurrentMonth && styles.otherMonthDayNumber
      ]}>
        {dayNumber}
      </Text>
      
      {/* Workout indicator */}
      {hasWorkout && (
        <View style={styles.workoutIndicator}>
          {workoutCount > 1 && (
            <Text style={styles.workoutCount}>{workoutCount}</Text>
          )}
        </View>
      )}
      
      {/* Today indicator */}
      {isToday && (
        <View style={styles.todayIndicator} />
      )}
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: spacing.md,
  },
  navButton: {
    padding: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.background,
    minWidth: 44, // Accessibility minimum touch target
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYear: {
    ...typography.title,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.title,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  calendarContainer: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    borderRadius: spacing.md,
    padding: spacing.md,
  },
  dayHeadersRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: 'bold',
    paddingVertical: spacing.sm,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%', // 1/7 of the width for 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: spacing.sm,
    marginBottom: 2,
    position: 'relative',
    minHeight: 50, // Ensure adequate touch target size
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  todayDay: {
    backgroundColor: colors.secondary,
  },
  workoutDay: {
    backgroundColor: colors.primary,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  dayNumber: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  todayDayNumber: {
    color: colors.background,
    fontWeight: 'bold',
  },
  workoutDayNumber: {
    color: colors.background,
    fontWeight: 'bold',
  },
  otherMonthDayNumber: {
    color: colors.textSecondary,
  },
  workoutIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background,
  },
  workoutCount: {
    fontSize: 8,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 2,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.background,
  },
  legendContainer: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: spacing.md,
  },
  legendTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  workoutDot: {
    backgroundColor: colors.primary,
  },
  todayDot: {
    backgroundColor: colors.secondary,
  },
  regularDot: {
    backgroundColor: colors.border,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
})

export default CalendarView
