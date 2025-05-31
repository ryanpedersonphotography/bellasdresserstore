#!/usr/bin/env node

/**
 * Bella's Dresser Store - Google Analytics 4 CLI
 * Pull analytics data directly from command line
 */

const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const PROPERTY_ID = '440956248'; // Your GA4 Property ID

class BellasAnalytics {
  constructor() {
    // This will use Application Default Credentials or service account
    this.analyticsDataClient = new BetaAnalyticsDataClient();
  }

  async getRealTimeUsers() {
    try {
      console.log('🔍 Fetching real-time users...\n');
      
      const [response] = await this.analyticsDataClient.runRealtimeReport({
        property: `properties/${PROPERTY_ID}`,
        dimensions: [
          { name: 'unifiedPageScreen' },
          { name: 'country' }
        ],
        metrics: [
          { name: 'activeUsers' }
        ]
      });

      console.log('📊 REAL-TIME ACTIVE USERS');
      console.log('========================');
      
      if (response.rows && response.rows.length > 0) {
        let totalUsers = 0;
        response.rows.forEach(row => {
          const page = row.dimensionValues[0].value;
          const country = row.dimensionValues[1].value;
          const users = parseInt(row.metricValues[0].value);
          totalUsers += users;
          console.log(`${page} (${country}): ${users} active users`);
        });
        console.log(`\nTotal Active Users: ${totalUsers}`);
      } else {
        console.log('No active users right now');
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPageViews(days = 7) {
    try {
      console.log(`🔍 Fetching page views for last ${days} days...\n`);
      
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: `${days}daysAgo`,
            endDate: 'today'
          }
        ],
        dimensions: [
          { name: 'pagePath' },
          { name: 'pageTitle' }
        ],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'sessions' },
          { name: 'bounceRate' }
        ],
        orderBys: [
          {
            metric: { metricName: 'screenPageViews' },
            desc: true
          }
        ]
      });

      console.log(`📈 PAGE VIEWS (Last ${days} Days)`);
      console.log('================================');
      
      if (response.rows && response.rows.length > 0) {
        response.rows.forEach(row => {
          const path = row.dimensionValues[0].value;
          const title = row.dimensionValues[1].value || 'No title';
          const views = row.metricValues[0].value;
          const sessions = row.metricValues[1].value;
          const bounce = Math.round(row.metricValues[2].value * 100);
          
          console.log(`${path}`);
          console.log(`  📄 ${title}`);
          console.log(`  👀 ${views} views | 🎯 ${sessions} sessions | ⚡ ${bounce}% bounce`);
          console.log('');
        });
      } else {
        console.log('No data available yet (GA4 needs 24-48 hours for historical reports)');
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTrafficSources(days = 7) {
    try {
      console.log(`🔍 Fetching traffic sources for last ${days} days...\n`);
      
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: `${days}daysAgo`,
            endDate: 'today'
          }
        ],
        dimensions: [
          { name: 'sessionSourceMedium' }
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'screenPageViews' }
        ],
        orderBys: [
          {
            metric: { metricName: 'sessions' },
            desc: true
          }
        ]
      });

      console.log(`🚀 TRAFFIC SOURCES (Last ${days} Days)`);
      console.log('====================================');
      
      if (response.rows && response.rows.length > 0) {
        response.rows.forEach(row => {
          const source = row.dimensionValues[0].value;
          const sessions = row.metricValues[0].value;
          const views = row.metricValues[1].value;
          
          console.log(`${source}: ${sessions} sessions, ${views} page views`);
        });
      } else {
        console.log('No traffic data available yet');
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async getSummary() {
    try {
      console.log('🔍 Fetching analytics summary...\n');
      
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: '7daysAgo',
            endDate: 'today'
          }
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'sessionDuration' }
        ]
      });

      console.log('📊 BELLA\'S DRESSER ANALYTICS SUMMARY (7 Days)');
      console.log('===============================================');
      
      if (response.rows && response.rows.length > 0) {
        const row = response.rows[0];
        const users = row.metricValues[0].value;
        const sessions = row.metricValues[1].value;
        const views = row.metricValues[2].value;
        const bounce = Math.round(row.metricValues[3].value * 100);
        const duration = Math.round(row.metricValues[4].value);
        
        console.log(`👥 Active Users: ${users}`);
        console.log(`🎯 Sessions: ${sessions}`);
        console.log(`👀 Page Views: ${views}`);
        console.log(`⚡ Bounce Rate: ${bounce}%`);
        console.log(`⏱️  Avg Session Duration: ${duration} seconds`);
      } else {
        console.log('No summary data available yet');
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    if (error.message.includes('Application Default Credentials')) {
      console.log('❌ Authentication Error');
      console.log('');
      console.log('🔧 Quick Setup:');
      console.log('1. Install Google Cloud CLI: brew install google-cloud-sdk');
      console.log('2. Authenticate: gcloud auth application-default login');
      console.log('3. Try again: node ga4-cli.js summary');
      console.log('');
      console.log('📖 Or create a service account:');
      console.log('   https://console.cloud.google.com/apis/credentials');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// CLI interface
async function main() {
  const analytics = new BellasAnalytics();
  const command = process.argv[2];
  const days = parseInt(process.argv[3]) || 7;

  console.log('🛍️  Bella\'s Dresser Store Analytics CLI\n');

  switch (command) {
    case 'realtime':
      await analytics.getRealTimeUsers();
      break;
    case 'pages':
      await analytics.getPageViews(days);
      break;
    case 'traffic':
      await analytics.getTrafficSources(days);
      break;
    case 'summary':
      await analytics.getSummary();
      break;
    case 'setup':
      console.log('🔧 Authentication Setup:');
      console.log('1. Install: brew install google-cloud-sdk');
      console.log('2. Login: gcloud auth application-default login');
      console.log('3. Run: node ga4-cli.js summary');
      break;
    default:
      console.log('📊 Available commands:');
      console.log('  summary   - Complete analytics overview');
      console.log('  realtime  - Real-time active users');
      console.log('  pages [n] - Page views (default: 7 days)');
      console.log('  traffic   - Traffic sources');
      console.log('  setup     - Show authentication setup');
      console.log('');
      console.log('Examples:');
      console.log('  node ga4-cli.js summary');
      console.log('  node ga4-cli.js pages 30');
      console.log('  node ga4-cli.js realtime');
  }
}

if (require.main === module) {
  main().catch(console.error);
}