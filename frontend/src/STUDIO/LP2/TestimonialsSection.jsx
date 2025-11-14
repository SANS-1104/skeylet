import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { Card } from "../LANDING-PAGE/ui/card";
import { Avatar } from "../LANDING-PAGE/ui/avatar";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      company: "TechCorp",
      avatar: "SC",
      rating: 5,
      text: "Skeylet transformed our strategy across all platforms. We've seen 3x engagement growth in just 2 months. The AI content generation is incredibly smart!",
    },
    {
      name: "Marcus Johnson",
      role: "Freelance Designer",
      company: "Independent",
      avatar: "MJ",
      rating: 5,
      text: "I was spending 15+ hours weekly on social media. Now it takes me 1 hour to plan an entire month across LinkedIn, Reddit, and Facebook. Absolute game-changer!",
    },
    {
      name: "Emily Rodriguez",
      role: "Startup Founder",
      company: "GrowthLabs",
      avatar: "ER",
      rating: 5,
      text: "The multi-platform automation is flawless. One click and my content goes live everywhere, perfectly optimized for each platform's audience. Worth every penny!",
    },
  ];

  return (
    <section id="testimonials" className="py-20 px-4 relative overflow-hidden">
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 180],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
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
            Loved by professionals worldwide
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Join thousands who've transformed their social presence
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -12, scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 border-2 border-slate-800 hover:border-purple-500/50 bg-gradient-to-br from-slate-900 to-slate-800 h-full relative overflow-hidden group">
                  {/* Quote Icon */}
                  <Quote className="absolute top-4 right-4 w-12 h-12 text-purple-500/10 group-hover:text-purple-500/20 transition-colors" />
                  
                  {/* Gradient Glow */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.1 }}
                    className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500"
                  />
                  
                  <div className="relative">
                    {/* Star Rating */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                        >
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-slate-300 mb-6 leading-relaxed">
                      "{testimonial.text}"
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                        {testimonial.avatar}
                      </Avatar>
                      <div>
                        <div className="text-white">{testimonial.name}</div>
                        <div className="text-sm text-slate-400">
                          {testimonial.role}, {testimonial.company}
                        </div>
                      </div>
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
