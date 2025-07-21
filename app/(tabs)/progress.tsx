import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, FlatList } from 'react-native'
import { supabase } from '../../lib/supabase'
import BadgeSystem, { AVAILABLE_BADGES, checkEarnedBadges, Badge } from '../../components/BadgeSystem'

type ProgressStats = {
  totalWorkouts: number
  totalMinutes: number
  currentStreak: number
  longestStreak: number
  thisWeekWorkouts: number
  thisMonthWorkouts: number
  thisYearWorkouts: number
}

type WorkoutDay = {
  date: string
  hasWorkout: boolean
  workoutCount: number
}

type JournalEntry = {
  id: string
  date: string
  journal_text: string
  sentiment_tag: string
  workout_title?: string
}

export default function ProgressTab() {
  const [stats, setStats] = useState<ProgressStats>({
    totalWorkouts: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    thisWeekWorkouts: 0,
    thisMonthWorkouts: 0,
    thisYearWorkouts: 0,
  })
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [calendarDays, setCalendarDays] = useState<WorkoutDay[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [showJournalModal, setShowJournalModal] = useState(false)
  const [selectedView, setSelectedView] = useState<'stats' | 'calendar' | 'journal'>('stats')

  useEffect(() => {
    fetchProgressStats()
  }, [])

  const fetchProgressStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user streak data
      const { data: userData } = await supabase
        .from('users')
        .select('current_streak, longest_streak')
        .eq('id', user.id)
        .single()

      // Get workout logs for calculations
      const { data: workoutLogs } = await supabase
        .from('workout_logs')
        .select('duration_seconds, date')
        .eq('user_id', user.id)

      if (workoutLogs) {
        const totalWorkouts = workoutLogs.length
        const totalMinutes = Math.round(
          workoutLogs.reduce((sum, log) => sum + log.duration_seconds, 0) / 60
        )

        // Calculate this week's workouts
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const thisWeekWorkouts = workoutLogs.filter(
          log => new Date(log.date) >= oneWeekAgo
        ).length

        // Calculate this month's workouts
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        const thisMonthWorkouts = workoutLogs.filter(
          log => new Date(log.date) >= oneMonthAgo
        ).length

        // Calculate this year's workouts
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        const thisYearWorkouts = workoutLogs.filter(
          log => new Date(log.date) >= oneYearAgo
        ).length

        // Count positive mood entries for badge calculation
        const { data: positiveMoodLogs } = await supabase
          .from('workout_logs')
          .select('id')
          .eq('user_id', user.id)
          .eq('sentiment_tag', 'positive')

        const positiveMoodCount = positiveMoodLogs?.length || 0

        const newStats = {
          totalWorkouts,
          totalMinutes,
          currentStreak: userData?.current_streak || 0,
          longestStreak: userData?.longest_streak || 0,
          thisWeekWorkouts,
          thisMonthWorkouts,
          thisYearWorkouts,
        }

        // Generate calendar data for the last 30 days
        const calendarData = generateCalendarData(workoutLogs)
        setCalendarDays(calendarData)

        setStats(newStats)

        // Calculate earned badges
        const earnedBadgeIds = checkEarnedBadges({
          ...newStats,
          positiveMoodCount,
          weeklyConsistencyWeeks: Math.floor(totalWorkouts / 4), // Simplified calculation
        })

        // Create badge objects with earned status
        const badgeObjects: Badge[] = AVAILABLE_BADGES.map(badge => ({
          ...badge,
          earned: earnedBadgeIds.includes(badge.id),
          earnedDate: earnedBadgeIds.includes(badge.id) ? new Date().toISOString() : undefined,
        }))

        setBadges(badgeObjects)

        // Fetch journal entries
        await fetchJournalEntries(user.id)
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load progress data')
      console.error('Fetch progress error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchJournalEntries = async (userId: string) => {
    try {
      const { data: journalData } = await supabase
        .from('workout_logs')
        .select(`
          id,
          date,
          journal_text,
          sentiment_tag,
          workout_id,
          workouts!inner(title)
        `)
        .eq('user_id', userId)
        .not('journal_text', 'is', null)
        .order('date', { ascending: false })
        .limit(50)

      if (journalData) {
        const entries: JournalEntry[] = journalData.map((entry: any) => ({
          id: entry.id,
          date: entry.date,
          journal_text: entry.journal_text,
          sentiment_tag: entry.sentiment_tag,
          workout_title: entry.workouts?.title || 'Unknown Workout',
        }))
        setJournalEntries(entries)
      }
    } catch (error) {
      console.error('Failed to fetch journal entries:', error)
    }
  }

  const generateCalendarData = (workoutLogs: any[]): WorkoutDay[] => {
    const days: WorkoutDay[] = []
    const today = new Date()
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayWorkouts = workoutLogs.filter(log => 
        log.date.startsWith(dateStr)
      )
      
      days.push({
        date: dateStr,
        hasWorkout: dayWorkouts.length > 0,
        workoutCount: dayWorkouts.length,
      })
    }
    
    return days
  }

  const StatCard = ({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  )

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Progress</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Workouts"
            value={stats.totalWorkouts}
            subtitle="completed"
          />
          <StatCard
            title="Total Time"
            value={stats.totalMinutes}
            subtitle="minutes"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Streaks</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Current Streak"
            value={stats.currentStreak}
            subtitle="days"
          />
          <StatCard
            title="Longest Streak"
            value={stats.longestStreak}
            subtitle="days"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="This Week"
            value={stats.thisWeekWorkouts}
            subtitle="workouts"
          />
          <StatCard
            title="This Month"
            value={stats.thisMonthWorkouts}
            subtitle="workouts"
          />
          <StatCard
            title="This Year"
            value={stats.thisYearWorkouts}
            subtitle="workouts"
          />
        </View>
      </View>

      {/* View Selector */}
      <View style={styles.section}>
        <View style={styles.viewSelector}>
          <TouchableOpacity
            style={[styles.viewTab, selectedView === 'stats' && styles.activeViewTab]}
            onPress={() => setSelectedView('stats')}
          >
            <Text style={[styles.viewTabText, selectedView === 'stats' && styles.activeViewTabText]}>
              Stats
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewTab, selectedView === 'calendar' && styles.activeViewTab]}
            onPress={() => setSelectedView('calendar')}
          >
            <Text style={[styles.viewTabText, selectedView === 'calendar' && styles.activeViewTabText]}>
              Calendar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewTab, selectedView === 'journal' && styles.activeViewTab]}
            onPress={() => setSelectedView('journal')}
          >
            <Text style={[styles.viewTabText, selectedView === 'journal' && styles.activeViewTabText]}>
              Journal
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar View */}
      {selectedView === 'calendar' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last 30 Days</Text>
          <View style={styles.calendar}>
            {calendarDays.map((day, index) => (
              <View key={index} style={styles.calendarDay}>
                <Text style={styles.calendarDayNumber}>
                  {new Date(day.date).getDate()}
                </Text>
                <View style={[
                  styles.calendarDayIndicator,
                  day.hasWorkout && styles.calendarDayActive
                ]}>
                  {day.hasWorkout && (
                    <Text style={styles.calendarDayCount}>{day.workoutCount}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Journal View */}
      {selectedView === 'journal' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Journal Entries</Text>
          {journalEntries.length > 0 ? (
            <View style={styles.journalList}>
              {journalEntries.slice(0, 5).map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.journalItem}
                  onPress={() => setShowJournalModal(true)}
                >
                  <View style={styles.journalHeader}>
                    <Text style={styles.journalDate}>
                      {new Date(entry.date).toLocaleDateString()}
                    </Text>
                    <View style={[
                      styles.sentimentBadge,
                      entry.sentiment_tag === 'positive' && styles.sentimentPositive,
                      entry.sentiment_tag === 'negative' && styles.sentimentNegative,
                      entry.sentiment_tag === 'neutral' && styles.sentimentNeutral,
                    ]}>
                      <Text style={styles.sentimentText}>
                        {entry.sentiment_tag}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.journalPreview} numberOfLines={2}>
                    {entry.journal_text}
                  </Text>
                </TouchableOpacity>
              ))}
              {journalEntries.length > 5 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => setShowJournalModal(true)}
                >
                  <Text style={styles.viewAllText}>
                    View All {journalEntries.length} Entries
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>No journal entries yet</Text>
          )}
        </View>
      )}

      <BadgeSystem badges={badges} title="Your Achievements" />

      {/* Journal Modal */}
      <Modal
        visible={showJournalModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Journal Entries</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowJournalModal(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={journalEntries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.modalJournalItem}>
                <View style={styles.journalHeader}>
                  <Text style={styles.journalDate}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                  <View style={[
                    styles.sentimentBadge,
                    item.sentiment_tag === 'positive' && styles.sentimentPositive,
                    item.sentiment_tag === 'negative' && styles.sentimentNegative,
                    item.sentiment_tag === 'neutral' && styles.sentimentNeutral,
                  ]}>
                    <Text style={styles.sentimentText}>
                      {item.sentiment_tag}
                    </Text>
                  </View>
                </View>
                {item.workout_title && (
                  <Text style={styles.workoutTitle}>
                    Workout: {item.workout_title}
                  </Text>
                )}
                <Text style={styles.journalText}>{item.journal_text}</Text>
              </View>
            )}
            contentContainerStyle={styles.modalContent}
          />
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  achievementContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  achievementText: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 22,
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    padding: 2,
  },
  viewTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeViewTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeViewTabText: {
    color: '#1f2937',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 4,
  },
  calendarDay: {
    width: '13%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  calendarDayNumber: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  calendarDayIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayActive: {
    backgroundColor: '#10b981',
  },
  calendarDayCount: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  journalList: {
    gap: 12,
  },
  journalItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  journalDate: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  sentimentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  sentimentPositive: {
    backgroundColor: '#d1fae5',
  },
  sentimentNegative: {
    backgroundColor: '#fee2e2',
  },
  sentimentNeutral: {
    backgroundColor: '#fef3c7',
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textTransform: 'capitalize',
  },
  journalPreview: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  viewAllButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  modalContent: {
    padding: 16,
    gap: 16,
  },
  modalJournalItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  workoutTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  journalText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
})
