import { motion, useScroll, useTransform } from "motion/react";
import { Button } from "../LANDING-PAGE/ui/button";
import { ArrowRight, Play, Linkedin, MessageSquare, Facebook } from "lucide-react";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Navbar/AuthContext";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

export function HeroSection({ onScrollToPricing }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  const platforms = [
    { Icon: Linkedin, color: "from-blue-600 to-blue-400", name: "LinkedIn", delay: 0, position: "top-[20%] left-[8%]" },
    { Icon: MessageSquare, color: "from-orange-600 to-orange-400", name: "Reddit", delay: 0.15, position: "top-[30%] right-[10%]" },
    { Icon: Facebook, color: "from-blue-700 to-blue-500", name: "Facebook", delay: 0.3, position: "bottom-[30%] left-[12%]" },
  ];


  const navigate = useNavigate();
  const { isLoggedIn, name } = useContext(AuthContext);
  const handleLogin = async () => {
    if (!isLoggedIn) {
      // Not logged in → go to auth
      navigate("/auth");
      return;
    }

    try {
      // Logged in → check payment status
      const res = await axiosClient.get("/paymentStatus");
      const { status } = res.data;      

      if (status === "active") {
        // User has an active plan → dashboard
        navigate(`/dashboard/${name}`);
      } else {
        // User logged in but no active plan → pricing section
        onScrollToPricing?.();
      }
    } catch (err) {
      console.error("Error fetching payment status:", err);
      onScrollToPricing?.();
    }
  };
  const { logout: authLogout } = useContext(AuthContext);
  const handleLogout = () => {
    authLogout();
    toast.success('Logged Out Successfully', { autoClose: 1000 });
    navigate('/');
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <section className="relative min-h-screen pt-32 pb-20 px-4 overflow-hidden flex items-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Grid Pattern with Animation */}
        <motion.div
          animate={{
            backgroundPosition: ["0px 0px", "64px 64px"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e510_1px,transparent_1px),linear-gradient(to_bottom,#4f46e510_1px,transparent_1px)] bg-[size:4rem_4rem]"
        />
        
        {/* Gradient Orbs with Complex Animation */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
            x: [0, 50, -30, 0],
            y: [0, -50, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1.2, 1],
            rotate: [360, 270, 180, 90, 0],
            x: [0, -50, 30, 0],
            y: [0, 50, -30, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/30 via-cyan-500/30 to-teal-500/30 rounded-full blur-3xl"
        />
        
        {/* Enhanced Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100 - i * 5, 0],
              x: [0, Math.sin(i) * 50, 0],
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
        
        {/* Spiral Lines */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`line-${i}`}
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute w-full h-full"
            style={{
              background: `conic-gradient(from ${i * 72}deg, transparent 0deg, rgba(139, 92, 246, 0.1) ${i * 10}deg, transparent ${i * 20}deg)`,
            }}
          />
        ))}
      </div>

      <motion.div style={{ y, opacity, scale }} className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            {/* Badge with Advanced Animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(139, 92, 246, 0)",
                    "0 0 20px rgba(139, 92, 246, 0.3)",
                    "0 0 20px rgba(139, 92, 246, 0)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full backdrop-blur-sm inline-flex"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                <span className="text-sm text-slate-200">Multi-Platform Social Automation</span>
              </motion.div>
            </motion.div>

            {/* Main Headline with Advanced Text Animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-5xl md:text-7xl text-white leading-tight">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Dominate Every
                </motion.span>
                <br />
                <span className="relative inline-block">
                  <motion.span
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="bg-gradient-to-r from-indigo-400 via-purple-400 via-pink-400 to-indigo-400 bg-[length:200%_auto] bg-clip-text text-transparent"
                    style={{ backgroundSize: "200% auto" }}
                  >
                    Social Platform
                  </motion.span>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: 1.5,
                      delay: 0.5,
                    }}
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 origin-left"
                  />
                  {/* Animated dots along underline */}
                  <motion.div
                    animate={{
                      x: [0, 100, 200, 300],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 1.5,
                    }}
                    className="absolute -bottom-2 left-0 w-2 h-2 bg-white rounded-full"
                  />
                </span>
              </h1>
            </motion.div>

            {/* Subtitle with Typing Effect */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-300 max-w-xl leading-relaxed"
            >
              AI-powered content creation, smart scheduling, and auto-publishing for{" "}
              <motion.span
                animate={{ color: ["#60A5FA", "#A78BFA", "#F472B6", "#60A5FA"] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="font-semibold"
              >
                LinkedIn, Reddit & Facebook
              </motion.span>{" "}
              — all from one powerful dashboard.
            </motion.p>

            {/* Platform Icons with Advanced Hover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-4 flex-wrap"
            >
              <span className="text-slate-400 text-sm">Works with:</span>
              {platforms.map(({ Icon, color, name }, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 200 }}
                  whileHover={{ 
                    scale: 1.3, 
                    rotate: [0, -10, 10, -10, 0],
                    transition: { duration: 0.5 }
                  }}
                  className={`relative w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-lg cursor-pointer`}
                  title={name}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                    className={`absolute inset-0 rounded-lg bg-gradient-to-br ${color}`}
                  />
                  <Icon className="w-5 h-5 text-white relative z-10" />
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons with Advanced Effects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white px-8 py-7 rounded-xl shadow-xl shadow-purple-500/30 relative overflow-hidden group"
                  onClick={handleLogin}
                >
                  <motion.div
                    animate={{
                      x: [-200, 200],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />
                  <span className="relative">Start Trial</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5 relative" />
                  </motion.div>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-7 rounded-xl border-2 border-slate-700 hover:border-purple-500 hover:bg-purple-500/10 text-white backdrop-blur-sm relative overflow-hidden group"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-purple-500/20 rounded-full"
                  />
                  <Play className="mr-2 h-5 w-5 relative z-10" />
                  <span className="relative z-10">Watch Demo</span>
                </Button> */}
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column - Demo Video with Advanced Animations */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Floating Platform Icons with Advanced Animations */}
            {platforms.map(({ Icon, color, name, delay, position }, index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.8 + delay,
                  type: "spring",
                  stiffness: 200,
                }}
                className={`absolute hidden lg:block ${position} z-10`}
              >
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4 + index * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  whileHover={{ 
                    scale: 1.3, 
                    rotate: 360,
                    transition: { duration: 0.6 }
                  }}
                  className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl shadow-2xl flex items-center justify-center cursor-pointer backdrop-blur-sm border border-white/20 relative`}
                >
                  {/* Pulse Effect */}
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.4,
                    }}
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color}`}
                  />
                  <Icon className="w-8 h-8 text-white relative z-10" />
                </motion.div>
              </motion.div>
            ))}

            {/* Video Container with Advanced Effects */}
            <motion.div
              whileHover={{ scale: 1.03, rotateY: 5, rotateX: 5 }}
              transition={{ duration: 0.4 }}
              style={{ perspective: 1000 }}
              className="relative aspect-video rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-gradient-to-br from-slate-900 to-slate-800"
            >
              {/* Animated Scanline Effect */}
              <motion.div
                animate={{
                  y: ["-100%", "200%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 w-full h-20 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent pointer-events-none z-20"
              />
              
              {/* Video Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="absolute inset-0 bg-white rounded-full blur-2xl"
                  />
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl cursor-pointer relative overflow-hidden group">
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    <Play className="w-10 h-10 text-white ml-1 relative z-10" fill="white" />
                  </div>
                </motion.div>
              </div>

              {/* Animated Background Pattern */}
              <motion.div
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "linear-gradient(45deg, #4f46e5 25%, transparent 25%, transparent 75%, #4f46e5 75%, #4f46e5), linear-gradient(45deg, #4f46e5 25%, transparent 25%, transparent 75%, #4f46e5 75%, #4f46e5)",
                  backgroundSize: "60px 60px",
                  backgroundPosition: "0 0, 30px 30px",
                }}
              />

              {/* Corner Accents with Animation */}
              {[
                { corner: "top-4 left-4", border: "border-l-2 border-t-2", radius: "rounded-tl-lg" },
                { corner: "top-4 right-4", border: "border-r-2 border-t-2", radius: "rounded-tr-lg" },
                { corner: "bottom-4 left-4", border: "border-l-2 border-b-2", radius: "rounded-bl-lg" },
                { corner: "bottom-4 right-4", border: "border-r-2 border-b-2", radius: "rounded-br-lg" },
              ].map((accent, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className={`absolute ${accent.corner} w-4 h-4 ${accent.border} border-purple-400 ${accent.radius}`}
                />
              ))}
            </motion.div>

            {/* Decorative Rotating Elements */}
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-10 -right-10 w-24 h-24 border-2 border-dashed border-purple-500/30 rounded-full"
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full"
              />
            </motion.div>
            <motion.div
              animate={{
                rotate: -360,
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -bottom-10 -left-10 w-32 h-32 border-2 border-dashed border-blue-500/30 rounded-full"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}