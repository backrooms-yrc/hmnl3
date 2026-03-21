const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isOldSafari = isSafari && (function() {
  const version = navigator.userAgent.match(/version\/(\d+)/i);
  return version && parseInt(version[1], 10) < 16.4;
})();

const hasLookbehindSupport = (function() {
  try {
    new RegExp('(?<=test)');
    return true;
  } catch (e) {
    return false;
  }
})();

export const needsPolyfill = isOldSafari || !hasLookbehindSupport;

export function safeRegExp(pattern: string, flags?: string): RegExp | null {
  try {
    return new RegExp(pattern, flags);
  } catch (e) {
    if (needsPolyfill && (pattern.includes('(?<=') || pattern.includes('(?<!'))) {
      console.warn('[RegExp Polyfill] Lookbehind assertion not supported, pattern skipped:', pattern.substring(0, 50) + '...');
      return null;
    }
    throw e;
  }
}

export function safeMatch(str: string, pattern: string | RegExp): RegExpMatchArray | null {
  if (typeof pattern === 'string') {
    try {
      return str.match(new RegExp(pattern));
    } catch (e) {
      console.warn('[RegExp Polyfill] Match failed:', e);
      return null;
    }
  }
  try {
    return str.match(pattern);
  } catch (e) {
    console.warn('[RegExp Polyfill] Match failed:', e);
    return null;
  }
}

export function safeReplace(str: string, pattern: string | RegExp, replacement: string): string {
  if (typeof pattern === 'string') {
    try {
      return str.replace(new RegExp(pattern, 'g'), replacement);
    } catch (e) {
      console.warn('[RegExp Polyfill] Replace failed:', e);
      return str;
    }
  }
  try {
    return str.replace(pattern, replacement);
  } catch (e) {
    console.warn('[RegExp Polyfill] Replace failed:', e);
    return str;
  }
}

export function safeTest(pattern: string | RegExp, str: string): boolean {
  if (typeof pattern === 'string') {
    try {
      return new RegExp(pattern).test(str);
    } catch (e) {
      console.warn('[RegExp Polyfill] Test failed:', e);
      return false;
    }
  }
  try {
    return pattern.test(str);
  } catch (e) {
    console.warn('[RegExp Polyfill] Test failed:', e);
    return false;
  }
}

if (needsPolyfill) {
  console.log('[RegExp Polyfill] Safari < 16.4 detected or lookbehind not supported, regex utilities loaded');
}
