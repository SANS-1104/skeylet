import { motion } from "motion/react";
import { Linkedin, MessageSquare, Facebook } from "lucide-react";
import { Platform } from "../App";

interface PlatformToggleProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
}

export function PlatformToggle({ selectedPlatform, onPlatformChange }: PlatformToggleProps) {
  const platforms = [
    { id: "linkedin" as Platform, name: "LinkedIn", Icon: Linkedin, color: "from-blue-600 to-blue-400" },
    { id: "reddit" as Platform, name: "Reddit", Icon: MessageSquare, color: "from-orange-600 to-orange-400" },
    { id: "facebook" as Platform, name: "Facebook", Icon: Facebook, color: "from-blue-700 to-blue-500" },
  ];

  return (
    <section className="py-12 px-4 relative z-10">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl text-slate-900 mb-3">
            Choose Your Platform
          </h2>
          <p className="text-slate-600">
            See how we help you dominate on each social network
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center gap-4 flex-wrap"
        >
          {platforms.map((platform) => {
            const isSelected = selectedPlatform === platform.id;
            return (
              <motion.button
                key={platform.id}
                onClick={() => onPlatformChange(platform.id)}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-8 py-4 rounded-2xl border-2 transition-all duration-300 ${
                  isSelected
                    ? "bg-white shadow-lg border-transparent"
                    : "bg-white/50 border-slate-200 hover:border-slate-300"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="platform-background"
                    className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-10 rounded-2xl`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${platform.color} shadow-md`}
                  >
                    <platform.Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`${isSelected ? "text-slate-900" : "text-slate-600"}`}>
                    {platform.name}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
