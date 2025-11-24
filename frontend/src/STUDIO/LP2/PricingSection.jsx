import { motion } from "motion/react";
import { Check, Sparkles, Zap, TrendingDown } from "lucide-react";
import { Button } from "../LANDING-PAGE/ui/button";
import { Card } from "../LANDING-PAGE/ui/card";
import { useEffect, useState, useContext } from "react";
import axiosClient from "../../api/axiosClient";
import { AuthContext } from "../../Navbar/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/formatCurrency";

export function PricingSection() {
  const [plans, setPlans] = useState([]);
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const region = navigator.language === "en-IN" ? "IN" : "US";

  const featuresFallback = [
    "All 3 platforms (LinkedIn, Reddit, Facebook)",
    "Unlimited AI-generated posts",
    "Advanced scheduling & auto-publishing",
    "Full analytics dashboard across all platforms",
    "Priority support",
    "Custom brand voice training",
    "Team collaboration (up to 5 members)",
    "API access",
    "White-label reports",
    "Cancel anytime",
  ];

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axiosClient.get("/plans");
        setPlans(res.data);
      } catch (err) {
        console.error("Failed to fetch plans", err);
      }
    };
    fetchPlans();
  }, []);

  const handleChoosePlan = (plan) => {
    if (!isLoggedIn) {
      toast.info("Please log in first!", { autoClose: 1500 });
      return;
    }

    const selectedPlan = {
      ...plan,
      selectedPrice: plan.yearlyPriceNew || plan.yearlyPrice,
      billingType: "yearly",
    };

    localStorage.setItem("selectedPlan", JSON.stringify(selectedPlan));
    navigate("/checkout");
  };


  

  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    const fetchActivePlan = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await axiosClient.get("/paymentStatus");        
        const { status } = res.data;
        
        if (status === "active") {
          setActivePlan(status); // store the active plan name
        }
      } catch (err) {
        console.error("Error fetching payment status:", err);
      }
    };
    fetchActivePlan();
  }, [isLoggedIn]);

  
  return (
    <section id="pricing" className="py-20 px-4 relative overflow-hidden">
      <motion.div
        animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
      />

      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            One plan. All features. Unlimited growth.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-1 gap-8">
          {plans.map((plan) => {
            const oldPrice = plan.yearlyPriceOld || plan.yearlyPrice;
            const newPrice = plan.yearlyPriceNew || plan.yearlyPrice;
            const discount =
              oldPrice && oldPrice > newPrice
                ? Math.round(((oldPrice - newPrice) / oldPrice) * 100)
                : 0;
            const planFeatures = plan.features.length
              ? plan.features
              : featuresFallback;

            return (
              <motion.div
                key={plan._id}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <Card className="p-10 border-2 border-purple-500 bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl shadow-purple-500/30 relative overflow-hidden">
                  {/* Badge */}
                  <div className="absolute top-0 right-0 px-6 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-bl-2xl rounded-tr-2xl flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Limited Time Offer</span>
                  </div>

                  {/* Plan Name */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl text-white capitalize">{plan.name}</h3>
                      <p className="text-slate-400">Everything you need to succeed</p>
                    </div>
                  </div>

                  {/* Price with old/new and discount */}
                  <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                      {discount > 0 && (
                        <>
                          <div className="relative">
                            <span className="text-4xl text-slate-500 line-through">
                              {formatCurrency(oldPrice, region)}
                            </span>
                            <motion.div
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                              className="absolute top-1/2 left-0 right-0 h-1 bg-red-500 origin-left"
                            />
                          </div>
                          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white shadow-lg shadow-green-500/30">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-sm">{discount}% OFF</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-7xl text-white">
                        {formatCurrency(newPrice, region)}
                      </span>
                      <span className="text-slate-400 text-xl">/ year</span>
                    </div>
                    {newPrice > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="inline-block px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm">
                          🔥 Only {formatCurrency(newPrice / 12, region)}/month
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {planFeatures.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    size="lg"
                    className="w-full py-7 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-xl shadow-purple-500/30"
                    onClick={() => handleChoosePlan(plan)}
                    disabled={activePlan === "active"} // disable if already purchased
                  >
                    {isLoggedIn && activePlan === "active"
                      ? "Plan Purchased!"
                      : `Claim Your ${discount}% Discount Now`}
                  </Button>

                  {/* Trust Badge */}
                  <p className="text-slate-400 text-sm text-center mt-4">
                    No credit card required • 14-day free trial • Cancel anytime
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

