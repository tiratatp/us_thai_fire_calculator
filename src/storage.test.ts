// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { save, restore, clear } from './storage.js';

const mockStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

vi.stubGlobal('localStorage', mockStorage);

describe('storage', () => {
  beforeEach(() => {
    mockStorage.clear();
    vi.clearAllMocks();
  });

  it('saves and restores data', () => {
    const data = { foo: 'bar', baz: 42 };
    save('test_key', data);
    expect(restore('test_key', { fallback: true })).toEqual(data);
  });

  it('returns fallback when key is missing', () => {
    expect(restore('missing_key', { fallback: true })).toEqual({ fallback: true });
  });

  it('clears data', () => {
    save('test_key', { foo: 'bar' });
    clear('test_key');
    expect(restore('test_key', { fallback: true })).toEqual({ fallback: true });
  });

  it('handles localStorage errors gracefully', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockStorage.setItem.mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });

    save('test_key', { foo: 'bar' });
    expect(warnSpy).toHaveBeenCalled();
    expect(restore('test_key', { fallback: true })).toEqual({ fallback: true });
  });

  it('handles JSON parse errors gracefully', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockStorage.setItem('us_thai_fire_test_key', 'invalid json');

    expect(restore('test_key', { fallback: true })).toEqual({ fallback: true });
    expect(warnSpy).toHaveBeenCalled();
  });
});
