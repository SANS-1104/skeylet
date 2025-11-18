import { motion } from "motion/react";
import { Button } from "../LANDING-PAGE/ui/button";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Navbar/AuthContext";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";


export function FinalCTASection({ onScrollToPricing }) {
  const benefits = [
    "No credit card required",
    "14-day free trial",
    "Cancel anytime",
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
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <motion.div
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)",
            backgroundSize: "100% 100%",
          }}
        />
        
        {/* Floating Elements */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm mb-8"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white">Join 10,000+ professionals</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl text-white mb-6 leading-tight"
          >
            Ready to transform your
            <br />
            social media presence?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
          >
            Start automating across LinkedIn, Reddit & Facebook today.
            No credit card required.
          </motion.p>

          {/* Benefits List */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-2 text-white/90"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-slate-50 px-12 py-8 rounded-xl shadow-2xl text-lg relative overflow-hidden group"
              onClick={handleLogin}
            >
              <motion.div
                animate={{
                  x: [0, 200],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-purple-200/30 to-transparent skew-x-12"
              />
              <span className="relative">Start Trial</span>
              <ArrowRight className="ml-2 h-5 w-5 relative group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Trust Badge */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-white/70 text-sm mt-6"
          >
            Trusted by professionals at Google, Meta, Amazon & 1,000+ companies
          </motion.p>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-full"
      />
      <motion.div
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-10 right-10 w-32 h-32 border-2 border-white/20 rounded-full"
      />
    </section>
  );
}