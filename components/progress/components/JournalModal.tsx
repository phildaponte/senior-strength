import React from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { JournalEntry } from '../types'
import { COLORS as colors, TYPOGRAPHY as typography, SPACING as spacing } from '../styles/sharedStyles'

interface JournalModalProps {
  visible: boolean
  entry: JournalEntry | null
  onClose: () => void
}

/**
 * JournalModal Component
 * 
 * Full-screen modal for displaying complete journal entries.
 * Features senior-friendly design with large text and clear navigation.
 */
const JournalModal: React.FC<JournalModalProps> = ({
  visible,
  entry,
  onClose
}) => {
  if (!entry) return null

  // Helper functions
  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊'
      case 'negative': return '😔'
      default: return '😐'
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return colors.success
      case 'negative': return colors.error
      default: return colors.neutral
    }
  }

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'Positive'
      case 'negative': return 'Negative'
      default: return 'Neutral'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Journal Entry</Text>
            <Text style={styles.headerSubtitle}>
              {formatDate(entry.date)} at {formatTime(entry.date)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close journal entry"
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Workout Information */}
          <View style={styles.workoutSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="fitness" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Workout</Text>
            </View>
            <Text style={styles.workoutTitle}>{entry.workout_title}</Text>
          </View>

          {/* Mood Section */}
          <View style={styles.moodSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="happy" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Mood</Text>
            </View>
            <View style={styles.moodContainer}>
              <View style={[styles.moodBadge, { backgroundColor: getSentimentColor(entry.sentiment_tag) }]}>
                <Text style={styles.moodEmoji}>{getSentimentEmoji(entry.sentiment_tag)}</Text>
                <Text style={styles.moodLabel}>{getSentimentLabel(entry.sentiment_tag)}</Text>
              </View>
            </View>
          </View>

          {/* Journal Text */}
          <View style={styles.journalSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Journal Entry</Text>
            </View>
            <View style={styles.journalTextContainer}>
              <Text style={styles.journalText}>{entry.journal_text}</Text>
            </View>
          </View>

          {/* Metadata */}
          <View style={styles.metadataSection}>
            <View style={styles.metadataItem}>
              <Ionicons name="calendar" size={16} color={colors.textSecondary} />
              <Text style={styles.metadataText}>
                Written on {formatDate(entry.date)}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Ionicons name="time" size={16} color={colors.textSecondary} />
              <Text style={styles.metadataText}>
                At {formatTime(entry.date)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={onClose}
          >
            <Text style={styles.doneButtonText}>Done Reading</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 14,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  workoutSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    fontSize: 18,
    fontWeight: '600',
  },
  workoutTitle: {
    ...typography.title,
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  moodSection: {
    marginBottom: spacing.xl,
  },
  moodContainer: {
    alignItems: 'flex-start',
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
  },
  moodEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  moodLabel: {
    ...typography.body,
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  journalSection: {
    marginBottom: spacing.xl,
  },
  journalTextContainer: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  journalText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
  },
  metadataSection: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.md,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metadataText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    fontSize: 14,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 48, // Adequate touch target
  },
  doneButtonText: {
    ...typography.body,
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default JournalModal
