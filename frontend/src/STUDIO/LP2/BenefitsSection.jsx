import { motion } from "motion/react";
import { Clock, Target, Users, TrendingUp, Shield, Zap } from "lucide-react";

export function BenefitsSection() {
  const benefits = [
    {
      icon: Clock,
      title: "Save 20+ hours every week",
      description: "Automate your entire multi-platform workflow and reclaim your time for strategic work.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Target,
      title: "AI-driven engagement",
      description: "Our AI analyzes what works across all platforms and generates content optimized for maximum reach.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Built for everyone",
      description: "Creators, founders, marketers, agencies — anyone looking to grow their social presence.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: TrendingUp,
      title: "3.5x better results",
      description: "Our users see an average 3.5x increase in engagement across all connected platforms.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Shield,
      title: "Secure & reliable",
      description: "Enterprise-grade security with 99.9% uptime. Your accounts and data are always protected.",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: Zap,
      title: "Lightning fast",
      description: "Publish to all platforms simultaneously. What used to take hours now takes seconds.",
      gradient: "from-yellow-500 to-orange-500",
    },
  ];

  return (
    <section id="benefits" className="py-20 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl"
      />

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl text-white mb-4">
            Why Choose Skeylet
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Join thousands transforming their social media presence
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group"
            >
              <motion.div
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex gap-4 items-start bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-2xl p-6 h-full relative overflow-hidden"
              >
                {/* Gradient Overlay on Hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.1 }}
                  className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient}`}
                />
                
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 relative"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shadow-lg`}>
                    <benefit.icon className="w-7 h-7 text-white" />
                  </div>
                </motion.div>
                
                <div className="relative">
                  <h3 className="text-xl text-white mb-2">{benefit.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{benefit.description}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
