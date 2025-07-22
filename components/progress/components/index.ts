/**
 * Progress Tab UI Components
 * 
 * This file exports all reusable UI components used by the Progress Tab.
 * These components handle specific UI elements and can be reused across views.
 */

export { default as StatCard } from './StatCard'
export { default as HeroSection } from './HeroSection'
export { default as QuickStats } from './QuickStats'
export { default as ViewSelector } from './ViewSelector'
export { default as JournalModal } from './JournalModal'

/**
 * UI Components Guide:
 * 
 * StatCard - Displays individual statistics with title, value, and subtitle
 * HeroSection - Shows level, XP progress, and motivational message
 * QuickStats - Grid of key statistics with icons and colors
 * ViewSelector - Tab navigation for switching between views
 * JournalModal - Full-screen modal for displaying journal entries
 * 
 * Example usage in views:
 * 
 * import { StatCard, HeroSection, ViewSelector } from '../components'
 * 
 * const MyView = () => {
 *   return (
 *     <View>
 *       <HeroSection levelInfo={levelInfo} motivationalMessage={message} />
 *       <ViewSelector selectedView={view} onViewChange={setView} />
 *       <StatCard title="Workouts" value={42} subtitle="completed" />
 *     </View>
 *   )
 * }
 */
