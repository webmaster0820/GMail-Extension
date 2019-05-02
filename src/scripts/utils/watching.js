import { getCurrentUser, saveWatchedInterval } from 'utils/api';

const MAX_WATCH_SECONDS = __goldtime_EXTENSION_CONFIG__.max_watch_seconds;
const MIN_WATCH_SECONDS = __goldtime_EXTENSION_CONFIG__.min_watch_seconds;

let WATCHING;

export function trackWatching(video) {
  if (! WATCHING) {
    WATCHING = {
      type: video.type,
      id: video.id,
      internal_id: video.internal_id,
      current_time: Math.floor(video.current_time) || 0,
      from: Date.now(),
    };
  }
  else if (WATCHING.internal_id != video.internal_id) {
    flushWatching();
  }
  else {
    WATCHING.to = Date.now();
    const watchedSeconds = getSecondsWatched(WATCHING);
    if (watchedSeconds >= MAX_WATCH_SECONDS) {
      sendSegmentToAPI(WATCHING.type, WATCHING.id, WATCHING.current_time, WATCHING.current_time + watchedSeconds);
      WATCHING.from = Date.now();
      WATCHING.current_time = WATCHING.current_time + watchedSeconds;
    }
  }
}

export function flushWatching() {
  if (WATCHING) {
    const watchedSeconds = getSecondsWatched(WATCHING);
    if (watchedSeconds >= MIN_WATCH_SECONDS) {
      sendSegmentToAPI(WATCHING.type, WATCHING.id, WATCHING.current_time, WATCHING.current_time + watchedSeconds);
    }
    WATCHING = null;
  }
}

function getSecondsWatched() {
  return Math.round((WATCHING.to - WATCHING.from) / 1000);
}

async function sendSegmentToAPI(type, id, from, to) {
  const { id: user_id  } = await getCurrentUser();
  saveWatchedInterval({ user_id, type, id, from, to });
}