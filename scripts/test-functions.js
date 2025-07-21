#!/usr/bin/env node

/**
 * Test script for Senior Strength Supabase Edge Functions
 * Run with: node scripts/test-functions.js
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

function makeRequest(url, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testWeeklyReport() {
  console.log('\n🧪 Testing Weekly Report Function...');
  try {
    const url = `${SUPABASE_URL}/functions/v1/weekly-report`;
    const result = await makeRequest(url, {});
    
    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 200) {
      console.log('✅ Weekly Report function is working!');
    } else {
      console.log('❌ Weekly Report function failed');
    }
  } catch (error) {
    console.log('❌ Error testing Weekly Report:', error.message);
  }
}

async function testPushNotification() {
  console.log('\n🧪 Testing Push Notification Function...');
  try {
    const url = `${SUPABASE_URL}/functions/v1/send-push-notification`;
    const testData = {
      title: 'Test Notification',
      body: 'This is a test notification from the Senior Strength app',
      tokens: ['ExponentPushToken[test-token]'] // This will fail but test the function
    };
    
    const result = await makeRequest(url, testData);
    
    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 200 || result.status === 400) {
      console.log('✅ Push Notification function is working!');
      console.log('ℹ️  400 status is expected with test token');
    } else {
      console.log('❌ Push Notification function failed');
    }
  } catch (error) {
    console.log('❌ Error testing Push Notification:', error.message);
  }
}

async function testInactivityCheck() {
  console.log('\n🧪 Testing Inactivity Check Function...');
  try {
    const url = `${SUPABASE_URL}/functions/v1/check-inactivity`;
    const result = await makeRequest(url, {});
    
    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 200) {
      console.log('✅ Inactivity Check function is working!');
    } else {
      console.log('❌ Inactivity Check function failed');
    }
  } catch (error) {
    console.log('❌ Error testing Inactivity Check:', error.message);
  }
}

async function main() {
  console.log('🚀 Senior Strength - Edge Functions Test Suite\n');
  
  // Get configuration
  SUPABASE_URL = await new Promise(resolve => {
    rl.question('Enter your Supabase URL (https://xxx.supabase.co): ', resolve);
  });
  
  SUPABASE_ANON_KEY = await new Promise(resolve => {
    rl.question('Enter your Supabase Anon Key: ', resolve);
  });
  
  console.log('\nStarting tests...\n');
  
  // Run tests
  await testWeeklyReport();
  await testPushNotification();
  await testInactivityCheck();
  
  console.log('\n✨ Test suite completed!');
  console.log('\nNext steps:');
  console.log('1. Check your Supabase Edge Functions logs for detailed output');
  console.log('2. Test the app features using the buttons in the Profile screen');
  console.log('3. Set up cron jobs for automated weekly reports');
  
  rl.close();
}

if (require.main === module) {
  main().catch(console.error);
}
