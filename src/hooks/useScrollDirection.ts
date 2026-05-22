import { useState, useEffect } from "react";

interface ScrollDirectionState {
  scrollY: number;
  direction: "up" | "down" | null;
  isAtTop: boolean;
  isScrolled: boolean;
}

export const useScrollDirection = (threshold = 10) => {
  const [state, setState] = useState<ScrollDirectionState>({
    scrollY: 0,
    direction: null,
    isAtTop: true,
    isScrolled: false,
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? "down" : "up";
      const isAtTop = scrollY < threshold;
      const isScrolled = scrollY > 0;

      // Only update if we've scrolled more than threshold
      if (Math.abs(scrollY - lastScrollY) >= threshold) {
        setState((prev) => {
          if (prev.direction === direction && prev.isAtTop === isAtTop && prev.scrollY === scrollY) return prev;
          return { scrollY, direction, isAtTop, isScrolled };
        });
        lastScrollY = scrollY > 0 ? scrollY : 0;
      } else {
        setState((prev) => {
          if (prev.isAtTop === isAtTop && prev.isScrolled === isScrolled && prev.scrollY === scrollY) return prev;
          return { ...prev, scrollY, isAtTop, isScrolled };
        });
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return state;
};

export default useScrollDirection;
