import { parse } from 'node-html-parser';

export interface Env {
  NOTIFICATIONS_KV: KVNamespace;
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
}

const COE_URL = 'https://coe1.annauniv.edu/home/';
const BASE_URL = 'https://coe.annauniv.edu';

interface Notification {
  id: string;
  title: string;
  link: string | null;
  isNew: boolean;
}

function makeAbsoluteUrl(url: string): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return BASE_URL + url;
  return BASE_URL + '/' + url;
}

async function generateId(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 8);
}

async function fetchNotifications(): Promise<Notification[]> {
  const response = await fetch(COE_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  const root = parse(html);
  const notifications: Notification[] = [];

  const scrmsg = root.querySelector('#scrmsg');
  if (!scrmsg) {
    console.warn('Could not find #scrmsg element on the page');
    return notifications;
  }

  const paragraphs = scrmsg.querySelectorAll('p');

  for (const p of paragraphs) {
    const htmlContent = p.innerHTML || '';
    let title = p.text.trim();

    if (!title) continue;
    title = title.replace(/^\*+\s*/, '').trim();

    let link: string | null = null;
    const a = p.querySelector('a');
    if (a) {
      const href = a.getAttribute('href');
      if (href) link = makeAbsoluteUrl(href);
    }

    const isNew = htmlContent.includes('new_blink.gif');
    const id = await generateId(title);

    notifications.push({ id, title, link, isNew });
  }

  return notifications;
}

async function triggerGitHubActions(env: Env): Promise<void> {
  const response = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'anna-univ-cf-worker/1.0',
      },
      body: JSON.stringify({ event_type: 'notifications-updated' }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub dispatch failed (${response.status}): ${error}`);
  }

  console.log('Triggered GitHub Actions workflow via repository_dispatch');
}

async function handleScheduled(env: Env): Promise<void> {
  console.log('Running scheduled notification check...');

  // 1. Scrape current notifications
  let notifications: Notification[];
  try {
    notifications = await fetchNotifications();
    console.log(`Fetched ${notifications.length} notifications`);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return;
  }

  // 2. Load previously seen notification IDs from KV
  const storedIdsJson = await env.NOTIFICATIONS_KV.get('notification_ids');
  const storedIds = new Set<string>(
    storedIdsJson ? (JSON.parse(storedIdsJson) as string[]) : [],
  );

  const currentIds = notifications.map(n => n.id);

  // 3. First run: seed KV without sending any notifications
  if (storedIds.size === 0 && currentIds.length > 0) {
    console.log('First run — seeding KV with current notification IDs');
    await env.NOTIFICATIONS_KV.put(
      'notification_ids',
      JSON.stringify(currentIds),
    );
    return;
  }

  // 4. Check for genuinely new notifications
  const hasNew = currentIds.some(id => !storedIds.has(id));

  if (!hasNew) {
    console.log('No new notifications');
    return;
  }

  console.log('New notifications detected — updating KV and triggering workflow');

  // 5. Persist updated IDs immediately so the next cron run won't re-trigger
  await env.NOTIFICATIONS_KV.put('notification_ids', JSON.stringify(currentIds));

  // 6. Trigger GitHub Actions to scrape, send FCM, and commit the data file
  try {
    await triggerGitHubActions(env);
  } catch (error) {
    console.error('Failed to trigger GitHub Actions:', error);
  }
}

export default {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(handleScheduled(env));
  },
} satisfies ExportedHandler<Env>;
