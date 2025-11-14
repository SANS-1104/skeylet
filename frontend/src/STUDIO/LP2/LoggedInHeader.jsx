import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { 
  LayoutDashboard, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronDown,
  Calendar,
  BarChart3
} from "lucide-react";

interface User {
  name: string;
  email: string;
  avatar: string;
  plan: string;
}

interface LoggedInHeaderProps {
  user: User;
}

export function LoggedInHeader({ user }: LoggedInHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl text-gray-900 mr-8">
              LinkedIn Blog Scheduler
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              Features
            </a>
            <a href="#analytics" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              Analytics
            </a>
            <a href="#help" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              Help
            </a>
          </nav>

          {/* User section */}
          <div className="flex items-center space-x-4">
            {/* Quick actions */}
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden lg:flex items-center space-x-2 border-gray-300 hover:border-blue-400"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Post</span>
            </Button>

            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="text-sm text-gray-900">{user.name}</div>
                    <Badge variant="secondary" className="text-xs">
                      {user.plan}
                    </Badge>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}