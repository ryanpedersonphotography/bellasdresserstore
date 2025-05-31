#!/usr/bin/env node

/**
 * Google Analytics 4 CLI Data Puller
 * Usage: node analytics-cli.js [command] [options]
 */

const https = require('https');

const PROPERTY_ID = '440956248'; // Your GA4 property ID (from G-T9D58CDT70)

// You'll need to get this from Google Analytics Data API
const API_KEY = process.env.GA4_API_KEY || 'YOUR_API_KEY_HERE';

// Helper function to make GA4 API calls
function makeGA4Request(endpoint, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'analyticsdata.googleapis.com',
      port: 443,
      path: `/v1beta/${endpoint}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

// Get real-time active users
async function getRealTimeUsers() {
  const data = {
    "dimensions": [
      {"name": "unifiedPageScreen"}
    ],
    "metrics": [
      {"name": "activeUsers"}
    ]
  };

  try {
    const response = await makeGA4Request(`properties/${PROPERTY_ID}:runRealtimeReport`, data);
    console.log('📊 Real-time Active Users:');
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('❌ Error fetching real-time data:', error.message);
    console.log('💡 You need to set up API authentication first');
  }
}

// Get page views for last 7 days
async function getPageViews() {
  const data = {
    "dateRanges": [
      {
        "startDate": "7daysAgo",
        "endDate": "today"
      }
    ],
    "dimensions": [
      {"name": "pagePath"},
      {"name": "pageTitle"}
    ],
    "metrics": [
      {"name": "screenPageViews"},
      {"name": "sessions"}
    ],
    "orderBys": [
      {
        "metric": {"metricName": "screenPageViews"},
        "desc": true
      }
    ]
  };

  try {
    const response = await makeGA4Request(`properties/${PROPERTY_ID}:runReport`, data);
    console.log('📈 Page Views (Last 7 Days):');
    
    if (response.rows) {
      response.rows.forEach(row => {
        const path = row.dimensionValues[0].value;
        const title = row.dimensionValues[1].value;
        const views = row.metricValues[0].value;
        const sessions = row.metricValues[1].value;
        console.log(`${path} - ${views} views, ${sessions} sessions`);
      });
    } else {
      console.log('No data available yet (GA4 needs 24-48 hours for reports)');
    }
  } catch (error) {
    console.error('❌ Error fetching page views:', error.message);
  }
}

// Main CLI handler
async function main() {
  const command = process.argv[2];

  console.log('🔍 Bella\'s Dresser Store Analytics\n');

  switch (command) {
    case 'realtime':
      await getRealTimeUsers();
      break;
    case 'pages':
      await getPageViews();
      break;
    case 'setup':
      console.log('🔧 Setup Instructions:');
      console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
      console.log('2. Create API Key or Service Account');
      console.log('3. Enable Google Analytics Data API');
      console.log('4. Set environment variable: export GA4_API_KEY="your_key"');
      console.log('5. Run: node analytics-cli.js realtime');
      break;
    default:
      console.log('📊 Available commands:');
      console.log('  realtime  - Get real-time active users');
      console.log('  pages     - Get page views (last 7 days)');
      console.log('  setup     - Show setup instructions');
      console.log('\nExample: node analytics-cli.js realtime');
  }
}

if (require.main === module) {
  main().catch(console.error);
}