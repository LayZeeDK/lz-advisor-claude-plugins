import { Injectable } from '@angular/core';

interface CacheEntry {
  value: unknown;
  expires: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private store = new Map<string, CacheEntry>();

  set(key: string, value: unknown, ttlMs: number): void {
    this.store.set(key, { value, expires: Date.now() + ttlMs });
    setTimeout(() => this.store.delete(key), ttlMs);
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (entry && entry.expires > Date.now()) {
      return entry.value as T;
    }
    return undefined;
  }

  clear(): void {
    this.store.clear();
  }
}
