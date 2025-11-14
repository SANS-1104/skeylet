import { motion } from "motion/react";
import { Shield, Mail, ArrowLeft } from "lucide-react";
import { Button } from "../LANDING-PAGE/ui/button";

export function PrivacyPolicy() {
  const sections = [
    {
      title: "Information We Collect",
      content: [
        "When you use Skeylet, we collect information that you provide directly to us, including:",
        "• Account information (name, email address, password)",
        "• Social media account connections and credentials (stored securely)",
        "• Content you create, schedule, and publish through our platform",
        "• Usage data and analytics about how you interact with our service",
        "• Payment information (processed securely through third-party payment processors)",
        "• Communications between you and Skeylet support",
      ],
    },
    {
      title: "How We Use Your Information",
      content: [
        "We use the information we collect to:",
        "• Provide, maintain, and improve our services",
        "• Process your transactions and send related information",
        "• Send you technical notices, updates, and support messages",
        "• Respond to your comments and questions",
        "• Generate AI-powered content for your social media posts",
        "• Schedule and publish posts to your connected social media accounts",
        "• Provide analytics and insights about your social media performance",
        "• Detect, prevent, and address technical issues and security threats",
      ],
    },
    {
      title: "Information Sharing",
      content: [
        "We do not sell your personal information. We may share your information only in the following circumstances:",
        "• With social media platforms (LinkedIn, Reddit, Facebook) when you authorize us to publish content on your behalf",
        "• With service providers who perform services on our behalf (hosting, analytics, customer support)",
        "• When required by law or to respond to legal processes",
        "• To protect the rights, property, and safety of Skeylet, our users, or the public",
        "• In connection with a merger, acquisition, or sale of assets (with notice to you)",
      ],
    },
    {
      title: "Data Security",
      content: [
        "We implement industry-standard security measures to protect your information:",
        "• All data transmission is encrypted using SSL/TLS protocols",
        "• Passwords are hashed using bcrypt",
        "• Social media credentials are encrypted at rest",
        "• Regular security audits and penetration testing",
        "• Access controls and authentication for our systems",
        "• However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security",
      ],
    },
    {
      title: "Your Rights and Choices",
      content: [
        "You have the right to:",
        "• Access, update, or delete your personal information",
        "• Export your data in a portable format",
        "• Opt-out of marketing communications",
        "• Disconnect social media accounts at any time",
        "• Request a copy of your data",
        "• Close your account and delete all associated data",
        "To exercise these rights, contact us at skeylet123@gmail.com",
      ],
    },
    {
      title: "Cookies and Tracking",
      content: [
        "We use cookies and similar tracking technologies to:",
        "• Keep you logged in",
        "• Remember your preferences",
        "• Understand how you use our service",
        "• Improve our platform",
        "You can control cookies through your browser settings, but this may limit some functionality.",
      ],
    },
    {
      title: "Third-Party Services",
      content: [
        "Our service integrates with third-party platforms:",
        "• LinkedIn, Reddit, and Facebook (for content publishing)",
        "• Payment processors (Stripe, PayPal)",
        "• Analytics services (Google Analytics)",
        "• Cloud hosting providers (AWS, Google Cloud)",
        "These services have their own privacy policies, and we encourage you to review them.",
      ],
    },
    {
      title: "Data Retention",
      content: [
        "We retain your information for as long as your account is active or as needed to provide services. When you delete your account:",
        "• Personal data is deleted within 30 days",
        "• Backup copies are deleted within 90 days",
        "• We may retain certain information as required by law or for legitimate business purposes",
      ],
    },
    {
      title: "Children's Privacy",
      content: [
        "Skeylet is not intended for users under 18 years of age. We do not knowingly collect information from children under 18. If you believe we have collected information from a child, please contact us immediately at skeylet123@gmail.com.",
      ],
    },
    {
      title: "International Users",
      content: [
        "If you are accessing Skeylet from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States. By using our service, you consent to this transfer.",
      ],
    },
    {
      title: "Changes to This Policy",
      content: [
        "We may update this Privacy Policy from time to time. We will notify you of any material changes by:",
        "• Posting the new policy on this page",
        "• Updating the 'Last Updated' date",
        "• Sending an email notification (for significant changes)",
        "Your continued use of Skeylet after changes become effective constitutes acceptance of the updated policy.",
      ],
    },
    {
      title: "Contact Us",
      content: [
        "If you have questions or concerns about this Privacy Policy, please contact us:",
        "• Email: skeylet123@gmail.com",
        "• We aim to respond to all inquiries within 48 hours",
      ],
    },
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl text-white">Skeylet</span>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-purple-500/20 rounded-full backdrop-blur-sm mb-6"
            >
              <Shield className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-slate-200">Your Privacy Matters</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-slate-400 mb-4">
              Last Updated: November 14, 2025
            </p>
            <p className="text-slate-300 max-w-2xl mx-auto">
              At Skeylet, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12 px-4 pb-20">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8"
              >
                <h2 className="text-2xl text-white mb-4 flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  />
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.content.map((text, i) => (
                    <p key={i} className="text-slate-300 leading-relaxed">
                      {text}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-2xl p-8 text-center"
          >
            <Mail className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl text-white mb-3">Questions About Your Privacy?</h3>
            <p className="text-slate-300 mb-6 max-w-xl mx-auto">
              We're here to help. If you have any questions or concerns about how we handle your data, please don't hesitate to reach out.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white px-8 py-6 rounded-xl"
              >
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
