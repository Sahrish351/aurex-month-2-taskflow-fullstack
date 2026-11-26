const PREFS_KEY = 'taskflow_ui_preferences_v1';

export const DEFAULT_PREFERENCES = {
  defaultSort: 'newest',
  defaultView: 'list',
  compactDensity: false,
};

export function loadPreferences() {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      defaultSort: ['newest', 'oldest', 'dueDate', 'priority'].includes(parsed?.defaultSort)
        ? parsed.defaultSort
        : 'newest',
      defaultView: ['list', 'board'].includes(parsed?.defaultView) ? parsed.defaultView : 'list',
      compactDensity: Boolean(parsed?.compactDensity),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs) {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage restriction errors
  }
}
