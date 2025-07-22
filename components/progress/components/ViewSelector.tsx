import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ProgressView } from '../types'
import { COLORS as colors, TYPOGRAPHY as typography, SPACING as spacing } from '../styles/sharedStyles'

interface ViewSelectorProps {
  selectedView: ProgressView
  onViewChange: (view: ProgressView) => void
}

/**
 * ViewSelector Component
 * 
 * Tab navigation for switching between different progress views.
 * Features large touch targets and clear visual feedback for seniors.
 */
const ViewSelector: React.FC<ViewSelectorProps> = ({
  selectedView,
  onViewChange
}) => {
  const viewOptions = [
    {
      id: 'stats' as ProgressView,
      label: 'Stats',
      icon: 'stats-chart' as const,
      description: 'View your workout statistics',
    },
    {
      id: 'calendar' as ProgressView,
      label: 'Calendar',
      icon: 'calendar' as const,
      description: 'See your workout calendar',
    },
    {
      id: 'journal' as ProgressView,
      label: 'Journal',
      icon: 'journal' as const,
      description: 'Read your workout journal',
    },
    {
      id: 'achievements' as ProgressView,
      label: 'Goals',
      icon: 'trophy' as const,
      description: 'Track your achievements',
    },
  ]

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {viewOptions.map((option) => (
          <ViewTab
            key={option.id}
            view={option.id}
            label={option.label}
            icon={option.icon}
            description={option.description}
            isActive={selectedView === option.id}
            onPress={() => onViewChange(option.id)}
          />
        ))}
      </View>
    </View>
  )
}

/**
 * Individual View Tab Component
 */
interface ViewTabProps {
  view: ProgressView
  label: string
  icon: keyof typeof Ionicons.glyphMap
  description: string
  isActive: boolean
  onPress: () => void
}

const ViewTab: React.FC<ViewTabProps> = ({
  view,
  label,
  icon,
  description,
  isActive,
  onPress
}) => {
  return (
    <TouchableOpacity
      style={[styles.tab, isActive && styles.activeTab]}
      onPress={onPress}
      accessibilityLabel={`${label} tab. ${description}`}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={isActive ? colors.background : colors.textSecondary} 
        />
      </View>
      
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {label}
      </Text>
      
      {/* Active indicator */}
      {isActive && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: spacing.md,
    padding: spacing.xs,
    
    // Add subtle shadow
    shadowColor: colors.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.sm,
    marginHorizontal: spacing.xs,
    minHeight: 64, // Ensure adequate touch target for seniors
    justifyContent: 'center',
    position: 'relative',
    
    // Subtle hover effect preparation
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: colors.primary,
    
    // Enhanced shadow for active state
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    backgroundColor: colors.border,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 3,
    backgroundColor: colors.background,
    borderRadius: 2,
  },
})

export default ViewSelector
