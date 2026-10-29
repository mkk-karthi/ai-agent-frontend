import { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const SCRIPT_ID = "google-recaptcha-v3-script";

export function useRecaptcha() {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!siteKey) return;

    let isMounted = true;

    const setBadgeVisibility = (visible: boolean) => {
      const badges = document.querySelectorAll<HTMLElement>(".grecaptcha-badge");
      badges.forEach((badge) => {
        badge.style.visibility = visible ? "visible" : "hidden";
        badge.style.pointerEvents = visible ? "auto" : "none";
      });
    };

    if (document.getElementById(SCRIPT_ID)) {
      scriptLoaded.current = true;
      setBadgeVisibility(true);
    } else {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        scriptLoaded.current = true;
        if (isMounted) {
          setBadgeVisibility(true);
        } else {
          setBadgeVisibility(false);
        }
      };
      document.head.appendChild(script);
    }

    // Google injects .grecaptcha-badge into body asynchronously
    const observer = new MutationObserver(() => {
      setBadgeVisibility(isMounted);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      isMounted = false;
      observer.disconnect();
      setBadgeVisibility(false);
    };
  }, [siteKey]);

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      if (!siteKey) {
        // In local development without configured key, return null gracefully
        return null;
      }

      return new Promise<string | null>((resolve) => {
        try {
          if (!window.grecaptcha) {
            resolve(null);
            return;
          }

          window.grecaptcha.ready(async () => {
            try {
              const token = await window.grecaptcha!.execute(siteKey, { action });
              resolve(token);
            } catch {
              resolve(null);
            }
          });
        } catch {
          resolve(null);
        }
      });
    },
    [siteKey],
  );

  return { executeRecaptcha, isEnabled: Boolean(siteKey) };
}
