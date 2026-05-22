import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const NavLink = ({
  href,
  children,
  className,
  isActive: isActiveProp,
  onMouseEnter,
  onMouseLeave,
}: NavLinkProps) => {
  const location = useLocation();
  // Use prop if provided, otherwise calculate
  const isActive = isActiveProp ?? (location.pathname === href || location.pathname.startsWith(href + "/"));

  return (
    <Link
      to={href}
      className={cn(
        "relative text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm py-5 block group",
        isActive && "font-normal",
        !isActive && "font-light",
        className
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="relative">
        {children}
        {/* Permanent underline for active state */}
        {isActive && (
          <motion.span
            className="absolute -bottom-1 left-0 h-px bg-foreground"
            layoutId="navActiveIndicator"
            style={{ width: "100%" }}
            transition={{ type: "spring" as const, stiffness: 380, damping: 30 }}
          />
        )}
        {/* Hover underline for inactive state */}
        {!isActive && (
          <motion.span
            className="absolute -bottom-1 left-0 h-px bg-foreground origin-left"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: "100%" }}
          />
        )}
      </span>
    </Link>
  );
};

export default NavLink;
