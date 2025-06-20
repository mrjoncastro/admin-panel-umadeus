"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function LoadingOverlay({
  show,
  text,
}: {
  show: boolean;
  text?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-2 text-white">
            <span className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            {text && <span>{text}</span>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
