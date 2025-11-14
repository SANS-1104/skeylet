import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  LayoutDashboard, 
  Calendar, 
  TrendingUp, 
  Eye,
  Plus,
  BarChart3
} from "lucide-react";

interface User {
  name: string;
  plan: string;
  postsThisMonth: number;
  totalPosts: number;
  totalViews: string;
  engagement: string;
}

interface LoggedInHeroSectionProps {
  user: User;
}

export function LoggedInHeroSection({ user }: LoggedInHeroSectionProps) {
  const quickStats = [
    {
      icon: Calendar,
      label: "Posts This Month",
      value: user.postsThisMonth,
      color: "text-blue-600"
    },
    {
      icon: BarChart3,
      label: "Total Posts",
      value: user.totalPosts,
      color: "text-purple-600"
    },
    {
      icon: Eye,
      label: "Total Views",
      value: user.totalViews,
      color: "text-green-600"
    },
    {
      icon: TrendingUp,
      label: "Engagement",
      value: user.engagement,
      color: "text-indigo-600"
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="max-w-4xl mx-auto">
          {/* Welcome back message */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Badge className="bg-green-100 text-green-700 border-green-200">
                Welcome back, {user.name.split(' ')[0]}!
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl mb-6 text-gray-900 leading-tight">
              Ready to grow your LinkedIn presence?
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Your content is performing well. Let's continue building your influence with smart scheduling and AI-powered insights.
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {quickStats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main CTAs */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-gray-300 hover:border-blue-400 px-8 py-4 rounded-xl transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Post
              </Button>
            </div>

            {/* Quick access links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <a href="#" className="flex items-center hover:text-blue-600 transition-colors duration-200">
                <Calendar className="w-4 h-4 mr-1" />
                View Schedule
              </a>
              <a href="#" className="flex items-center hover:text-blue-600 transition-colors duration-200">
                <BarChart3 className="w-4 h-4 mr-1" />
                Analytics
              </a>
              <a href="#" className="flex items-center hover:text-blue-600 transition-colors duration-200">
                <TrendingUp className="w-4 h-4 mr-1" />
                Top Performing Posts
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-blue-500/20 rounded-full blur-3xl"></div>
    </section>
  );
}