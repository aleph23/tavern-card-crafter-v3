import React from "react"
import { motion } from "framer-motion"

import styles from "./iridescent-button.module.css"

const IridescentButton: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <motion.button
      className={`${styles.iridescentButton} w-full py-2 px-6 text-gray-900 font-bold rounded-md transition-all duration-500 relative z-10`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}

export IridescentButton

.iridescentButton {
  background: linear-gradient(
    90deg,
    rgba(255, 0, 0, 0.8) 0%,
    rgba(255, 154, 0, 0.8) 10%,
    rgba(208, 222, 33, 0.8) 20%,
    rgba(79, 220, 74, 0.8) 30%,
    rgba(63, 218, 216, 0.8) 40%,
    rgba(47, 201, 226, 0.8) 50%,
    rgba(28, 127, 238, 0.8) 60%,
    rgba(95, 21, 242, 0.8) 70%,
    rgba(186, 12, 248, 0.8) 80%,
    rgba(251, 7, 217, 0.8) 90%,
    rgba(255, 0, 0, 0.8) 100%
  );
  background-size: 200% 100%;
  animation: iridescent 6s linear infinite;
}
 
.iridescentButton::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: inherit;
  filter: blur(10px);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease-in-out;
}
 
.iridescentButton:hover::before {
  opacity: 1;
}
 
@keyframes iridescent {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}