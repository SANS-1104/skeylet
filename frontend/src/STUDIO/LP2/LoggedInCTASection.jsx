import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { 
  Calendar, 
  Bot, 
  BarChart3, 
  ArrowRight,
  Zap,
  Target,
  Rocket,
  LayoutDashboard
} from "lucide-react";

export function LoggedInCTASection() {
  const quickActions = [
    {
      icon: Bot,
      title: "Generate AI Post",
      description: "Create engaging content in seconds",
      action: "Generate Now",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Calendar,
      title: "Schedule Content",
      description: "Plan your next week of posts",
      action: "Open Scheduler",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: BarChart3,
      title: "View Analytics",
      description: "See how your content performs",
      action: "View Reports",
      color: "from-green-500 to-emerald-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/10"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 max-w-7xl relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-6 text-white leading-tight">
            Keep the momentum going
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto">
            You're on the right track! Let's help you maintain consistent growth and engagement on LinkedIn.
          </p>
        </div>

        {/* Quick actions grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {quickActions.map((action, index) => (
            <Card key={index} className="border-0 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl mb-3 text-white">
                  {action.title}
                </h3>
                <p className="text-blue-100 mb-6 leading-relaxed">
                  {action.description}
                </p>
                <Button 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white hover:text-gray-900 transition-all duration-300"
                >
                  {action.action}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <LayoutDashboard className="w-5 h-5 mr-2" />
            Open Full Dashboard
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>

          <div className="flex flex-wrap items-center justify-center gap-8 mt-8 text-blue-100 text-sm">
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              AI-powered content
            </div>
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Smart scheduling
            </div>
            <div className="flex items-center">
              <Rocket className="w-4 h-4 mr-2" />
              Growth analytics
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}