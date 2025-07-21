import OpenAI from 'openai'

// Initialize OpenAI client conditionally
let openai: OpenAI | null = null
if (process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
  try {
    openai = new OpenAI({
      apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    })
  } catch (error) {
    console.warn('Failed to initialize OpenAI client:', error)
  }
}

export type SentimentResult = 'positive' | 'neutral' | 'negative'

/**
 * Analyzes the sentiment of journal text using OpenAI
 * Falls back to keyword-based analysis if OpenAI is unavailable
 */
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  if (!text || text.trim().length === 0) {
    return 'neutral'
  }

  try {
    // Try OpenAI sentiment analysis first
    if (openai && process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a sentiment analysis assistant. Analyze the sentiment of workout journal entries and respond with only one word: "positive", "negative", or "neutral". Focus on the overall emotional tone and physical feeling expressed.'
          },
          {
            role: 'user',
            content: `Analyze the sentiment of this workout journal entry: "${text}"`
          }
        ],
        max_tokens: 10,
        temperature: 0,
      })

      const sentiment = response.choices[0]?.message?.content?.toLowerCase().trim()
      
      if (sentiment === 'positive' || sentiment === 'negative' || sentiment === 'neutral') {
        return sentiment as SentimentResult
      }
    }
  } catch (error) {
    console.warn('OpenAI sentiment analysis failed, falling back to keyword analysis:', error)
  }

  // Fallback to keyword-based sentiment analysis
  return keywordBasedSentiment(text)
}

/**
 * Simple keyword-based sentiment analysis as fallback
 */
function keywordBasedSentiment(text: string): SentimentResult {
  const lowerText = text.toLowerCase()
  
  // Positive indicators for fitness/workout context
  const positiveWords = [
    'great', 'good', 'amazing', 'excellent', 'love', 'enjoyed', 'happy', 
    'energized', 'strong', 'accomplished', 'proud', 'confident', 'motivated',
    'refreshed', 'invigorated', 'powerful', 'successful', 'fantastic',
    'wonderful', 'awesome', 'perfect', 'smooth', 'easy', 'comfortable',
    'relaxed', 'calm', 'peaceful', 'satisfied', 'pleased'
  ]
  
  // Negative indicators for fitness/workout context
  const negativeWords = [
    'tired', 'exhausted', 'difficult', 'hard', 'struggled', 'pain', 'hurt', 
    'bad', 'awful', 'hate', 'terrible', 'horrible', 'painful', 'sore',
    'uncomfortable', 'challenging', 'tough', 'weak', 'frustrated', 'annoyed',
    'disappointed', 'discouraged', 'overwhelmed', 'stressed', 'anxious'
  ]
  
  // Neutral indicators
  const neutralWords = [
    'okay', 'fine', 'normal', 'average', 'usual', 'typical', 'standard',
    'regular', 'moderate', 'decent', 'alright'
  ]
  
  // Count word occurrences
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length
  const neutralCount = neutralWords.filter(word => lowerText.includes(word)).length
  
  // Determine sentiment based on word counts
  if (positiveCount > negativeCount && positiveCount > neutralCount) {
    return 'positive'
  } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
    return 'negative'
  } else {
    return 'neutral'
  }
}

/**
 * Get a user-friendly description of the sentiment
 */
export function getSentimentDescription(sentiment: SentimentResult): string {
  switch (sentiment) {
    case 'positive':
      return 'You seem to be feeling great about your workout! 😊'
    case 'negative':
      return 'It sounds like the workout was challenging. Keep pushing forward! 💪'
    case 'neutral':
      return 'Thanks for sharing your workout experience. 👍'
    default:
      return 'Thanks for your feedback!'
  }
}

/**
 * Get emoji representation of sentiment
 */
export function getSentimentEmoji(sentiment: SentimentResult): string {
  switch (sentiment) {
    case 'positive':
      return '😊'
    case 'negative':
      return '😔'
    case 'neutral':
      return '😐'
    default:
      return '🤔'
  }
}
