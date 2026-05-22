import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import StatusBar from "./StatusBar";
import Navigation from "./Navigation";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { cn } from "@/lib/utils";

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/home";
  const { direction, isAtTop, isScrolled } = useScrollDirection(80);
  const shouldHide = direction === "down" && isScrolled && !isAtTop;

  const [hasRevealed, setHasRevealed] = useState(!isHomePage);

  // Reset when navigating to /home
  useEffect(() => {
    if (isHomePage) {
      setHasRevealed(false);
    } else {
      setHasRevealed(true);
    }
  }, [isHomePage]);

  // Reveal on first scroll-up
  useEffect(() => {
    if (!hasRevealed && direction === "up" && isScrolled) {
      setHasRevealed(true);
    }
  }, [direction, isScrolled, hasRevealed]);

  // Determine y position
  const yPosition = !hasRevealed ? -100 : shouldHide ? -100 : 0;

  return (
    <motion.header
      className={cn(
        "w-full fixed top-0 left-0 right-0 z-50 transition-shadow duration-300",
        !isAtTop && hasRevealed && "shadow-sm"
      )}
      initial={{ y: isHomePage ? -100 : 0 }}
      animate={{ y: yPosition }}
      transition={{
        type: "tween",
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <StatusBar />
      <Navigation />
    </motion.header>
  );
};

export default Header;
