import { Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const BookDemoSection = () => (
  <section className="py-20 border-t border-border/50">
    <div className="max-w-4xl mx-auto px-6">
      <motion.div
        className="gradient-primary rounded-2xl p-10 text-center"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Calendar className="h-10 w-10 text-primary-foreground/80 mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground">
          See Accorda in action
        </h2>
        <p className="mt-3 text-primary-foreground/80 max-w-lg mx-auto">
          Book a 15-minute demo with our founding team. We'll show you how Accorda 
          can get you SOC 2 audit-ready in weeks, not months.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
          <a
            href="https://calendly.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white text-primary px-6 py-3 text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Book a Demo <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="mailto:founders@accorda.ai"
            className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/30 text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Contact Sales
          </a>
        </div>
      </motion.div>
    </div>
  </section>
);

export default BookDemoSection;
