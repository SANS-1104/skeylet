import { motion, useScroll, useTransform } from "motion/react";
import { Button } from "../LANDING-PAGE/ui/button";
import { Sparkles, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Navbar/AuthContext";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";


export function Header2() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(2, 6, 23, 0)", "rgba(2, 6, 23, 0.8)"]
  );
  const navigate = useNavigate();
  const { logout: authLogout } = useContext(AuthContext);
    const handleLogout = () => {
      authLogout();
      toast.success('Logged Out Successfully', { autoClose: 1000 });
      navigate('/');
      window.dispatchEvent(new Event("storage"));
    };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      style={{ backgroundColor }}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
        isScrolled ? "border-white/10" : "border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <span className="text-xl text-white">Skeylet</span>
        </motion.div>

        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hidden md:flex items-center gap-8"
        >
          {["Features", "How It Works", "Pricing", "Testimonials"].map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              whileHover={{ scale: 1.1 }}
              className="text-slate-300 hover:text-white transition-colors relative group"
            >
              {item}
              <motion.span
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"
              />
            </motion.a>
          ))}
        </motion.nav>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          {/* <Button variant="ghost" className="hidden sm:inline-flex text-slate-300 hover:text-white hover:bg-white/10">
            Sign In
          </Button> */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/30"
                onClick={handleLogout}
            >
              Log Out
            </Button>
          </motion.div>
          <Button variant="ghost" size="icon" className="md:hidden text-white">
            <Menu className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </motion.header>
  );
}
