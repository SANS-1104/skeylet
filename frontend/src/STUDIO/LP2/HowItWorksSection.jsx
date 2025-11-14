import { motion } from "motion/react";
import { Lightbulb, Pencil, Send, BarChart } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      icon: Lightbulb,
      title: "Connect Your Platforms",
      description: "Link your LinkedIn, Reddit, Facebook, Instagram & Twitter accounts in seconds",
      color: "from-yellow-500 to-orange-500",
      step: "01",
    },
    {
      icon: Pencil,
      title: "Create with AI",
      description: "Generate platform-optimized content using our advanced AI that understands your brand voice",
      color: "from-blue-500 to-cyan-500",
      step: "02",
    },
    {
      icon: Send,
      title: "Schedule & Publish",
      description: "Set your posting schedule and let automation handle the rest across all platforms",
      color: "from-purple-500 to-pink-500",
      step: "03",
    },
    {
      icon: BarChart,
      title: "Track & Optimize",
      description: "Monitor performance, gain insights, and continuously improve your social strategy",
      color: "from-green-500 to-emerald-500",
      step: "04",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/4 left-10 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
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
            How It Works
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Four simple steps to transform your social media presence
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                  className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent origin-left"
                />
              )}
              
              <motion.div
                whileHover={{ y: -10, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700 hover:border-purple-500/50 rounded-2xl p-6 backdrop-blur-sm overflow-hidden group">
                  {/* Gradient Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.1 }}
                    className={`absolute inset-0 bg-gradient-to-br ${step.color}`}
                  />
                  
                  {/* Step Number */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1, type: "spring" }}
                    className="absolute top-4 right-4 text-6xl font-bold bg-gradient-to-br from-slate-800 to-slate-900 bg-clip-text text-transparent opacity-20"
                  >
                    {step.step}
                  </motion.div>
                  
                  <div className="relative">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <step.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    
                    <h3 className="text-xl text-white mb-2">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
