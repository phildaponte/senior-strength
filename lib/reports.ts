import { supabase } from './supabase'

/**
 * Trigger the weekly report generation for all users
 * This would typically be called by a cron job or scheduled task
 */
export async function triggerWeeklyReports(): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const { data, error } = await supabase.functions.invoke('weekly-report', {
      body: {}
    })

    if (error) {
      console.error('Failed to trigger weekly reports:', error)
      return {
        success: false,
        message: `Failed to trigger weekly reports: ${error.message}`
      }
    }

    console.log('Weekly reports triggered successfully:', data)
    return {
      success: true,
      message: `Weekly reports processed for ${data?.processed || 0} users`,
      data
    }
  } catch (error) {
    console.error('Error triggering weekly reports:', error)
    return {
      success: false,
      message: `Error triggering weekly reports: ${error}`
    }
  }
}

/**
 * Trigger inactivity check for all users
 * This would typically be called by a cron job or scheduled task
 */
export async function triggerInactivityCheck(): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const { data, error } = await supabase.functions.invoke('check-inactivity', {
      body: {}
    })

    if (error) {
      console.error('Failed to trigger inactivity check:', error)
      return {
        success: false,
        message: `Failed to trigger inactivity check: ${error.message}`
      }
    }

    console.log('Inactivity check triggered successfully:', data)
    return {
      success: true,
      message: `Inactivity check processed for ${data?.processed || 0} users`,
      data
    }
  } catch (error) {
    console.error('Error triggering inactivity check:', error)
    return {
      success: false,
      message: `Error triggering inactivity check: ${error}`
    }
  }
}

/**
 * Get user's weekly stats for display purposes
 */
export async function getUserWeeklyStats(userId?: string): Promise<{
  totalWorkouts: number
  totalMinutes: number
  activeDays: number
  currentStreak: number
  sentimentSummary: {
    positive: number
    neutral: number
    negative: number
  }
} | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = userId || user?.id

    if (!targetUserId) {
      console.error('No user ID provided')
      return null
    }

    // Calculate date range for the past week
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    // Get user data
    const { data: userData } = await supabase
      .from('users')
      .select('current_streak')
      .eq('id', targetUserId)
      .single()

    // Fetch workout logs for the past week
    const { data: workoutLogs } = await supabase
      .from('workout_logs')
      .select('date, duration_seconds, sentiment_tag')
      .eq('user_id', targetUserId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())

    if (!workoutLogs) {
      return null
    }

    // Calculate stats
    const totalWorkouts = workoutLogs.length
    const totalMinutes = Math.round(
      workoutLogs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0) / 60
    )

    // Get unique workout days
    const workoutDays = [...new Set(
      workoutLogs.map(log => log.date.split('T')[0])
    )]
    const activeDays = workoutDays.length

    // Calculate sentiment summary
    const sentimentSummary = {
      positive: workoutLogs.filter(log => log.sentiment_tag === 'positive').length,
      neutral: workoutLogs.filter(log => log.sentiment_tag === 'neutral').length,
      negative: workoutLogs.filter(log => log.sentiment_tag === 'negative').length,
    }

    return {
      totalWorkouts,
      totalMinutes,
      activeDays,
      currentStreak: userData?.current_streak || 0,
      sentimentSummary
    }

  } catch (error) {
    console.error('Error fetching weekly stats:', error)
    return null
  }
}

/**
 * Send a test weekly report for the current user
 * Useful for testing the email functionality
 */
export async function sendTestWeeklyReport(): Promise<{ success: boolean; message: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        success: false,
        message: 'No authenticated user found'
      }
    }

    // Get user's trusted contact email
    const { data: userData } = await supabase
      .from('users')
      .select('trusted_contact_email')
      .eq('id', user.id)
      .single()

    if (!userData?.trusted_contact_email) {
      return {
        success: false,
        message: 'No trusted contact email set. Please update your profile.'
      }
    }

    const { data, error } = await supabase.functions.invoke('weekly-report', {
      body: {
        testMode: true,
        userId: user.id
      }
    })

    if (error) {
      return {
        success: false,
        message: `Failed to send test report: ${error.message}`
      }
    }

    return {
      success: true,
      message: `Test weekly report sent to ${userData.trusted_contact_email}`
    }

  } catch (error) {
    console.error('Error sending test weekly report:', error)
    return {
      success: false,
      message: `Error sending test report: ${error}`
    }
  }
}
