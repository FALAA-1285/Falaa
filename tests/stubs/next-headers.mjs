const store = new Map();

export const testCookieStore = {
  get: (name) => store.get(name),
  set: (name, val) => store.set(name, val),
  delete: (name) => store.delete(name),
  clear: () => store.clear(),
};

// Tests may add or override request headers (e.g. to simulate spoofed proxy headers).
export const testHeaderOverrides = new Map();

export async function headers() {
  return new Headers({
    "x-forwarded-for": "127.0.0.1",
    "user-agent": "NodeTestRunner/1.0",
    ...Object.fromEntries(testHeaderOverrides),
  });
}

export async function cookies() {
  return {
    get: (name) => {
      const val = store.get(name);
      return val !== undefined ? { name, value: val } : undefined;
    },
    set: (name, val) => {
      store.set(name, typeof val === "object" ? val.value : val);
    },
    delete: (name) => {
      store.delete(name);
    },
  };
}
