import { motion } from "motion/react";
import { Sparkles, Calendar, Zap, BarChart3, Wand2, Share2 } from "lucide-react";
import { Card } from "../LANDING-PAGE/ui/card";

export function FeaturesSection() {
  const features = [
    {
      icon: Wand2,
      title: "AI Content Generation",
      description: "Create engaging posts for LinkedIn, Reddit, Facebook, Instagram & Twitter with AI that understands each platform's unique style.",
      gradient: "from-purple-500 via-pink-500 to-rose-500",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Schedule posts across all platforms at optimal times for maximum engagement. Set it once, reach everywhere.",
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
    },
    {
      icon: Zap,
      title: "Auto-Publishing",
      description: "Automatic posting to all your connected platforms. No manual work, no missed posts, just results.",
      gradient: "from-orange-500 via-red-500 to-pink-500",
    },
    {
      icon: BarChart3,
      title: "Unified Analytics",
      description: "Track performance across all platforms in one dashboard. Detailed insights and actionable metrics.",
      gradient: "from-green-500 via-emerald-500 to-teal-500",
    },
    {
      icon: Share2,
      title: "Cross-Platform Publishing",
      description: "Post to LinkedIn, Reddit, Facebook, Instagram & Twitter simultaneously with platform-optimized content.",
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Optimization",
      description: "Continuously learn what works best for your audience and optimize content for each platform automatically.",
      gradient: "from-yellow-500 via-orange-500 to-red-500",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <div className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full backdrop-blur-sm">
              <span className="text-sm text-purple-300">Powerful Features</span>
            </div>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl text-white mb-4">
            Everything you need for
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Social Media Success
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            From content creation to performance tracking across all major platforms
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -12, scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 border-2 border-slate-800 hover:border-purple-500/50 bg-gradient-to-br from-slate-900 to-slate-800 transition-all duration-300 h-full relative overflow-hidden group">
                  {/* Animated Gradient Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.1 }}
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`}
                  />
                  
                  {/* Glow Effect */}
                  <motion.div
                    animate={{
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2,
                    }}
                    className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
                  />
                  
                  <div className="relative">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-2xl`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
