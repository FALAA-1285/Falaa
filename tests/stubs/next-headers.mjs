const store = new Map();

export const testCookieStore = {
  get: (name) => store.get(name),
  set: (name, val) => store.set(name, val),
  delete: (name) => store.delete(name),
  clear: () => store.clear(),
};

export async function headers() {
  return new Headers({
    "x-forwarded-for": "127.0.0.1",
    "user-agent": "NodeTestRunner/1.0",
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
