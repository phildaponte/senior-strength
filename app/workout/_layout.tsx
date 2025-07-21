import { Stack } from 'expo-router'

export default function WorkoutLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen 
        name="complete" 
        options={{ 
          gestureEnabled: false, // Prevent swipe back
        }} 
      />
    </Stack>
  )
}
