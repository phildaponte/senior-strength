/**
 * Progress Tab View Components
 * 
 * This file exports all view components used by the Progress Tab.
 * These components handle the rendering of different sections of the progress interface.
 */

export { default as StatsView } from './StatsView'
export { default as CalendarView } from './CalendarView'
export { default as JournalView } from './JournalView'
export { default as AchievementsView } from './AchievementsView'

/**
 * View Components Guide:
 * 
 * StatsView - Displays workout statistics, level progression, and motivational content
 * CalendarView - Shows calendar grid with workout days and navigation
 * JournalView - Lists journal entries with filtering and search capabilities
 * AchievementsView - Shows achievements with progress indicators and animations
 * 
 * Example usage in the main component:
 * 
 * import { StatsView, CalendarView, JournalView, AchievementsView } from './views'
 * 
 * const ProgressTab = () => {
 *   const [selectedView, setSelectedView] = useState('stats')
 *   
 *   const renderView = () => {
 *     switch (selectedView) {
 *       case 'stats': return <StatsView {...statsProps} />
 *       case 'calendar': return <CalendarView {...calendarProps} />
 *       case 'journal': return <JournalView {...journalProps} />
 *       case 'achievements': return <AchievementsView {...achievementsProps} />
 *     }
 *   }
 * }
 */
