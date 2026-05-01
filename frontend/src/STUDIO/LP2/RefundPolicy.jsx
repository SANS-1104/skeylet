import { motion } from "motion/react";
import { DollarSign, Mail, ArrowLeft, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "../LANDING-PAGE/ui/button";

export function RefundPolicy() {
  const sections = [
    {
      title: "30-Day Money-Back Guarantee",
      icon: CheckCircle2,
      color: "from-green-500 to-emerald-500",
      content: [
        "We stand behind the quality of Skeylet. If you're not completely satisfied with your purchase, we offer a full refund within 30 days of your initial purchase.",
        "This guarantee applies to all new subscriptions, whether monthly or annual plans.",
        "No questions asked - we want you to be completely happy with your decision to use Skeylet.",
      ],
    },
    {
      title: "Eligibility for Refunds",
      icon: CheckCircle2,
      color: "from-blue-500 to-cyan-500",
      content: [
        "You are eligible for a full refund if:",
        "• Your refund request is made within 30 days of purchase",
        "• You are a first-time subscriber (not applicable to renewals)",
        "• You have not violated our Terms of Service",
        "• Your account has not been suspended or terminated for misuse",
        "",
        "Refunds are processed for:",
        "• New annual plan purchases ($50/year)",
        "• First-time subscriptions only",
      ],
    },
    {
      title: "How to Request a Refund",
      icon: Mail,
      color: "from-purple-500 to-pink-500",
      content: [
        "To request a refund, please follow these steps:",
        "",
        "1. Email us at skeylet123@gmail.com",
        "2. Include in your email:",
        "   • Your account email address",
        "   • Purchase date and transaction ID",
        "   • Brief reason for the refund request (optional but helpful)",
        "",
        "3. We will respond within 24-48 hours",
        "4. Once approved, refunds are processed within 5-7 business days",
        "5. The refund will be credited to your original payment method",
      ],
    },
    {
      title: "Processing Time",
      icon: Clock,
      color: "from-orange-500 to-red-500",
      content: [
        "Refund processing timeline:",
        "• Request acknowledgment: Within 24-48 hours",
        "• Refund approval: Within 3 business days",
        "• Credit to your account: 5-7 business days (may vary by bank/card issuer)",
        "",
        "Please note: The time it takes for the refund to appear in your account depends on your financial institution's processing times.",
      ],
    },
    {
      title: "What Happens After a Refund",
      icon: AlertCircle,
      color: "from-yellow-500 to-orange-500",
      content: [
        "Once your refund is processed:",
        "• Your subscription will be immediately canceled",
        "• Access to premium features will be removed",
        "• Your account will revert to a free trial status (if applicable)",
        "• Scheduled posts will no longer be published",
        "• All data remains accessible for 30 days for export",
        "• After 30 days, your account and data will be permanently deleted unless you resubscribe",
      ],
    },
    {
      title: "Subscription Renewals",
      icon: AlertCircle,
      color: "from-indigo-500 to-purple-500",
      content: [
        "Important information about renewals:",
        "• Renewals are not eligible for refunds under the 30-day guarantee",
        "• You can cancel your subscription at any time before the renewal date",
        "• Canceled subscriptions remain active until the end of the billing period",
        "• No refunds are provided for partial months or unused time after cancellation",
        "• To avoid renewal charges, cancel at least 24 hours before your renewal date",
      ],
    },
    {
      title: "Free Trial Policy",
      icon: CheckCircle2,
      color: "from-teal-500 to-green-500",
      content: [
        "Our 14-day free trial allows you to test Skeylet before committing:",
        "• No credit card required for the free trial",
        "• Full access to all features during the trial period",
        "• You can cancel anytime during the trial with no charges",
        "• If you don't cancel, your subscription begins after the trial ends",
        "• The 30-day refund guarantee applies after trial conversion",
      ],
    },
    {
      title: "Non-Refundable Items",
      icon: AlertCircle,
      color: "from-red-500 to-pink-500",
      content: [
        "The following are not eligible for refunds:",
        "• Subscription renewals (beyond the initial purchase)",
        "• Custom enterprise plans (different terms apply)",
        "• Add-on services or features purchased separately",
        "• Accounts terminated for Terms of Service violations",
        "• Purchases made more than 30 days ago",
        "• Discounted or promotional pricing (the refund amount is based on what you paid)",
      ],
    },
    {
      title: "Chargebacks",
      icon: AlertCircle,
      color: "from-red-500 to-orange-500",
      content: [
        "We strongly discourage initiating chargebacks:",
        "• Please contact us first at skeylet123@gmail.com - we're committed to resolving any issues",
        "• Chargebacks initiated without contacting us may result in:",
        "  - Immediate account suspension",
        "  - Loss of access to all data and content",
        "  - Potential legal action to recover costs",
        "• We have a 99% customer satisfaction rate when issues are brought to our attention",
      ],
    },
    {
      title: "Exceptions and Special Cases",
      icon: CheckCircle2,
      color: "from-blue-500 to-purple-500",
      content: [
        "We handle each refund request individually and may make exceptions for:",
        "• Technical issues that prevented you from using the service",
        "• Accidental duplicate purchases",
        "• Billing errors on our end",
        "• Extenuating circumstances (evaluated case-by-case)",
        "",
        "Contact us at skeylet123@gmail.com to discuss your specific situation.",
      ],
    },
    {
      title: "Cancellation vs. Refund",
      icon: AlertCircle,
      color: "from-purple-500 to-pink-500",
      content: [
        "Understanding the difference:",
        "",
        "Cancellation:",
        "• Stops future billing",
        "• Maintains access until the end of the current billing period",
        "• No refund for the current period",
        "• Can be done anytime in your account settings",
        "",
        "Refund:",
        "• Returns your payment for the current period",
        "• Immediate loss of access to premium features",
        "• Only available within 30 days of initial purchase",
        "• Requires contacting support",
      ],
    },
    {
      title: "Contact Information",
      icon: Mail,
      color: "from-indigo-500 to-purple-500",
      content: [
        "For all refund requests and billing questions:",
        "",
        "Email: skeylet123@gmail.com",
        "Response time: 24-48 hours",
        "Business hours: Monday-Friday, 9 AM - 6 PM EST",
        "",
        "Please include your account email and transaction details for faster processing.",
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
              <DollarSign className="w-6 h-6 text-white" />
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
          className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full backdrop-blur-sm mb-6"
            >
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-sm text-slate-200">100% Satisfaction Guaranteed</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl text-white mb-6">Refund Policy</h1>
            <p className="text-xl text-slate-400 mb-4">Last Updated: November 14, 2025</p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full"
            >
              <p className="text-lg text-green-300">
                <span className="text-2xl">✓</span> 30-Day Money-Back Guarantee
              </p>
            </motion.div>
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
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center`}
                    >
                      <section.icon className="w-5 h-5 text-white" />
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
            <h3 className="text-2xl text-white mb-3">Need a Refund?</h3>
            <p className="text-slate-300 mb-6 max-w-xl mx-auto">
              We're committed to your satisfaction. If you're not happy with Skeylet, we'll make it right or refund your purchase - no hassle, no questions asked.
            </p>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white px-8 py-6 rounded-xl"
              >
                <Mail className="mr-2 h-5 w-5" />
                Request Refund: skeylet123@gmail.com
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
