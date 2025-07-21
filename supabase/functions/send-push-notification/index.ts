// @ts-ignore - Deno runtime imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore - Deno runtime imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushNotificationRequest {
  userId?: string
  title: string
  body: string
  data?: Record<string, any>
  tokens?: string[] // For batch sending
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
    const requestBody: PushNotificationRequest = await req.json()

    let pushTokens: string[] = []

    // Get push tokens based on request type
    if (requestBody.tokens) {
      // Direct token list provided
      pushTokens = requestBody.tokens
    } else if (requestBody.userId) {
      // Get token for specific user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('push_token')
        .eq('id', requestBody.userId)
        .single()

      if (userError) {
        throw new Error(`Failed to fetch user: ${userError.message}`)
      }

      if (user?.push_token) {
        pushTokens = [user.push_token]
      }
    } else {
      throw new Error('Either userId or tokens must be provided')
    }

    if (pushTokens.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No push tokens found'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Send push notifications via Expo Push API
    const results = await sendExpoPushNotifications(pushTokens, {
      title: requestBody.title,
      body: requestBody.body,
      data: requestBody.data || {}
    })

    return new Response(
      JSON.stringify({
        success: true,
        sent: results.success.length,
        failed: results.failed.length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Push notification function error:', error)
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

async function sendExpoPushNotifications(
  tokens: string[],
  notification: {
    title: string
    body: string
    data: Record<string, any>
  }
) {
  const messages = tokens.map(token => ({
    to: token,
    title: notification.title,
    body: notification.body,
    data: notification.data,
    sound: 'default',
    badge: 1,
  }))

  const success: string[] = []
  const failed: Array<{ token: string; error: string }> = []

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    if (!response.ok) {
      throw new Error(`Expo Push API error: ${response.status}`)
    }

    const results = await response.json()
    
    // Process results
    results.data?.forEach((result: any, index: number) => {
      const token = tokens[index]
      
      if (result.status === 'ok') {
        success.push(token)
      } else {
        failed.push({
          token,
          error: result.message || result.details?.error || 'Unknown error'
        })
      }
    })

    console.log(`Push notifications sent: ${success.length} success, ${failed.length} failed`)

  } catch (error) {
    console.error('Failed to send push notifications:', error)
    
    // Mark all as failed if the request itself failed
    tokens.forEach(token => {
      failed.push({
        token,
        error: error.message
      })
    })
  }

  return { success, failed }
}
