import React, { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { JournalEntry } from '../types'
import { COLORS as colors, TYPOGRAPHY as typography, SPACING as spacing } from '../styles/sharedStyles'

interface JournalViewProps {
  journalEntries: JournalEntry[]
  filteredEntries: JournalEntry[]
  sentimentFilter: 'all' | 'positive' | 'neutral' | 'negative'
  searchQuery: string
  loading: boolean
  onUpdateSentimentFilter: (sentiment: 'all' | 'positive' | 'neutral' | 'negative') => void
  onUpdateSearchQuery: (query: string) => void
  onShowModal: (entry: JournalEntry) => void
  onLoadMore?: () => void
  hasMore?: boolean
}

/**
 * JournalView Component
 * 
 * Displays journal entries with filtering, search, and sentiment analysis.
 * Features senior-friendly design with large text and clear visual indicators.
 */
const JournalView: React.FC<JournalViewProps> = ({
  journalEntries,
  filteredEntries,
  sentimentFilter,
  searchQuery,
  loading,
  onUpdateSentimentFilter,
  onUpdateSearchQuery,
  onShowModal,
  onLoadMore,
  hasMore = false
}) => {
  const [showFilters, setShowFilters] = useState(false)

  // Get sentiment statistics for display
  const sentimentStats = {
    positive: journalEntries.filter(entry => entry.sentiment_tag === 'positive').length,
    neutral: journalEntries.filter(entry => entry.sentiment_tag === 'neutral').length,
    negative: journalEntries.filter(entry => entry.sentiment_tag === 'negative').length,
    total: journalEntries.length,
  }

  const renderJournalEntry = ({ item }: { item: JournalEntry }) => (
    <JournalEntryCard
      entry={item}
      onPress={() => onShowModal(item)}
    />
  )

  const renderHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search journal entries..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={onUpdateSearchQuery}
          accessibilityLabel="Search journal entries"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onUpdateSearchQuery('')}
            style={styles.clearButton}
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Toggle */}
      <TouchableOpacity
        style={styles.filterToggle}
        onPress={() => setShowFilters(!showFilters)}
        accessibilityLabel="Toggle filters"
      >
        <Ionicons name="filter" size={20} color={colors.primary} />
        <Text style={styles.filterToggleText}>Filters</Text>
        <Ionicons 
          name={showFilters ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={colors.primary} 
        />
      </TouchableOpacity>

      {/* Sentiment Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Filter by Mood</Text>
          <View style={styles.sentimentFilters}>
            <SentimentFilterButton
              sentiment="all"
              label="All"
              count={sentimentStats.total}
              isActive={sentimentFilter === 'all'}
              onPress={() => onUpdateSentimentFilter('all')}
            />
            <SentimentFilterButton
              sentiment="positive"
              label="😊 Positive"
              count={sentimentStats.positive}
              isActive={sentimentFilter === 'positive'}
              onPress={() => onUpdateSentimentFilter('positive')}
            />
            <SentimentFilterButton
              sentiment="neutral"
              label="😐 Neutral"
              count={sentimentStats.neutral}
              isActive={sentimentFilter === 'neutral'}
              onPress={() => onUpdateSentimentFilter('neutral')}
            />
            <SentimentFilterButton
              sentiment="negative"
              label="😔 Negative"
              count={sentimentStats.negative}
              isActive={sentimentFilter === 'negative'}
              onPress={() => onUpdateSentimentFilter('negative')}
            />
          </View>
        </View>
      )}

      {/* Results Summary */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredEntries.length} of {journalEntries.length} entries
          {searchQuery && ` matching "${searchQuery}"`}
          {sentimentFilter !== 'all' && ` with ${sentimentFilter} mood`}
        </Text>
      </View>
    </View>
  )

  const renderFooter = () => {
    if (!hasMore) return null
    
    return (
      <TouchableOpacity style={styles.loadMoreButton} onPress={onLoadMore}>
        <Text style={styles.loadMoreText}>Load More Entries</Text>
      </TouchableOpacity>
    )
  }

  if (loading && journalEntries.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading journal entries...</Text>
      </View>
    )
  }

  if (journalEntries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="journal" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>No Journal Entries Yet</Text>
        <Text style={styles.emptyText}>
          Start writing about your workouts to track your progress and mood!
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredEntries}
        renderItem={renderJournalEntry}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  )
}

/**
 * Individual Journal Entry Card Component
 */
interface JournalEntryCardProps {
  entry: JournalEntry
  onPress: () => void
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry, onPress }) => {
  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊'
      case 'negative': return '😔'
      default: return '😐'
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#4CAF50'
      case 'negative': return '#F44336'
      default: return '#9E9E9E'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <TouchableOpacity style={styles.entryCard} onPress={onPress}>
      <View style={styles.entryHeader}>
        <View style={styles.entryMeta}>
          <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
          <Text style={styles.entryWorkout}>{entry.workout_title}</Text>
        </View>
        <View style={[styles.sentimentBadge, { backgroundColor: getSentimentColor(entry.sentiment_tag) }]}>
          <Text style={styles.sentimentEmoji}>{getSentimentEmoji(entry.sentiment_tag)}</Text>
        </View>
      </View>
      
      <Text style={styles.entryText} numberOfLines={3}>
        {entry.journal_text}
      </Text>
      
      <View style={styles.entryFooter}>
        <Text style={styles.readMoreText}>Tap to read more</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  )
}

/**
 * Sentiment Filter Button Component
 */
interface SentimentFilterButtonProps {
  sentiment: string
  label: string
  count: number
  isActive: boolean
  onPress: () => void
}

const SentimentFilterButton: React.FC<SentimentFilterButtonProps> = ({
  sentiment,
  label,
  count,
  isActive,
  onPress
}) => (
  <TouchableOpacity
    style={[styles.sentimentButton, isActive && styles.activeSentimentButton]}
    onPress={onPress}
    accessibilityLabel={`Filter by ${label}, ${count} entries`}
  >
    <Text style={[styles.sentimentButtonText, isActive && styles.activeSentimentButtonText]}>
      {label}
    </Text>
    <Text style={[styles.sentimentCount, isActive && styles.activeSentimentCount]}>
      {count}
    </Text>
  </TouchableOpacity>
)

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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    padding: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    minHeight: 50,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.md,
  },
  filterToggleText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
    flex: 1,
  },
  filtersContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.md,
  },
  filtersTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sentimentFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sentimentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeSentimentButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sentimentButtonText: {
    ...typography.caption,
    color: colors.textPrimary,
    marginRight: spacing.xs,
  },
  activeSentimentButtonText: {
    color: colors.background,
  },
  sentimentCount: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  activeSentimentCount: {
    color: colors.background,
  },
  resultsContainer: {
    marginBottom: spacing.md,
  },
  resultsText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  entryCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  entryMeta: {
    flex: 1,
  },
  entryDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  entryWorkout: {
    ...typography.subtitle,
    color: colors.primary,
    fontWeight: '600',
  },
  sentimentBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sentimentEmoji: {
    fontSize: 16,
  },
  entryText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readMoreText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  loadMoreButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  loadMoreText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
})

export default JournalView
