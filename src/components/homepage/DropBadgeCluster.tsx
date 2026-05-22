import { motion } from "framer-motion";

interface DropBadgeClusterProps {
  dropNumber?: string;
  collectionName?: string;
  limitedPieces?: number;
  isLive?: boolean;
  delay?: number;
}

const DropBadgeCluster = ({
  dropNumber = "001",
  collectionName = "STAY HOLY COLLECTION",
  limitedPieces = 250,
  isLive = true,
  delay = 0,
}: DropBadgeClusterProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col gap-2"
    >
      {/* Live Indicator */}
      {isLive && (
        <div className="flex items-center gap-2">
          <motion.span
            className="w-2 h-2 bg-destructive rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-destructive">
            Live Now
          </span>
        </div>
      )}

      {/* Separator */}
      <motion.div
        className="w-12 h-px bg-background/30"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ transformOrigin: "left" }}
      />

      {/* Drop Info */}
      <span className="text-[10px] font-light tracking-[0.2em] uppercase text-background/70">
        Drop {dropNumber} • {collectionName}
      </span>

      {/* Scarcity */}
      {limitedPieces && (
        <span className="text-[10px] font-light tracking-[0.15em] uppercase text-background/50">
          Limited Edition • {limitedPieces} Pieces
        </span>
      )}
    </motion.div>
  );
};

export default DropBadgeCluster;
