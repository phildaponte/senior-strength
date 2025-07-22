/**
 * Progress Tab Custom Hooks
 * 
 * This file exports all custom hooks used by the Progress Tab component.
 * These hooks encapsulate data fetching, state management, and business logic
 * to keep the main component clean and focused on rendering.
 */

export { useProgressStats } from './useProgressStats'
export { useJournalEntries } from './useJournalEntries'
export { useCalendarData } from './useCalendarData'

/**
 * Hook Usage Guide:
 * 
 * useProgressStats - Manages workout statistics, badges, achievements, and level progression
 * useJournalEntries - Handles journal entry fetching, filtering, and pagination
 * useCalendarData - Manages calendar generation, navigation, and workout day visualization
 * 
 * Example usage in a component:
 * 
 * import { useProgressStats, useJournalEntries, useCalendarData } from './hooks'
 * 
 * const MyComponent = () => {
 *   const { stats, loading, refreshStats } = useProgressStats()
 *   const { journalEntries, updateSearchQuery } = useJournalEntries()
 *   const { calendarDays, navigateMonth } = useCalendarData()
 *   
 *   // Component logic here...
 * }
 */
