import { motion } from "motion/react";
import { Users, FileText, TrendingUp, Clock } from "lucide-react";

export function StatsSection() {
  const stats = [
    { icon: Users, value: "10K+", label: "Active Users", color: "from-blue-500 to-cyan-500" },
    { icon: FileText, value: "500K+", label: "Posts Published", color: "from-purple-500 to-pink-500" },
    { icon: TrendingUp, value: "3.5x", label: "Avg Engagement Boost", color: "from-orange-500 to-red-500" },
    { icon: Clock, value: "20hrs", label: "Saved per Month", color: "from-green-500 to-emerald-500" },
  ];

  return (
    <section className="py-20 px-4 relative">
      {/* Animated Background Lines */}
      <motion.div
        animate={{
          backgroundPosition: ["0px 0px", "100px 100px"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #8b5cf6 0, #8b5cf6 1px, transparent 0, transparent 50%)",
          backgroundSize: "10px 10px",
        }}
      />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -15, scale: 1.05 }}
              className="relative group"
            >
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm overflow-hidden">
                {/* Animated Gradient Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.15 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color}`}
                />
                
                {/* Pulsing Glow Effect */}
                <motion.div
                  animate={{
                    opacity: [0, 0.3, 0],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} blur-xl`}
                />
                
                <div className="relative z-10">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    whileHover={{
                      scale: 1.2,
                      rotate: [0, -180, -360],
                      transition: { duration: 0.6 },
                    }}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg relative`}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className={`absolute inset-0 rounded-xl bg-gradient-to-br ${stat.color}`}
                    />
                    <stat.icon className="w-6 h-6 text-white relative z-10" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.2 + index * 0.1,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="text-4xl text-white mb-2"
                  >
                    {stat.value}
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="text-slate-400 text-sm"
                  >
                    {stat.label}
                  </motion.div>
                </div>

                {/* Particle Effect on Hover */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: [0, (i % 2 ? 20 : -20) * Math.cos(i * 60)],
                      y: [0, (i % 2 ? 20 : -20) * Math.sin(i * 60)],
                    }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className={`absolute w-1 h-1 rounded-full bg-gradient-to-r ${stat.color}`}
                    style={{
                      left: "50%",
                      top: "50%",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}