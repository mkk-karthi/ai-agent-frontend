import { useState, useEffect } from "react";

// Default Tailwind breakpoints in pixels
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export type BreakpointKey = keyof typeof breakpoints;

export function useBreakpoint() {
  const [activeBreakpoint, setActiveBreakpoint] = useState<BreakpointKey | "xs">("xs");

  useEffect(() => {
    // Handler to evaluate window width
    const handleResize = () => {
      const width = window.innerWidth;

      if (width >= breakpoints["2xl"]) setActiveBreakpoint("2xl");
      else if (width >= breakpoints.xl) setActiveBreakpoint("xl");
      else if (width >= breakpoints.lg) setActiveBreakpoint("lg");
      else if (width >= breakpoints.md) setActiveBreakpoint("md");
      else if (width >= breakpoints.sm) setActiveBreakpoint("sm");
      else setActiveBreakpoint("xs");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return activeBreakpoint;
}
