// @ts-ignore - Deno runtime imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore - Deno runtime imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InactiveUser {
  id: string
  full_name: string
  email: string
  push_token: string
  last_workout_date: string
  current_streak: number
  days_inactive: number
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // @ts-ignore - Deno global
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    // @ts-ignore - Deno global
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Calculate date thresholds
    const now = new Date()
    const twoDaysAgo = new Date(now)
    twoDaysAgo.setDate(now.getDate() - 2)
    
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 7)

    console.log(`Checking for users inactive since ${twoDaysAgo.toISOString()}`)

    // Find users who haven't worked out in the last 48 hours
    const { data: inactiveUsers, error: queryError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        push_token,
        current_streak,
        (
          SELECT MAX(date) as last_workout_date
          FROM workout_logs
          WHERE workout_logs.user_id = users.id
        )
      `)
      .not('push_token', 'is', null) // Only users with push tokens
      .eq('is_subscribed', true) // Only subscribed users

    if (queryError) {
      throw new Error(`Failed to query inactive users: ${queryError.message}`)
    }

    if (!inactiveUsers || inactiveUsers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No users found',
          processed: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Filter users who are actually inactive
    const trulyInactiveUsers: InactiveUser[] = []
    
    for (const user of inactiveUsers) {
      const lastWorkoutDate = user.last_workout_date ? new Date(user.last_workout_date) : null
      
      // If no workouts ever, or last workout was more than 2 days ago
      if (!lastWorkoutDate || lastWorkoutDate < twoDaysAgo) {
        const daysInactive = lastWorkoutDate 
          ? Math.floor((now.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24))
          : 999 // Very high number for users who never worked out
        
        trulyInactiveUsers.push({
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          push_token: user.push_token,
          last_workout_date: user.last_workout_date || 'never',
          current_streak: user.current_streak,
          days_inactive: daysInactive
        })
      }
    }

    console.log(`Found ${trulyInactiveUsers.length} inactive users`)

    const results = []

    // Send notifications to inactive users
    for (const user of trulyInactiveUsers) {
      try {
        const notification = generateInactivityNotification(user)
        
        // Send push notification
        const success = await sendPushNotification(user.push_token, notification)
        
        results.push({
          userId: user.id,
          email: user.email,
          daysInactive: user.days_inactive,
          notificationSent: success,
          message: notification.body
        })

        // Small delay to avoid overwhelming the push service
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError)
        results.push({
          userId: user.id,
          email: user.email,
          daysInactive: user.days_inactive,
          notificationSent: false,
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
    console.error('Inactivity check function error:', error)
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

function generateInactivityNotification(user: InactiveUser): { title: string; body: string; data: Record<string, any> } {
  const userName = user.full_name || user.email.split('@')[0]
  
  // Different messages based on inactivity duration
  if (user.days_inactive >= 7) {
    return {
      title: "We miss you! 💪",
      body: `Hi ${userName}, it's been a week since your last workout. Ready to get back into your routine?`,
      data: {
        type: 'inactivity_reminder',
        days_inactive: user.days_inactive,
        action: 'open_workouts'
      }
    }
  } else if (user.days_inactive >= 3) {
    return {
      title: "Keep your streak alive! 🔥",
      body: `${userName}, you had a ${user.current_streak}-day streak going. Let's not break it now!`,
      data: {
        type: 'streak_reminder',
        days_inactive: user.days_inactive,
        previous_streak: user.current_streak,
        action: 'open_workouts'
      }
    }
  } else {
    return {
      title: "Time for your workout! 🏋️‍♀️",
      body: `${userName}, it's been ${user.days_inactive} days since your last workout. How about a quick session?`,
      data: {
        type: 'gentle_reminder',
        days_inactive: user.days_inactive,
        action: 'open_workouts'
      }
    }
  }
}

async function sendPushNotification(
  token: string,
  notification: { title: string; body: string; data: Record<string, any> }
): Promise<boolean> {
  try {
    const message = {
      to: token,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: 'default',
      badge: 1,
    }

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([message]),
    })

    if (!response.ok) {
      console.error(`Push notification failed: ${response.status}`)
      return false
    }

    const result = await response.json()
    
    if (result.data && result.data[0] && result.data[0].status === 'ok') {
      console.log(`Push notification sent successfully to ${token}`)
      return true
    } else {
      console.error('Push notification failed:', result.data?.[0])
      return false
    }

  } catch (error) {
    console.error('Error sending push notification:', error)
    return false
  }
}
