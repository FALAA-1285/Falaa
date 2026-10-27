export function redirect(url) {
  const err = new Error(`NEXT_REDIRECT: ${url}`);
  err.digest = `NEXT_REDIRECT;replace;${url};307;`;
  throw err;
}

export function notFound() {
  const err = new Error("NEXT_NOT_FOUND");
  err.digest = "NEXT_NOT_FOUND";
  throw err;
}

export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    refresh: () => {},
    back: () => {},
    forward: () => {},
  };
}

export function usePathname() {
  return "/admin";
}

export function useSearchParams() {
  return new URLSearchParams();
}
