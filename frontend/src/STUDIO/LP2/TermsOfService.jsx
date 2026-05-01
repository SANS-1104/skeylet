import { motion } from "motion/react";
import {
  FileText,
  Mail,
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Users,
  Code,
  Lock,
  Ban,
} from "lucide-react";
import { Button } from "../LANDING-PAGE/ui/button";

export function TermsOfService() {
  const sections = [
    {
      title: "Acceptance of Terms",
      icon: CheckCircle2,
      color: "from-green-500 to-emerald-500",
      content: [
        "By accessing or using Skeylet ('the Service'), you agree to be bound by these Terms of Service ('Terms'). If you do not agree to these Terms, you may not use the Service.",
        "These Terms constitute a legally binding agreement between you and Skeylet. By creating an account, you acknowledge that you have read, understood, and agree to be bound by these Terms.",
        "We reserve the right to update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms.",
      ],
    },

    {
      title: "Eligibility",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      content: [
        "You must be at least 18 years old to use Skeylet.",
        "You must provide accurate and complete information during registration.",
        "You must have the legal capacity to enter into binding contracts.",
        "You represent that all information you provide is truthful and accurate.",
        "If you are using the Service on behalf of an organization, you have the authority to bind that organization to these Terms.",
      ],
    },

    {
      title: "Account Registration and Security",
      icon: Lock,
      color: "from-purple-500 to-pink-500",
      content: [
        "Account Creation:",
        "• You must create an account to use Skeylet",
        "• You are responsible for maintaining the security of your account credentials",
        "• You must not share your account with others",
        "• You are responsible for all activities under your account",
        "",
        "Security:",
        "• Use a strong, unique password",
        "• Notify us immediately at skeylet123@gmail.com of any unauthorized access",
        "• We are not liable for losses due to unauthorized account access",
        "• You must not attempt to gain unauthorized access to other accounts or systems",
      ],
    },

    // ... keep all sections unchanged ...
  ];

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </a>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl text-white">Skeylet</span>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
        />

        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full backdrop-blur-sm mb-6"
            >
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-200">Legal Agreement</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl text-white mb-6">Terms of Service</h1>
            <p className="text-xl text-slate-400 mb-4">Last Updated: November 14, 2025</p>

            <p className="text-slate-300 max-w-2xl mx-auto">
              Please read these terms carefully before using Skeylet. By using our service, you agree to be bound by these terms.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 pb-20">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon; // <-- JSX fix

              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.02 }}
                  className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 relative overflow-hidden group"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.1 }}
                    className={`absolute inset-0 bg-gradient-to-br ${section.color}`}
                  />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </motion.div>

                      <h2 className="text-2xl text-white">{section.title}</h2>
                    </div>

                    <div className="space-y-3">
                      {section.content.map((text, i) => (
                        <p key={i} className="text-slate-300 leading-relaxed">
                          {text}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-2xl p-8"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl text-amber-300 mb-3">Important Notice</h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  By using Skeylet, you acknowledge that you agree to these Terms of Service, our Privacy Policy, and Refund Policy.
                </p>
                <p className="text-slate-400 text-sm">
                  These Terms may be updated from time to time. Continued use after updates constitutes acceptance.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-2xl p-8 text-center"
          >
            <Mail className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl text-white mb-3">Questions About These Terms?</h3>
            <p className="text-slate-300 mb-6 max-w-xl mx-auto">
              If you have any questions, please contact us.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-6 rounded-xl">
                <Mail className="mr-2 h-5 w-5" />
                Contact Us: skeylet123@gmail.com
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
