import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ProgressView } from '../types'
import { COLORS as colors, TYPOGRAPHY as typography, SPACING as spacing, RADIUS, SHADOWS } from '../styles/sharedStyles'

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
  const slideAnim = useRef(new Animated.Value(0)).current
  const screenWidth = Dimensions.get('window').width
  const tabWidth = (screenWidth - (spacing.md * 2) - (spacing.xs * 2)) / 4 // Account for margins and padding
  
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
  
  // Animate sliding indicator when selected view changes
  useEffect(() => {
    const selectedIndex = viewOptions.findIndex(option => option.id === selectedView)
    Animated.spring(slideAnim, {
      toValue: selectedIndex * tabWidth,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start()
  }, [selectedView, tabWidth])

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {/* Sliding background indicator */}
        <Animated.View 
          style={[
            styles.slidingIndicator,
            {
              transform: [{ translateX: slideAnim }],
              width: tabWidth - (spacing.xs * 2), // Account for margins
            }
          ]} 
        />
        
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
    marginVertical: spacing.md,
    borderRadius: spacing.md,
    padding: spacing.xs,
    height: 80, // Fixed height to ensure consistent vertical space
    
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
    height: '100%', // Fill the entire container height
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs, // Reduced vertical padding
    paddingHorizontal: spacing.sm,
    borderRadius: RADIUS.sm,
    marginHorizontal: spacing.xs,
    height: '100%', // Fill the entire height
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1, // Ensure tabs are above sliding indicator
    backgroundColor: 'transparent',
  },
  activeTab: {
    // Remove background since we're using sliding indicator
    backgroundColor: 'transparent',
  },
  slidingIndicator: {
    position: 'absolute',
    top: spacing.xs / 2, // Reduced top margin
    left: spacing.xs,
    bottom: spacing.xs / 2, // Added bottom margin
    height: 'auto', // Auto height to fill available space
    backgroundColor: colors.secondary,
    borderRadius: RADIUS.sm,
    zIndex: 0,
    ...SHADOWS.medium,
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ scale: 1.1 }], // Slightly larger when active
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
    transform: [{ scale: 1.05 }], // Slightly larger when active
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
