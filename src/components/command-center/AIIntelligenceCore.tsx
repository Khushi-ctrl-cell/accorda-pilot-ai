import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AIIntelligenceCore = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* Floating Orb */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full"
        style={{
          width: 56,
          height: 56,
          background: "linear-gradient(135deg, hsl(263, 84%, 58%), hsl(187, 92%, 55%))",
          boxShadow: "0 0 30px hsl(263, 84%, 58%, 0.4), 0 0 60px hsl(187, 92%, 55%, 0.2)",
        }}
        animate={{
          boxShadow: [
            "0 0 20px hsl(263, 84%, 58%, 0.3), 0 0 40px hsl(187, 92%, 55%, 0.1)",
            "0 0 35px hsl(263, 84%, 58%, 0.5), 0 0 70px hsl(187, 92%, 55%, 0.3)",
            "0 0 20px hsl(263, 84%, 58%, 0.3), 0 0 40px hsl(187, 92%, 55%, 0.1)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Brain className="h-6 w-6 text-white" />
      </motion.button>

      {/* Full-screen command console */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-background/90 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Console */}
            <motion.div
              className="relative w-full max-w-2xl mx-4 glass-panel p-8 rounded-2xl"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25 }}
            >
              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, hsl(263, 84%, 58%), hsl(187, 92%, 55%))" }}
                >
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground">Accorda Intelligence Core</h2>
                  <p className="text-xs text-muted-foreground">Ask anything about your compliance posture</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { q: "Why is finance risk high?", action: () => { setIsOpen(false); navigate("/copilot"); } },
                  { q: "Show SOC 2 readiness", action: () => { setIsOpen(false); navigate("/soc2"); } },
                  { q: "List critical violations", action: () => { setIsOpen(false); navigate("/violations"); } },
                  { q: "Run compliance scan", action: () => { setIsOpen(false); navigate("/"); } },
                ].map((item) => (
                  <button
                    key={item.q}
                    onClick={item.action}
                    className="text-left rounded-xl border border-border/50 p-3 hover:border-primary/30 hover:bg-primary/5 transition-all text-xs text-muted-foreground hover:text-foreground"
                  >
                    {item.q}
                  </button>
                ))}
              </div>

              {/* Open full copilot */}
              <button
                onClick={() => { setIsOpen(false); navigate("/copilot"); }}
                className="w-full flex items-center gap-2 justify-center rounded-xl gradient-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Sparkles className="h-4 w-4" />
                Open Full Intelligence Console
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIIntelligenceCore;
