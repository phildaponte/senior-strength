import { StyleSheet } from 'react-native'

// Design System Colors (from memory - senior-friendly design)
export const COLORS = {
  // Primary Colors
  lightBlue: '#7ED5F9',
  darkBlue: '#0D2853',
  softWhite: '#FAFAFA',
  softBlack: '#1A1A1A',
  
  // Semantic Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  
  // Sentiment Colors
  positive: '#4CAF50',
  negative: '#F44336',
  neutral: '#9E9E9E',
  
  // Grays
  lightGray: '#F5F5F5',
  mediumGray: '#E0E0E0',
  darkGray: '#757575',
  
  // Aliases for component compatibility
  primary: '#7ED5F9',
  secondary: '#0D2853', 
  background: '#FAFAFA',
  surface: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#757575',
  border: '#E0E0E0',
}

// Typography Scale (Senior-friendly with larger fonts)
export const TYPOGRAPHY = {
  // Headers
  heroTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: COLORS.darkBlue,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: COLORS.darkBlue,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: COLORS.darkBlue,
  },
  
  // Body Text
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    color: COLORS.softBlack,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: COLORS.softBlack,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: COLORS.darkGray,
  },
  
  // Special Text
  statNumber: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: COLORS.darkBlue,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.darkBlue,
  },
  
  // Aliases for component compatibility
  hero: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: COLORS.darkBlue,
  },
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: COLORS.darkBlue,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.darkBlue,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: COLORS.softBlack,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: COLORS.darkGray,
  },
}

// Spacing Scale
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

// Border Radius
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
}

// Shadows (for cards and elevated elements)
export const SHADOWS = {
  small: {
    shadowColor: COLORS.softBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.softBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.softBlack,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
}

// Common Styles
export const commonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: COLORS.softWhite,
  },
  section: {
    backgroundColor: COLORS.softWhite,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  card: {
    backgroundColor: COLORS.softWhite,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    ...SHADOWS.small,
  },
  
  // Layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Text
  sectionTitle: {
    ...TYPOGRAPHY.sectionTitle,
    marginBottom: SPACING.md,
  },
  
  // Buttons
  primaryButton: {
    backgroundColor: COLORS.lightBlue,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...TYPOGRAPHY.buttonText,
    color: COLORS.darkBlue,
  },
  
  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.softWhite,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.darkGray,
  },
  
  // Empty States
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
})
