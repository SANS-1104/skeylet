import { motion } from "motion/react";
import { Sparkles, Twitter, Linkedin, Github, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Footer() {
  const navigate = useNavigate();

  const footerSections = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Testimonials", "FAQ"],
    },
    {
      title: "Company",
      links: ["About", "Blog", "Careers", "Contact"],
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Refund Policy", "Terms of Service"],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  // Helper function to handle internal routes
  const handleRoute = (link) => {
    if (link === "Privacy Policy") {
      navigate("/privacy");
    } else if (link === "Refund Policy") {
      navigate("/refund");
    } 
    else if (link === "Terms of Service") {
      navigate("/terms");
    }
      else {
      // You can handle other links or scroll to section if needed
      console.log(`${link} clicked`);
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-white py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 mb-4 cursor-pointer"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl">Skeylet</span>
            </motion.div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Automate your social media across all major platforms with AI-powered content creation.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-lg flex items-center justify-center transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 text-white">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <motion.li
                    key={link}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 }}
                  >
                    <motion.a
                      onClick={() => handleRoute(link)}
                      whileHover={{ x: 5 }}
                      className="text-slate-400 hover:text-white transition-colors text-sm inline-block cursor-pointer"
                    >
                      {link}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">© 2025 Skeylet. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <motion.a
              onClick={() => navigate("/privacy")}
              whileHover={{ scale: 1.05 }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy
            </motion.a>
            <motion.a
              onClick={() => navigate("/refund")}
              whileHover={{ scale: 1.05 }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Refund
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              className="hover:text-white transition-colors"
            >
              Cookies
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}
