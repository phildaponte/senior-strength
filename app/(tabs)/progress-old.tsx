import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, FlatList, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import BadgeSystem, { AVAILABLE_BADGES, checkEarnedBadges } from '../../components/BadgeSystem'

// Import our new utilities and types
import { 
  calculateLevelInfo, 
  calculateTimeBasedStats, 
  calculateTotalStats, 
  getMotivationalMessage 
} from '../../components/progress/utils/progressCalculations'
import { 
  generateCalendarData, 
  navigateMonth as navigateMonthHelper,
  formatMonthYear,
  getDayHeaders 
} from '../../components/progress/utils/calendarHelpers'
import { generateAchievements } from '../../components/progress/utils/achievementHelpers'
import StatCard from '../../components/progress/components/StatCard'
import { 
  ProgressStats, 
  WorkoutDay, 
  JournalEntry, 
  Achievement, 
  LevelInfo,
  Badge 
} from '../../components/progress/types'

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
  const [selectedView, setSelectedView] = useState<'stats' | 'calendar' | 'journal' | 'achievements'>('stats')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [motivationalMessage, setMotivationalMessage] = useState('')
  const [levelInfo, setLevelInfo] = useState<LevelInfo>({ level: 1, xp: 0, nextLevelXp: 100 })

  useEffect(() => {
    fetchProgressStats()
  }, [])

  useEffect(() => {
    // Update calendar when currentDate changes
    if (!loading) {
      fetchProgressStats()
    }
  }, [currentDate])

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
        // Use our utility functions for calculations
        const { totalWorkouts, totalMinutes } = calculateTotalStats(workoutLogs)
        const { thisWeekWorkouts, thisMonthWorkouts, thisYearWorkouts } = calculateTimeBasedStats(workoutLogs)

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

        // Generate calendar data for the current month
        const calendarData = generateCalendarData(workoutLogs, currentDate)
        setCalendarDays(calendarData)

        // Calculate level and XP using utility function
        const levelData = calculateLevelInfo(totalWorkouts, totalMinutes)
        setLevelInfo(levelData)

        // Generate achievements
        const achievementData = generateAchievements(newStats, totalMinutes)
        setAchievements(achievementData)

        // Set motivational message
        setMotivationalMessage(getMotivationalMessage(newStats))

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







  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = navigateMonthHelper(currentDate, direction)
    setCurrentDate(newDate)
  }



  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Hero Section with Level and Motivation */}
      <View style={styles.heroSection}>
        <View style={styles.levelContainer}>
          <Text style={styles.levelText}>Level {levelInfo.level}</Text>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${(levelInfo.xp / levelInfo.nextLevelXp) * 100}%` }]} />
          </View>
          <Text style={styles.xpText}>{levelInfo.xp}/{levelInfo.nextLevelXp} XP</Text>
        </View>
        <Text style={styles.motivationalText}>{motivationalMessage}</Text>
      </View>

      {/* Quick Stats Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatNumber}>{stats.totalWorkouts}</Text>
            <Text style={styles.quickStatLabel}>Total Workouts</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatNumber}>{stats.currentStreak}</Text>
            <Text style={styles.quickStatLabel}>Day Streak</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatNumber}>{Math.floor(stats.totalMinutes / 60)}h</Text>
            <Text style={styles.quickStatLabel}>Total Hours</Text>
          </View>
        </View>
      </View>

      {/* View Selector */}
      <View style={styles.section}>
        <View style={styles.viewSelector}>
          <TouchableOpacity
            style={[styles.viewTab, selectedView === 'stats' && styles.activeViewTab]}
            onPress={() => setSelectedView('stats')}
          >
            <Ionicons name="stats-chart" size={20} color={selectedView === 'stats' ? '#0D2853' : '#7ED5F9'} />
            <Text style={[styles.viewTabText, selectedView === 'stats' && styles.activeViewTabText]}>
              Stats
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewTab, selectedView === 'calendar' && styles.activeViewTab]}
            onPress={() => setSelectedView('calendar')}
          >
            <Ionicons name="calendar" size={20} color={selectedView === 'calendar' ? '#0D2853' : '#7ED5F9'} />
            <Text style={[styles.viewTabText, selectedView === 'calendar' && styles.activeViewTabText]}>
              Calendar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewTab, selectedView === 'achievements' && styles.activeViewTab]}
            onPress={() => setSelectedView('achievements')}
          >
            <Ionicons name="trophy" size={20} color={selectedView === 'achievements' ? '#0D2853' : '#7ED5F9'} />
            <Text style={[styles.viewTabText, selectedView === 'achievements' && styles.activeViewTabText]}>
              Achievements
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewTab, selectedView === 'journal' && styles.activeViewTab]}
            onPress={() => setSelectedView('journal')}
          >
            <Ionicons name="journal" size={20} color={selectedView === 'journal' ? '#0D2853' : '#7ED5F9'} />
            <Text style={[styles.viewTabText, selectedView === 'journal' && styles.activeViewTabText]}>
              Journal
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar View */}
      {selectedView === 'calendar' && (
        <View style={styles.section}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              style={styles.monthNavButton}
              onPress={() => navigateMonth('prev')}
            >
              <Ionicons name="chevron-back" size={24} color="#0D2853" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {formatMonthYear(currentDate)}
            </Text>
            <TouchableOpacity 
              style={styles.monthNavButton}
              onPress={() => navigateMonth('next')}
            >
              <Ionicons name="chevron-forward" size={24} color="#0D2853" />
            </TouchableOpacity>
          </View>
          
          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {getDayHeaders().map((day) => (
              <Text key={day} style={styles.dayHeader}>{day}</Text>
            ))}
          </View>
          
          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity key={index} style={[
                styles.calendarDay,
                day.isToday && styles.calendarDayToday,
                !day.isCurrentMonth && styles.calendarDayOtherMonth
              ]}>
                <Text style={[
                  styles.calendarDayNumber,
                  day.isToday && styles.calendarDayNumberToday,
                  !day.isCurrentMonth && styles.calendarDayNumberOtherMonth
                ]}>
                  {new Date(day.date).getDate()}
                </Text>
                {day.hasWorkout && (
                  <View style={styles.workoutIndicator}>
                    <Text style={styles.workoutCount}>{day.workoutCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Calendar Legend */}
          <View style={styles.calendarLegend}>
            <View style={styles.legendItem}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>Workout completed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotToday]} />
              <Text style={styles.legendText}>Today</Text>
            </View>
          </View>
        </View>
      )}

      {/* Stats View */}
      {selectedView === 'stats' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Statistics</Text>
          <View style={styles.detailedStatsGrid}>
            <StatCard
              title="Total Workouts"
              value={stats.totalWorkouts}
              subtitle="completed"
            />
            <StatCard
              title="Total Minutes"
              value={stats.totalMinutes}
              subtitle="exercised"
            />
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
          </View>
        </View>
      )}

      {/* Achievements View */}
      {selectedView === 'achievements' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={[
                styles.achievementCard,
                achievement.unlocked && styles.achievementUnlocked
              ]}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                <View style={styles.achievementProgress}>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      { width: `${(achievement.progress / achievement.target) * 100}%` }
                    ]} />
                  </View>
                  <Text style={styles.progressText}>
                    {achievement.progress}/{achievement.target}
                  </Text>
                </View>
                {achievement.unlocked && (
                  <View style={styles.unlockedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#7ED5F9" />
                    <Text style={styles.unlockedText}>Unlocked!</Text>
                  </View>
                )}
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

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Soft White
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    color: '#0D2853', // Dark Blue
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
  },
  
  // Hero Section Styles
  heroSection: {
    backgroundColor: '#0D2853', // Dark Blue
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  levelText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FAFAFA', // Soft White
    marginBottom: 12,
  },
  xpBar: {
    width: width * 0.6,
    height: 12,
    backgroundColor: '#1A1A1A', // Soft Black
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#7ED5F9', // Light Blue
    borderRadius: 6,
  },
  xpText: {
    fontSize: 16,
    color: '#FAFAFA', // Soft White
    fontWeight: '500',
  },
  motivationalText: {
    fontSize: 18,
    color: '#7ED5F9', // Light Blue
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  
  // Section Styles
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D2853', // Dark Blue
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // Quick Stats Styles
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0D2853',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0D2853', // Dark Blue
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 16,
    color: '#7ED5F9', // Light Blue
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Detailed Stats Grid
  detailedStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#0D2853',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  statTitle: {
    fontSize: 16,
    color: '#7ED5F9', // Light Blue
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0D2853', // Dark Blue
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 14,
    color: '#1A1A1A', // Soft Black
    fontWeight: '400',
  },
  // Achievements Styles
  achievementsGrid: {
    gap: 16,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#7ED5F9', // Light Blue
    opacity: 0.6,
  },
  achievementUnlocked: {
    opacity: 1,
    borderColor: '#0D2853', // Dark Blue
    shadowColor: '#0D2853',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  achievementIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D2853', // Dark Blue
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementDescription: {
    fontSize: 16,
    color: '#1A1A1A', // Soft Black
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  achievementProgress: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#FAFAFA', // Soft White
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7ED5F9', // Light Blue
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#0D2853', // Dark Blue
    textAlign: 'center',
    fontWeight: '600',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0D2853', // Dark Blue
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  unlockedText: {
    fontSize: 14,
    color: '#7ED5F9', // Light Blue
    fontWeight: 'bold',
  },
  // View Selector Styles
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#0D2853',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  viewTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  activeViewTab: {
    backgroundColor: '#7ED5F9', // Light Blue
  },
  viewTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7ED5F9', // Light Blue
  },
  activeViewTabText: {
    color: '#0D2853', // Dark Blue
  },
  // Calendar Styles
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  monthNavButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0D2853',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D2853', // Dark Blue
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7ED5F9', // Light Blue
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100/7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    marginBottom: 4,
  },
  calendarDayToday: {
    backgroundColor: '#7ED5F9', // Light Blue
    borderRadius: 12,
  },
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  calendarDayNumber: {
    fontSize: 18,
    color: '#0D2853', // Dark Blue
    fontWeight: '600',
  },
  calendarDayNumberToday: {
    color: '#FAFAFA', // Soft White
    fontWeight: 'bold',
  },
  calendarDayNumberOtherMonth: {
    color: '#1A1A1A', // Soft Black
  },
  workoutIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#0D2853', // Dark Blue
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutCount: {
    fontSize: 10,
    color: '#FAFAFA', // Soft White
    fontWeight: 'bold',
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#7ED5F9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0D2853', // Dark Blue
  },
  legendDotToday: {
    backgroundColor: '#7ED5F9', // Light Blue
  },
  legendText: {
    fontSize: 14,
    color: '#1A1A1A', // Soft Black
    fontWeight: '500',
  },
  // Journal Styles
  journalList: {
    gap: 16,
  },
  journalItem: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#7ED5F9', // Light Blue
    shadowColor: '#0D2853',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  journalDate: {
    fontSize: 16,
    color: '#0D2853', // Dark Blue
    fontWeight: 'bold',
  },
  sentimentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FAFAFA', // Soft White
  },
  sentimentPositive: {
    backgroundColor: '#7ED5F9', // Light Blue
  },
  sentimentNegative: {
    backgroundColor: '#1A1A1A', // Soft Black
  },
  sentimentNeutral: {
    backgroundColor: '#FAFAFA', // Soft White
  },
  sentimentText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0D2853', // Dark Blue
    textTransform: 'capitalize',
  },
  journalPreview: {
    fontSize: 16,
    color: '#1A1A1A', // Soft Black
    lineHeight: 24,
  },
  viewAllButton: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#7ED5F9', // Light Blue
    borderStyle: 'dashed',
  },
  viewAllText: {
    fontSize: 16,
    color: '#0D2853', // Dark Blue
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 18,
    color: '#7ED5F9', // Light Blue
    textAlign: 'center',
    fontWeight: '500',
    paddingVertical: 32,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Soft White
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0D2853', // Dark Blue
    borderBottomWidth: 2,
    borderBottomColor: '#7ED5F9', // Light Blue
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FAFAFA', // Soft White
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#7ED5F9', // Light Blue
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#0D2853', // Dark Blue
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
    gap: 20,
  },
  modalJournalItem: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#7ED5F9', // Light Blue
    shadowColor: '#0D2853',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  workoutTitle: {
    fontSize: 14,
    color: '#7ED5F9', // Light Blue
    marginBottom: 12,
    fontWeight: 'bold',
  },
  journalText: {
    fontSize: 16,
    color: '#1A1A1A', // Soft Black
    lineHeight: 24,
  },
})
