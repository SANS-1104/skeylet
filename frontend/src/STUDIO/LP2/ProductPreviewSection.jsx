import { motion } from "motion/react";
import { Play } from "lucide-react";
import { Badge } from "./ui/badge";
import exampleImage from 'figma:asset/6bc0e44ea9cc8d7a3ee0bbc4708fba46f37ec978.png';
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Platform } from "../App";

interface ProductPreviewSectionProps {
  platform: Platform;
}

export function ProductPreviewSection({ platform }: ProductPreviewSectionProps) {
  const platformNames = {
    linkedin: "LinkedIn",
    reddit: "Reddit",
    facebook: "Facebook",
  };

  const platformColors = {
    linkedin: "from-blue-600 to-blue-400",
    reddit: "from-orange-600 to-orange-400",
    facebook: "from-blue-700 to-blue-500",
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br ${platformColors[platform]} rounded-full blur-3xl opacity-20`}
      />

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200">
            Live Demo
          </Badge>
          <h2 className="text-4xl md:text-5xl text-slate-900 mb-4">
            See {platformNames[platform]} Scheduler in Action
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Watch how creators transform their {platformNames[platform]} workflow with automation
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 group cursor-pointer"
          >
            <ImageWithFallback
              src={exampleImage}
              alt={`${platformNames[platform]} Scheduler Dashboard`}
              className="w-full h-auto"
            />
            
            {/* Play Button Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent flex items-center justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`w-20 h-20 rounded-full bg-gradient-to-br ${platformColors[platform]} flex items-center justify-center shadow-2xl`}
              >
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </motion.div>
            </motion.div>

            {/* Decorative Corner Elements */}
            <div className="absolute top-4 left-4 w-3 h-3 border-l-2 border-t-2 border-white/50 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-3 h-3 border-r-2 border-t-2 border-white/50 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-3 h-3 border-l-2 border-b-2 border-white/50 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-3 h-3 border-r-2 border-b-2 border-white/50 rounded-br-lg" />
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute -left-8 top-1/4 hidden lg:block"
          >
            <div className="bg-white rounded-2xl shadow-xl p-4 border border-slate-200">
              <div className="text-3xl mb-1">⚡</div>
              <div className="text-sm text-slate-600">10x Faster</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute -right-8 bottom-1/4 hidden lg:block"
          >
            <div className="bg-white rounded-2xl shadow-xl p-4 border border-slate-200">
              <div className="text-3xl mb-1">📈</div>
              <div className="text-sm text-slate-600">3x Engagement</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
