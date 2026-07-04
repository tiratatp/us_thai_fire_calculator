const PREFIX = 'us_thai_fire_';

export function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage`, e);
  }
}

export function restore<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(PREFIX + key);
    if (item === null) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn(`Failed to restore ${key} from localStorage`, e);
    return fallback;
  }
}

export function clear(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (e) {
    console.warn(`Failed to clear ${key} from localStorage`, e);
  }
}
