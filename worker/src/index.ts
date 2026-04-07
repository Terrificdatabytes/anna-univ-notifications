import { parse } from 'node-html-parser';

export interface Env {
  NOTIFICATIONS_KV: KVNamespace;
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
}

interface WorkerLogEntry {
  timestamp: string;
  notificationsCount: number;
  hasNew: boolean;
  status: 'ok' | 'error';
  error?: string;
}

const COE_URL = 'https://coe1.annauniv.edu/home/';
const BASE_URL = 'https://coe.annauniv.edu';
const HEARTBEAT_DISPATCH_EVENT = 'worker-heartbeat';
const HEARTBEAT_DISPATCH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const LAST_HEARTBEAT_DISPATCH_KEY = 'last_heartbeat_dispatch_at';

interface Notification {
  id: string;
  title: string;
  link: string | null;
  isNew: boolean;
}

interface NotificationsData {
  notifications: Notification[];
  lastUpdated: string;
  lastChecked?: string;
  count: number;
}

interface GitHubFileResponse {
  sha: string;
  content: string;
}

function base64Encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  return btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
}

function base64Decode(str: string): string {
  const binary = atob(str.replace(/\n/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
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

async function updateTimestamps(
  env: Env,
  timestamp: string,
  retries = 2,
): Promise<void> {
  const [owner, repo] = env.GITHUB_REPO.split('/');
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/data/notifications.json`;

  // Fetch current file content and SHA
  const getResponse = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'anna-univ-cf-worker/1.0',
    },
  });

  if (!getResponse.ok) {
    throw new Error(
      `Failed to fetch notifications.json: HTTP ${getResponse.status}`,
    );
  }

  const fileData = (await getResponse.json()) as GitHubFileResponse;
  const data = JSON.parse(base64Decode(fileData.content)) as NotificationsData;

  // Always update both lastChecked and lastUpdated so the file timestamp
  // reflects every worker run, even when no new notifications are detected.
  data.lastChecked = timestamp;
  data.lastUpdated = timestamp;

  const newContent = base64Encode(JSON.stringify(data, null, 2));

  const putResponse = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'anna-univ-cf-worker/1.0',
    },
    body: JSON.stringify({
      message: `chore: update timestamps - ${timestamp}`,
      content: newContent,
      sha: fileData.sha,
    }),
  });

  if (!putResponse.ok) {
    const errorText = await putResponse.text();
    if (putResponse.status === 409 && retries > 0) {
      // SHA conflict: a concurrent write changed the file. Re-fetch and retry.
      await new Promise(resolve => setTimeout(resolve, 500));
      return updateTimestamps(env, timestamp, retries - 1);
    }
    throw new Error(
      `Failed to update notifications.json: HTTP ${putResponse.status}: ${errorText}`,
    );
  }

  console.log(`Updated lastChecked and lastUpdated to ${timestamp}`);
}

const WORKER_LOG_KEY = 'worker_log';
const WORKER_LOG_MAX_ENTRIES = 50;

async function appendWorkerLog(
  env: Env,
  entry: WorkerLogEntry,
): Promise<void> {
  const raw = await env.NOTIFICATIONS_KV.get(WORKER_LOG_KEY);
  const log: WorkerLogEntry[] = raw ? (JSON.parse(raw) as WorkerLogEntry[]) : [];
  log.unshift(entry);
  if (log.length > WORKER_LOG_MAX_ENTRIES) {
    log.length = WORKER_LOG_MAX_ENTRIES;
  }
  await env.NOTIFICATIONS_KV.put(WORKER_LOG_KEY, JSON.stringify(log));
}

async function dispatchRepositoryEvent(
  env: Env,
  eventType: string,
  clientPayload?: Record<string, string>,
): Promise<void> {
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
      body: JSON.stringify({
        event_type: eventType,
        ...(clientPayload ? { client_payload: clientPayload } : {}),
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub dispatch failed (${response.status}): ${error}`);
  }
}

async function triggerGitHubActions(env: Env): Promise<void> {
  await dispatchRepositoryEvent(env, 'notifications-updated');
  console.log('Triggered GitHub Actions workflow via repository_dispatch');
}

async function triggerHeartbeatFallback(
  env: Env,
  reason: string,
): Promise<void> {
  const nowMs = Date.now();
  try {
    const lastDispatchRaw = await env.NOTIFICATIONS_KV.get(
      LAST_HEARTBEAT_DISPATCH_KEY,
    );
    const lastDispatchMs = lastDispatchRaw ? Number(lastDispatchRaw) : 0;
    const shouldThrottle =
      nowMs - lastDispatchMs < HEARTBEAT_DISPATCH_INTERVAL_MS;

    if (shouldThrottle) {
      console.log('Heartbeat fallback dispatch throttled');
      return;
    }
  } catch (kvError) {
    // Proceed even if KV read fails so we still attempt the fallback dispatch.
    console.error('Failed to read heartbeat dispatch throttle key:', kvError);
  }

  try {
    const timestamp = new Date(nowMs).toISOString();
    await dispatchRepositoryEvent(env, HEARTBEAT_DISPATCH_EVENT, {
      reason,
      timestamp,
    });
    await env.NOTIFICATIONS_KV.put(
      LAST_HEARTBEAT_DISPATCH_KEY,
      String(nowMs),
    );
    console.log('Triggered worker-heartbeat fallback workflow');
  } catch (error) {
    console.error('Failed to trigger worker-heartbeat fallback workflow:', error);
  }
}

async function handleScheduled(env: Env): Promise<void> {
  console.log('Running scheduled notification check...');
  const now = new Date().toISOString();

  // 1. Scrape current notifications
  let notifications: Notification[];
  try {
    notifications = await fetchNotifications();
    console.log(`Fetched ${notifications.length} notifications`);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to fetch notifications:', error);
    // Update timestamps even on fetch failure so the app always shows a
    // fresh "last checked" time regardless of COE website availability.
    try {
      await updateTimestamps(env, now);
    } catch (tsError) {
      console.error('Failed to update timestamps on error path:', tsError);
      await triggerHeartbeatFallback(env, 'fetch-failed-direct-update');
    }
    try {
      await appendWorkerLog(env, {
        timestamp: now,
        notificationsCount: 0,
        hasNew: false,
        status: 'error',
        error: errMsg,
      });
    } catch (logError) {
      console.error('Failed to append worker log on error path:', logError);
    }
    return;
  }

  // 2. Always update lastChecked and lastUpdated in the JSON file so the
  //    timestamp reflects every worker run, even with no new notifications.
  //    This is done before KV operations so that a KV failure cannot prevent
  //    the file from being updated.
  try {
    await updateTimestamps(env, now);
  } catch (error) {
    // Non-fatal: a concurrent write (e.g. GitHub Actions) may have changed the
    // SHA.  The timestamp will be corrected on the next scheduled run.
    console.error('Failed to update timestamps:', error);
    await triggerHeartbeatFallback(env, 'normal-path-direct-update-failed');
  }

  // 3. Load previously seen notification IDs from KV
  const storedIdsJson = await env.NOTIFICATIONS_KV.get('notification_ids');
  const storedIds = new Set<string>(
    storedIdsJson ? (JSON.parse(storedIdsJson) as string[]) : [],
  );

  const currentIds = notifications.map(n => n.id);

  // 4. First run: seed KV without sending any notifications
  //    (timestamps were already updated at step 2 above)
  if (storedIds.size === 0 && currentIds.length > 0) {
    console.log('First run — seeding KV with current notification IDs');
    await env.NOTIFICATIONS_KV.put(
      'notification_ids',
      JSON.stringify(currentIds),
    );
    try {
      await appendWorkerLog(env, {
        timestamp: now,
        notificationsCount: currentIds.length,
        hasNew: false,
        status: 'ok',
      });
    } catch (logError) {
      console.error('Failed to append worker log on first run:', logError);
    }
    return;
  }

  // 5. Check for genuinely new notifications
  const hasNew = currentIds.some(id => !storedIds.has(id));

  // 6. Record this run in the worker log
  try {
    await appendWorkerLog(env, {
      timestamp: now,
      notificationsCount: currentIds.length,
      hasNew,
      status: 'ok',
    });
  } catch (logError) {
    console.error('Failed to append worker log:', logError);
  }

  if (!hasNew) {
    console.log('No new notifications');
    return;
  }

  console.log('New notifications detected — updating KV and triggering workflow');

  // 7. Persist updated IDs immediately so the next cron run won't re-trigger
  await env.NOTIFICATIONS_KV.put('notification_ids', JSON.stringify(currentIds));

  // 8. Trigger GitHub Actions to scrape, send FCM, and commit the data file
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

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/log') {
      const raw = await env.NOTIFICATIONS_KV.get(WORKER_LOG_KEY);
      const log: WorkerLogEntry[] = raw ? (JSON.parse(raw) as WorkerLogEntry[]) : [];
      return new Response(JSON.stringify({ entries: log, count: log.length }, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    return new Response('anna-univ-notifications worker is running.\nGET /log for execution history.', {
      headers: { 'Content-Type': 'text/plain' },
    });
  },
} satisfies ExportedHandler<Env>;
