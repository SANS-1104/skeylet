import { useState } from 'react'
import { Lock, Shield, Eye, EyeOff, AlertCircle, ArrowLeft, Server, Database, Settings, Activity } from 'lucide-react'

import { Input } from '../LANDING-PAGE/ui/input'
import { Label } from '../LANDING-PAGE/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../LANDING-PAGE/ui/card'
import { Separator } from '../LANDING-PAGE/ui/separator'
import { Button } from '../LANDING-PAGE/ui/button'
import axiosClient from '../../api/axiosClient'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';


export function StudioSuperAdminLoginPage({ onAdminLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await axiosClient.post(
                "/admin/superadmin/login",
                {
                    email: email,
                    password,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            // Axios automatically parses JSON
            const data = res.data;

            localStorage.setItem("accessToken", data.token);
            navigate("/studioSuperAdmin/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message || "Login failed"
            );
            setIsLoading(false);
        }
    };



  const handleBackToLogin = () => {
    navigate("/")
  }

  const adminFeatures = [
    {
      icon: Database,
      title: "User Management",
      description: "Manage all user accounts",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Server,
      title: "System Control",
      description: "Monitor system health",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: Activity,
      title: "Analytics",
      description: "View detailed metrics",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Settings,
      title: "Configuration",
      description: "System settings",
      color: "from-amber-500 to-orange-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-slate-400 to-indigo-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400 to-slate-400 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Admin Branding and Features */}
        <div className="space-y-8">
          {/* Logo and Brand */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-700 to-indigo-900 text-white flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 bg-clip-text text-transparent">
                  Admin Portal
                </h1>
                <p className="text-sm text-gray-500">System Management</p>
              </div>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Secure Administrative
              <span className="block bg-gradient-to-r from-slate-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                Access Control
              </span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Manage users, monitor system performance, and configure application settings from a centralized dashboard.
            </p>
          </div>

          {/* Admin Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {adminFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="rounded-xl border bg-white/50 backdrop-blur-sm p-4 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-r ${feature.color} rounded-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Security Notice */}
          <div className="rounded-xl border bg-gradient-to-r from-white to-slate-50/50 p-6 shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-slate-100 to-indigo-100 rounded-lg">
                <Shield className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Enterprise-Grade Security</h3>
                <p className="text-sm text-gray-600">
                  All administrative actions are logged and monitored. Two-factor authentication and role-based access control ensure maximum security.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Admin Login Form */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md bg-white/80 backdrop-blur-lg border-0 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-indigo-900 flex items-center justify-center shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Administrator Login
              </CardTitle>
              <p className="text-gray-600">
                Enter your admin credentials to access the control panel
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Back Button */}
              <Button
                type="button"
                variant="ghost"
                className="w-full gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={handleBackToLogin}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to User Login
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Admin Authentication</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="admin-email"
                      type="text"
                      placeholder="Enter admin email"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter admin password"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-slate-700 to-indigo-900 hover:from-slate-800 hover:to-indigo-950 shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Access Admin Dashboard
                    </>
                  )}
                </Button>
              </form>

              {/* Demo Credentials */}
              {/* <div className="rounded-lg bg-gradient-to-r from-slate-50 to-indigo-50 border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 bg-slate-600 rounded-full"></div>
                  <span className="text-sm font-semibold text-slate-800">Demo Credentials</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-600">
                    Email: <span className="font-mono font-medium text-slate-900">admin</span>
                  </p>
                  <p className="text-xs text-slate-600">
                    Password: <span className="font-mono font-medium text-slate-900">admin123</span>
                  </p>
                </div>
              </div> */}

              {/* Security Notice */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  🔒 All login attempts are monitored and logged
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
