import { useEffect, useState } from "react";

export type KeySlot = "first" | "second";

export type GeneratedKey = {
  value: string;
  createdAt: string;
};

export type DirectDmsSettings = {
  endpoint: string;
  keys: Record<KeySlot, GeneratedKey | null>;
};

const STORAGE_KEY = "edge-mind-dash.direct-dms-settings";
const DEFAULT_DMS_ENDPOINT = "wss://dms.dataminer.local";

export function buildDirectDmsKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();

  return `DMS-${hex.slice(0, 8)}-${hex.slice(8, 16)}-${hex.slice(16, 24)}-${hex.slice(24, 32)}`;
}

export function createGeneratedKey(): GeneratedKey {
  return {
    value: buildDirectDmsKey(),
    createdAt: new Date().toLocaleString(),
  };
}

function buildDefaultSettings(): DirectDmsSettings {
  return {
    endpoint: DEFAULT_DMS_ENDPOINT,
    keys: {
      first: createGeneratedKey(),
      second: null,
    },
  };
}

function isGeneratedKey(value: unknown): value is GeneratedKey {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.value === "string" && typeof candidate.createdAt === "string";
}

export function normalizeDirectDmsSettings(value: unknown): DirectDmsSettings {
  const defaults = buildDefaultSettings();

  if (!value || typeof value !== "object") {
    return defaults;
  }

  const candidate = value as Partial<DirectDmsSettings> & {
    keys?: Partial<Record<KeySlot, GeneratedKey | null>>;
  };

  return {
    endpoint:
      typeof candidate.endpoint === "string" && candidate.endpoint.trim().length > 0
        ? candidate.endpoint
        : defaults.endpoint,
    keys: {
      first: isGeneratedKey(candidate.keys?.first) ? candidate.keys.first : defaults.keys.first,
      second: isGeneratedKey(candidate.keys?.second) ? candidate.keys.second : null,
    },
  };
}

export function loadDirectDmsSettings(): DirectDmsSettings {
  if (typeof window === "undefined") {
    return buildDefaultSettings();
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const defaults = buildDefaultSettings();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }

    const normalized = normalizeDirectDmsSettings(JSON.parse(stored));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    const defaults = buildDefaultSettings();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }
}

export function saveDirectDmsSettings(settings: DirectDmsSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useDirectDmsSettings() {
  const [settings, setSettings] = useState<DirectDmsSettings>(() => loadDirectDmsSettings());

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== STORAGE_KEY) {
        return;
      }

      setSettings(loadDirectDmsSettings());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updateSettings = (
    updater: DirectDmsSettings | ((current: DirectDmsSettings) => DirectDmsSettings),
  ) => {
    setSettings((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      saveDirectDmsSettings(next);
      return next;
    });
  };

  return [settings, updateSettings] as const;
}