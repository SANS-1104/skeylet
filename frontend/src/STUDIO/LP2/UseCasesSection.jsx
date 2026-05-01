import { motion } from "motion/react";
import { Briefcase, Rocket, GraduationCap, Building } from "lucide-react";
import { Card } from "../LANDING-PAGE/ui/card";

export function UseCasesSection() {
  const useCases = [
    {
      icon: Briefcase,
      title: "Job Seekers",
      description: "Build your professional brand and get noticed by recruiters across LinkedIn and beyond.",
      gradient: "from-blue-500 to-cyan-500",
      stats: "2x more profile views",
    },
    {
      icon: Rocket,
      title: "Entrepreneurs",
      description: "Grow your startup's presence and connect with investors on all major platforms.",
      gradient: "from-purple-500 to-pink-500",
      stats: "5x more leads",
    },
    {
      icon: GraduationCap,
      title: "Creators",
      description: "Showcase your expertise and attract clients through consistent multi-platform posting.",
      gradient: "from-orange-500 to-red-500",
      stats: "3x client inquiries",
    },
    {
      icon: Building,
      title: "Agencies",
      description: "Manage multiple client accounts and scale your content operations effortlessly.",
      gradient: "from-green-500 to-emerald-500",
      stats: "20+ accounts managed",
    },
  ];

  return (
    <section className="py-20 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl text-white mb-4">
            Perfect for Every Professional
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Whether you're job hunting, building, or growing your brand
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -15, scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 border-2 border-slate-800 hover:border-purple-500/50 bg-gradient-to-br from-slate-900 to-slate-800 h-full relative overflow-hidden group">
                  {/* Glow Effect */}
                  <motion.div
                    animate={{
                      opacity: [0, 0.2, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                    className={`absolute -inset-1 bg-gradient-to-r ${useCase.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
                  />
                  
                  <div className="relative">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <useCase.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    
                    <h3 className="text-xl text-white mb-2">{useCase.title}</h3>
                    <p className="text-slate-400 mb-4 text-sm leading-relaxed">
                      {useCase.description}
                    </p>
                    
                    <div className={`inline-block px-3 py-1.5 rounded-full bg-gradient-to-r ${useCase.gradient} bg-opacity-10 text-sm text-white border border-white/10`}>
                      {useCase.stats}
                    </div>
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
