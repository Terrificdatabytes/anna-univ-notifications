import axios from 'axios';
import * as cheerio from 'cheerio';
import { createHash } from 'crypto';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COE_URL = 'https://coe1.annauniv.edu/home/';
const BASE_URL = 'https://coe.annauniv.edu';
const OUTPUT_FILE = join(__dirname, '../data/notifications.json');

/**
 * Generate MD5 hash for unique ID
 */
function generateId(text) {
  return createHash('md5').update(text).digest('hex').substring(0, 8);
}

/**
 * Make relative URLs absolute
 */
function makeAbsoluteUrl(url) {
  if (!url) return null;
  
  // Already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Relative URL
  if (url.startsWith('/')) {
    return BASE_URL + url;
  }
  
  // Relative without leading slash
  return BASE_URL + '/' + url;
}

/**
 * Scrape notifications from COE website
 */
async function scrapeNotifications() {
  try {
    console.log('Fetching notifications from:', COE_URL);
    
    const response = await axios.get(COE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const notifications = [];
    
    // Find all <p> elements inside the marquee with id="scrmsg"
    $('#scrmsg p').each((index, element) => {
      const $p = $(element);
      const html = $p.html() || '';
      
      // Extract text (remove HTML tags for clean title)
      let title = $p.text().trim();
      
      // Skip empty notifications
      if (!title) return;
      
      // Clean up the title - remove asterisks and extra whitespace
      title = title.replace(/^\*+\s*/, '').trim();
      
      // Extract link if available
      let link = null;
      const $link = $p.find('a');
      if ($link.length > 0) {
        const href = $link.attr('href');
        link = makeAbsoluteUrl(href);
      }
      
      // Check if notification is new (has new_blink.gif image)
      const isNew = html.includes('new_blink.gif');
      
      // Generate unique ID from title
      const id = generateId(title);
      
      notifications.push({
        id,
        title,
        link,
        isNew
      });
    });
    
    console.log(`Found ${notifications.length} notifications`);
    
    // Prepare output data
    const outputData = {
      notifications,
      lastUpdated: new Date().toISOString(),
      count: notifications.length
    };
    
    // Ensure data directory exists
    mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
    
    // Write to JSON file
    writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
    console.log('Notifications saved to:', OUTPUT_FILE);
    
    return outputData;
  } catch (error) {
    console.error('Error scraping notifications:', error.message);
    throw error;
  }
}

// Run the scraper
scrapeNotifications()
  .then(data => {
    console.log('Scraping completed successfully');
    console.log('Total notifications:', data.count);
  })
  .catch(error => {
    console.error('Scraping failed:', error);
    process.exit(1);
  });
