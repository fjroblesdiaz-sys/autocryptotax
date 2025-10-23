import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  const logoVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: "spring", duration: 1.5, bounce: 0 },
        opacity: { duration: 0.01 }
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-24 h-24 text-fintech-blue-light"
        initial="hidden"
        animate="visible"
      >
        <motion.polyline
          points="22 7 13.5 15.5 8.5 10.5 2 17"
          variants={logoVariants}
        />
        <motion.polyline
          points="16 7 22 7 22 13"
          variants={logoVariants}
        />
      </motion.svg>
      <motion.p
        className="text-fintech-blue-light mt-4 font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        Cargando sistema...
      </motion.p>
    </motion.div>
  );
};

export default Loader;