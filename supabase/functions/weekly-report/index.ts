// @ts-ignore - Deno runtime imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore - Deno runtime imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WeeklyStats {
  totalWorkouts: number
  totalMinutes: number
  activeDays: number
  currentStreak: number
  sentimentSummary: {
    positive: number
    neutral: number
    negative: number
  }
  workoutDays: string[]
}

interface JournalEntry {
  date: string
  journal_text: string
  sentiment_tag: string
  workout_title: string
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    // @ts-ignore - Deno global
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    // @ts-ignore - Deno global
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    // @ts-ignore - Deno global
    const postmarkServerToken = Deno.env.get('POSTMARK_SERVER_TOKEN')!

    if (!supabaseUrl || !supabaseServiceKey || !postmarkServerToken) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all users with trusted contact emails
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email, trusted_contact_email, current_streak')
      .not('trusted_contact_email', 'is', null)

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    console.log(`Processing weekly reports for ${users?.length || 0} users`)

    const results = []

    for (const user of users || []) {
      try {
        // Calculate date range for the past week
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)

        // Fetch workout logs for the past week
        const { data: workoutLogs, error: logsError } = await supabase
          .from('workout_logs')
          .select(`
            date,
            duration_seconds,
            journal_text,
            sentiment_tag,
            workouts(title)
          `)
          .eq('user_id', user.id)
          .gte('date', startDate.toISOString())
          .lte('date', endDate.toISOString())
          .order('date', { ascending: true })

        if (logsError) {
          console.error(`Failed to fetch logs for user ${user.id}:`, logsError)
          continue
        }

        // Calculate weekly stats
        const stats = calculateWeeklyStats(workoutLogs || [], user.current_streak)
        
        // Get journal entries with sentiment
        const journalEntries: JournalEntry[] = (workoutLogs || [])
          .filter((log: any) => log.journal_text)
          .map((log: any) => ({
            date: log.date,
            journal_text: log.journal_text,
            sentiment_tag: log.sentiment_tag,
            workout_title: log.workouts?.title || 'Unknown Workout'
          }))

        // Generate and send email
        const emailSent = await sendWeeklyReportEmail(
          user,
          stats,
          journalEntries,
          postmarkServerToken
        )

        results.push({
          userId: user.id,
          email: user.trusted_contact_email,
          success: emailSent,
          stats
        })

      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError)
        results.push({
          userId: user.id,
          email: user.trusted_contact_email,
          success: false,
          error: userError instanceof Error ? userError.message : String(userError)
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Weekly report function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function calculateWeeklyStats(workoutLogs: any[], currentStreak: number): WeeklyStats {
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
    currentStreak,
    sentimentSummary,
    workoutDays
  }
}

async function sendWeeklyReportEmail(
  user: any,
  stats: WeeklyStats,
  journalEntries: JournalEntry[],
  postmarkToken: string
): Promise<boolean> {
  try {
    const emailHtml = generateEmailHtml(user, stats, journalEntries)
    
    const emailData = {
      From: 'reports@seniorstrength.app',
      To: user.trusted_contact_email,
      Subject: `Weekly Fitness Report for ${user.full_name || user.email}`,
      HtmlBody: emailHtml,
      TextBody: generateEmailText(user, stats, journalEntries),
      MessageStream: 'outbound'
    }

    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': postmarkToken
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Postmark API error:', errorData)
      return false
    }

    console.log(`Weekly report sent successfully to ${user.trusted_contact_email}`)
    return true

  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

function generateEmailHtml(user: any, stats: WeeklyStats, journalEntries: JournalEntry[]): string {
  const userName = user.full_name || user.email.split('@')[0]
  const weekRange = getWeekRange()
  
  // Generate calendar grid for the week
  const calendarHtml = generateCalendarGrid(stats.workoutDays)
  
  // Generate sentiment summary
  const sentimentHtml = generateSentimentSummary(stats.sentimentSummary)
  
  // Generate journal highlights
  const journalHtml = generateJournalHighlights(journalEntries)

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weekly Fitness Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea; }
        .stat-value { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 5px; }
        .stat-label { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .calendar { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e1e5e9; margin-bottom: 30px; }
        .calendar h3 { margin-top: 0; color: #333; }
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
        .calendar-day { padding: 10px; text-align: center; border-radius: 4px; font-size: 12px; }
        .calendar-day.active { background: #10b981; color: white; font-weight: bold; }
        .calendar-day.inactive { background: #f3f4f6; color: #9ca3af; }
        .sentiment { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e1e5e9; margin-bottom: 30px; }
        .sentiment h3 { margin-top: 0; color: #333; }
        .sentiment-bar { display: flex; height: 20px; border-radius: 10px; overflow: hidden; margin-bottom: 10px; }
        .sentiment-positive { background: #10b981; }
        .sentiment-neutral { background: #f59e0b; }
        .sentiment-negative { background: #ef4444; }
        .journal { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e1e5e9; }
        .journal h3 { margin-top: 0; color: #333; }
        .journal-entry { margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 6px; border-left: 3px solid #667eea; }
        .journal-date { font-size: 12px; color: #666; margin-bottom: 5px; }
        .journal-text { font-style: italic; }
        .footer { margin-top: 40px; padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #e1e5e9; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Weekly Fitness Report</h1>
        <p>${userName}'s Progress • ${weekRange}</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">${stats.totalWorkouts}</div>
            <div class="stat-label">Workouts</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.totalMinutes}</div>
            <div class="stat-label">Minutes</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.activeDays}</div>
            <div class="stat-label">Active Days</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.currentStreak}</div>
            <div class="stat-label">Day Streak</div>
        </div>
    </div>

    ${calendarHtml}
    ${sentimentHtml}
    ${journalHtml}

    <div class="footer">
        <p>This report was automatically generated by Senior Strength.<br>
        Keep up the great work, ${userName}! 💪</p>
    </div>
</body>
</html>`
}

function generateEmailText(user: any, stats: WeeklyStats, journalEntries: JournalEntry[]): string {
  const userName = user.full_name || user.email.split('@')[0]
  const weekRange = getWeekRange()
  
  let text = `WEEKLY FITNESS REPORT\n${userName}'s Progress • ${weekRange}\n\n`
  text += `STATS:\n`
  text += `• Workouts: ${stats.totalWorkouts}\n`
  text += `• Minutes: ${stats.totalMinutes}\n`
  text += `• Active Days: ${stats.activeDays}\n`
  text += `• Current Streak: ${stats.currentStreak} days\n\n`
  
  text += `MOOD SUMMARY:\n`
  text += `• Positive: ${stats.sentimentSummary.positive}\n`
  text += `• Neutral: ${stats.sentimentSummary.neutral}\n`
  text += `• Negative: ${stats.sentimentSummary.negative}\n\n`
  
  if (journalEntries.length > 0) {
    text += `RECENT JOURNAL ENTRIES:\n`
    journalEntries.slice(0, 3).forEach(entry => {
      text += `• ${new Date(entry.date).toLocaleDateString()}: "${entry.journal_text}"\n`
    })
  }
  
  text += `\nKeep up the great work, ${userName}! 💪`
  
  return text
}

function generateCalendarGrid(workoutDays: string[]): string {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 6) // Last 7 days
  
  let calendarHtml = '<div class="calendar"><h3>Activity This Week</h3><div class="calendar-grid">'
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const hasWorkout = workoutDays.includes(dateStr)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    
    calendarHtml += `
      <div class="calendar-day ${hasWorkout ? 'active' : 'inactive'}">
        ${dayName}<br>${date.getDate()}
      </div>`
  }
  
  calendarHtml += '</div></div>'
  return calendarHtml
}

function generateSentimentSummary(sentiment: { positive: number; neutral: number; negative: number }): string {
  const total = sentiment.positive + sentiment.neutral + sentiment.negative
  
  if (total === 0) {
    return '<div class="sentiment"><h3>Mood Summary</h3><p>No mood data available this week.</p></div>'
  }
  
  const positivePercent = Math.round((sentiment.positive / total) * 100)
  const neutralPercent = Math.round((sentiment.neutral / total) * 100)
  const negativePercent = Math.round((sentiment.negative / total) * 100)
  
  return `
    <div class="sentiment">
      <h3>Mood Summary</h3>
      <div class="sentiment-bar">
        <div class="sentiment-positive" style="width: ${positivePercent}%"></div>
        <div class="sentiment-neutral" style="width: ${neutralPercent}%"></div>
        <div class="sentiment-negative" style="width: ${negativePercent}%"></div>
      </div>
      <p>Positive: ${positivePercent}% • Neutral: ${neutralPercent}% • Negative: ${negativePercent}%</p>
    </div>`
}

function generateJournalHighlights(journalEntries: JournalEntry[]): string {
  if (journalEntries.length === 0) {
    return '<div class="journal"><h3>Journal Highlights</h3><p>No journal entries this week.</p></div>'
  }
  
  let journalHtml = '<div class="journal"><h3>Journal Highlights</h3>'
  
  journalEntries.slice(0, 3).forEach(entry => {
    journalHtml += `
      <div class="journal-entry">
        <div class="journal-date">${new Date(entry.date).toLocaleDateString()} • ${entry.workout_title}</div>
        <div class="journal-text">"${entry.journal_text}"</div>
      </div>`
  })
  
  journalHtml += '</div>'
  return journalHtml
}

function getWeekRange(): string {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 6)
  
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
  
  return `${formatDate(weekStart)} - ${formatDate(today)}`
}
