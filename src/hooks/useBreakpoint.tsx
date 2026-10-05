import { useState, useEffect } from "react";

// Default Tailwind breakpoints in pixels
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

function getBreakpoint(width: number) {
  if (width >= breakpoints["2xl"]) return "2xl";
  else if (width >= breakpoints.xl) return "xl";
  else if (width >= breakpoints.lg) return "lg";
  else if (width >= breakpoints.md) return "md";
  else if (width >= breakpoints.sm) return "sm";
  return "xs";
}

export type BreakpointKey = keyof typeof breakpoints;

export function useBreakpoint() {
  const [activeBreakpoint, setActiveBreakpoint] = useState<BreakpointKey | "xs">(() =>
    typeof window !== "undefined" ? getBreakpoint(window.innerWidth) : "xs",
  );

  useEffect(() => {
    // Handler to evaluate window width
    const handleResize = () => {
      setActiveBreakpoint(getBreakpoint(window.innerWidth));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return activeBreakpoint;
}
