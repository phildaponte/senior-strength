import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { JournalEntry } from '../types'

/**
 * Custom hook for managing journal entries
 * Handles fetching, filtering, and pagination of workout journal entries
 */
export const useJournalEntries = () => {
  // Journal entries state
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([])
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filter and pagination state
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [limit, setLimit] = useState(50)

  /**
   * Fetches journal entries from the database
   * Includes workout title and sentiment information
   */
  const fetchJournalEntries = async (userId?: string) => {
    try {
      setLoading(true)
      setError(null)

      // Get current user if not provided
      let currentUserId = userId
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('User not authenticated')
        }
        currentUserId = user.id
      }

      // Fetch journal entries with workout information
      const { data: journalData, error: fetchError } = await supabase
        .from('workout_logs')
        .select(`
          id,
          date,
          journal_text,
          sentiment_tag,
          workout_id,
          workouts!inner(title)
        `)
        .eq('user_id', currentUserId)
        .not('journal_text', 'is', null) // Only entries with journal text
        .order('date', { ascending: false }) // Most recent first
        .limit(limit)

      if (fetchError) {
        throw fetchError
      }

      if (journalData) {
        // Transform database entries to our JournalEntry type
        const entries: JournalEntry[] = journalData.map((entry: any) => ({
          id: entry.id,
          date: entry.date,
          journal_text: entry.journal_text,
          sentiment_tag: entry.sentiment_tag,
          workout_title: entry.workouts?.title || 'Unknown Workout',
        }))

        setJournalEntries(entries)
        applyFilters(entries, sentimentFilter, searchQuery)
      }
    } catch (error) {
      const errorMessage = 'Failed to fetch journal entries'
      setError(errorMessage)
      console.error('Failed to fetch journal entries:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Applies sentiment and search filters to journal entries
   * Updates the filteredEntries state with matching entries
   */
  const applyFilters = (entries: JournalEntry[], sentiment: typeof sentimentFilter, query: string) => {
    let filtered = [...entries]

    // Apply sentiment filter
    if (sentiment !== 'all') {
      filtered = filtered.filter(entry => entry.sentiment_tag === sentiment)
    }

    // Apply search query filter (searches both journal text and workout title)
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase()
      filtered = filtered.filter(entry => 
        entry.journal_text.toLowerCase().includes(lowercaseQuery) ||
        (entry.workout_title && entry.workout_title.toLowerCase().includes(lowercaseQuery))
      )
    }

    setFilteredEntries(filtered)
  }

  /**
   * Updates the sentiment filter and reapplies all filters
   */
  const updateSentimentFilter = (sentiment: typeof sentimentFilter) => {
    setSentimentFilter(sentiment)
    applyFilters(journalEntries, sentiment, searchQuery)
  }

  /**
   * Updates the search query and reapplies all filters
   */
  const updateSearchQuery = (query: string) => {
    setSearchQuery(query)
    applyFilters(journalEntries, sentimentFilter, query)
  }

  /**
   * Loads more journal entries (pagination)
   */
  const loadMoreEntries = () => {
    setLimit(prevLimit => prevLimit + 25)
  }

  /**
   * Refreshes journal entries from the database
   */
  const refreshEntries = () => {
    fetchJournalEntries()
  }

  /**
   * Gets entries grouped by sentiment for analytics
   */
  const getEntriesBySentiment = () => {
    const positive = journalEntries.filter(entry => entry.sentiment_tag === 'positive')
    const neutral = journalEntries.filter(entry => entry.sentiment_tag === 'neutral')
    const negative = journalEntries.filter(entry => entry.sentiment_tag === 'negative')

    return {
      positive: positive.length,
      neutral: neutral.length,
      negative: negative.length,
      total: journalEntries.length,
    }
  }

  /**
   * Gets the most recent journal entry
   */
  const getLatestEntry = (): JournalEntry | null => {
    return journalEntries.length > 0 ? journalEntries[0] : null
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchJournalEntries()
  }, [])

  // Refetch when limit changes (for pagination)
  useEffect(() => {
    if (limit > 50) { // Only refetch if we're paginating beyond initial load
      fetchJournalEntries()
    }
  }, [limit])

  // Reapply filters when entries change
  useEffect(() => {
    applyFilters(journalEntries, sentimentFilter, searchQuery)
  }, [journalEntries, sentimentFilter, searchQuery])

  return {
    // Data
    journalEntries,
    filteredEntries,
    
    // State
    loading,
    error,
    
    // Filters
    sentimentFilter,
    searchQuery,
    
    // Actions
    fetchJournalEntries,
    refreshEntries,
    updateSentimentFilter,
    updateSearchQuery,
    loadMoreEntries,
    
    // Analytics
    getEntriesBySentiment,
    getLatestEntry,
    
    // Computed
    hasMore: journalEntries.length >= limit,
    totalEntries: journalEntries.length,
    filteredCount: filteredEntries.length,
  }
}
