import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

const AnimatedCounter = ({ value, duration = 1.5, className = "", suffix = "" }: AnimatedCounterProps) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = value / (duration * 60);
    const interval = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        setDisplay(Math.round(start));
      }
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [value, duration]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {display}{suffix}
    </motion.span>
  );
};

export default AnimatedCounter;
