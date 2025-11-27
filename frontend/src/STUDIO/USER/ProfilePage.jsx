import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Navbar/AuthContext";
import axiosClient from "../../api/axiosClient";
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from "../LANDING-PAGE/ui/card";
import { Button } from "../LANDING-PAGE/ui/button";
import { Switch } from "../LANDING-PAGE/ui/switch";
import { Badge } from "../LANDING-PAGE/ui/badge";
import { Separator } from "../LANDING-PAGE/ui/separator";
import { Progress } from "../LANDING-PAGE/ui/progress";
import { Input } from "../LANDING-PAGE/ui/input";
import { Label } from "../LANDING-PAGE/ui/label";
import { User as UserIcon, Linkedin, CheckCircle, XCircle, Settings, Bell, Globe, Clock, Users, BarChart3, Plus, Edit, LogOut, Shield, CreditCard, ShoppingBag } from "lucide-react";

export function ProfilePage() {
  const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [user, setUser] = useState(null);
  const { logout: authLogout } = useContext(AuthContext);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [isRedditConnected, setIsRedditConnected] = useState(false);
  const [isFacebookConnected, setIsFacebookConnected] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosClient.get("/profile");
        setUser(res.data);
        // console.log(res.data);

        if (res.data?.name) {
          const nameParts = res.data.name.trim().split(" ");
          setFirstName(nameParts[0] || "");
          setLastName(nameParts.slice(1).join(" ") || ""); // handles middle names too
        }


        setIsLinkedInConnected(
          !!res.data.linkedinAccessToken && !!res.data.linkedinPersonURN
        );
        setIsRedditConnected(
          !!res.data.redditAccessToken && !!res.data.redditUsername
        );

      } catch (err) {
        console.error("Error fetching profile:", err.message);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Now build the platforms array dynamically
  const platforms = [
    {
      name: "LinkedIn",
      icon: Linkedin,
      connected: isLinkedInConnected,
      followers: "2.5K",
      posts: 247,
      lastSync: "2 mins ago",
      color: "from-blue-600 to-blue-700"
    },
    {
      name: "Reddit",
      icon: ShoppingBag,
      connected: isRedditConnected,
      followers: "2.5K",
      posts: 247,
      lastSync: "2 mins ago",
      color: "from-red-600 to-red-700"
    },
    {
      name: "Facebook",
      icon: ShoppingBag,
      connected: isFacebookConnected,
      followers: "2.5K",
      posts: 247,
      lastSync: "2 mins ago",
      color: "from-blue-400 to-blue-500"
    },
  ];
  useEffect(() => {
    if (user?.facebookPages.length > 0) {
      setIsFacebookConnected(true);
    }
  }, [user]);


  const handlePlatformConnect = (selectedPlatform) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in.");
      return;
    }

    if (selectedPlatform === "LinkedIn") {
      const authUrl = `https://api.skeylet.com/api/linkedin/start?token=${token}`;
      window.location.href = authUrl;
    }
    else if (selectedPlatform === "Reddit") {
      const authUrl = `https://api.skeylet.com/api/reddit/auth?token=${token}`;
      window.location.href = authUrl;
    }
    else if (selectedPlatform === "Facebook") {
      const authUrl = `https://api.skeylet.com/api/facebook/auth?token=${token}`;
      window.location.href = authUrl;
    }

  };

  const disConnect = async (platform) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in.");
      return;
    }

    try {
      await axiosClient.post(`/${platform}/disconnect`);

      if (platform === "linkedin") setIsLinkedInConnected(false);
      if (platform === "reddit") setIsRedditConnected(false);
      if (platform === "Facebook") setIsFacebookConnected(false);

      toast.success(`Successfully disconnected from ${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
    } catch (err) {
      console.error(`Error disconnecting ${platform}:`, err.message);
      toast.error(`Failed to disconnect ${platform}`);
    }
  };

  const handleReconnect = async (platform) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in.");
      return;
    }

    try {
      if (platform === "LinkedIn") {
        await axiosClient.post("/linkedin/disconnect");
        const authUrl = `https://api.skeylet.com/api/linkedin/start?token=${token}`;
        window.location.href = authUrl;

      } else if (platform === "Reddit") {
        await axiosClient.post("/reddit/disconnect", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const authUrl = `https://api.skeylet.com/api/reddit/auth?token=${token}`;
        window.location.href = authUrl;

      } else if (platform === "Facebook") {
        await axiosClient.post("/facebook/disconnect", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const authUrl = `https://api.skeylet.com/api/facebook/auth?token=${token}`;
        window.location.href = authUrl;

      } else {
        toast.error("Unknown platform");
      }

    } catch (err) {
      console.error(`Error reconnecting ${platform}:`, err.message || err);
      toast.error(`Failed to reconnect ${platform}`);
    }
  };

  const handleLogout = () => {
    authLogout();
    toast.success('Logged Out Successfully', { autoClose: 1000 });
    navigate('/');
    window.dispatchEvent(new Event("storage"));
  };


  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const handleSaveProfile = async () => {
    try {
      const res = await axiosClient.put("/profile", {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        jobPost: editForm.jobPost,
      });

      setUser(res.data);
      toast.success("Profile updated!");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err.message);
      toast.error("Failed to update profile.");
    }
  };


  // Fix variable names for consistency
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: firstName || '',
    lastName: lastName || '',
    email: user?.email || '',
    jobPost: user?.jobPost || ''
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Use the correct variable names in the JSX
  const stats = [
    { label: "Total Posts", value: "247", change: "+12%", color: "from-blue-500 to-indigo-500" },
    { label: "Total Followers", value: "2.5K", change: "+8%", color: "from-green-500 to-emerald-500" },
    { label: "Avg. Engagement", value: "4.2%", change: "+15%", color: "from-purple-500 to-violet-500" },
    { label: "Monthly Reach", value: "85.6K", change: "+22%", color: "from-amber-500 to-orange-500" }
  ];


  useEffect(() => {
    const fetchLinkedInData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axiosClient.get("/user-data", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // res.data contains: profile, email, posts
        // console.log("LinkedIn Data:", res.data);

        // Safely update user state
        if (res.data?.profile) {
          setUser((prev) => ({
            ...prev,
            linkedinProfile: res.data.profile,
            linkedinEmail: res.data.email,
            linkedinPosts: res.data.posts || [],
          }));

          setIsLinkedInConnected(true);
        }
      } catch (err) {
        console.error("Error fetching LinkedIn data:", err.response?.data || err.message);
        setIsLinkedInConnected(false);
      }
    };

    fetchLinkedInData();
  }, []);



  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-10 blur-xl"></div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
            <UserIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
            Profile & Settings
          </h1>
        </div>
        <p className="text-muted-foreground">
          Manage your account, connected platforms, and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  
  {/* LEFT SECTION (Profile + Platforms) */}
  <div className="lg:col-span-2 space-y-6">

    {/* USER PROFILE CARD */}
    <Card className="bg-gradient-to-br from-white to-indigo-50/30 border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-indigo-600" />
            Profile Information
          </CardTitle>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!isEditing) {
                setEditForm({
                  firstName: firstName || "",
                  lastName: lastName || "",
                  email: user?.email || "",
                  jobPost: user?.jobPost || ""
                });
              }
              setIsEditing(!isEditing);
            }}
            className="gap-2 w-full md:w-auto"
          >
            <Edit className="h-3 w-3" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full
            flex items-center justify-center text-white text-2xl font-bold overflow-hidden">

            {user?.linkedinProfile?.picture ? (
              <img
                src={user.linkedinProfile.picture}
                alt={`${firstName} ${lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials()
            )}

          </div>

          {/* RIGHT SIDE */}
          <div className="flex-1 w-full">
            {isEditing ? (
              <div className="space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">First Name</Label>
                    <Input
                      value={editForm.firstName}
                      onChange={(e) =>
                        setEditForm(prev => ({ ...prev, firstName: e.target.value }))
                      }
                      placeholder="First name"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Last Name</Label>
                    <Input
                      value={editForm.lastName}
                      onChange={(e) =>
                        setEditForm(prev => ({ ...prev, lastName: e.target.value }))
                      }
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Job Title</Label>
                  <Input
                    value={editForm.jobPost}
                    onChange={(e) =>
                      setEditForm(prev => ({ ...prev, jobPost: e.target.value }))
                    }
                    placeholder="Python Developer"
                  />
                </div>

                <div>
                  <Label className="text-sm">Email</Label>
                  <Input value={user.email} disabled />
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <Button
                    onClick={handleSaveProfile}
                    className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 w-full md:w-auto"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Save Changes
                  </Button>

                  <Button variant="outline" onClick={() => setIsEditing(false)} className="w-full md:w-auto">
                    Cancel
                  </Button>
                </div>

              </div>
            ) : (
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold">{`${firstName} ${lastName}`}</h3>
                <p className="text-muted-foreground">{user?.jobPost}</p>
                <p className="text-sm text-muted-foreground break-all">{user?.email}</p>
              </div>
            )}
          </div>
        </div>

      </CardContent>
    </Card>

    {/* CONNECTED PLATFORMS CARD */}
    <Card className="bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-600" />
          Connected Platforms
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {platforms.map((platform, index) => {
          const Icon = platform.icon
          return (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-center md:justify-between 
              p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-white 
              hover:shadow-md transition-all gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg text-white ${platform.color}`}>
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <h4 className="font-semibold flex items-center gap-1">
                    {platform.name}
                    {platform.connected ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </h4>

                  <div className="text-sm text-muted-foreground">
                    {platform.connected ? (
                      <>
                        <div className="flex flex-wrap gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {platform.followers} followers
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            {platform.posts} posts
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          Last sync: {platform.lastSync}
                        </div>
                      </>
                    ) : (
                      <span>Not connected</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                {platform.connected ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disConnect(platform.name)}
                      className="text-red-600 w-full md:w-auto"
                    >
                      Disconnect
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReconnect(platform.name)}
                      className="text-red-600 w-full md:w-auto"
                    >
                      Reconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handlePlatformConnect(platform.name)}
                    className={`w-full md:w-auto bg-gradient-to-r ${platform.color} text-white`}
                  >
                    <Plus className="h-3 w-3" />
                    Connect
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>

  </div>

  {/* RIGHT SIDEBAR (Settings / Subscription / Security) */}
  <div className="space-y-6">

    {/* ACCOUNT SETTINGS */}
    <Card className="bg-gradient-to-br from-white to-green-50/30 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-green-600" />
          Account Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <Label className="font-medium">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about post performance
            </p>
          </div>
          <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
        </div>
      </CardContent>
    </Card>

    {/* SUBSCRIPTION CARD */}
    <Card className="bg-gradient-to-br from-white to-yellow-50/30 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
            PRO
          </Badge>
          Professional Plan
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Posts this month</span>
            <span>15/100</span>
          </div>
          <Progress value={15} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>AI generations</span>
            <span>8/50</span>
          </div>
          <Progress value={16} className="h-2" />
        </div>

        <Separator />

        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">Renewal: August 24, 2024</p>
          <Button variant="outline" size="sm" className="w-full gap-2">
            <CreditCard className="h-3 w-3" />
            Manage Subscription
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* SECURITY CARD */}
    <Card className="bg-gradient-to-br from-white to-red-50/30 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-red-600" />
          Security
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full gap-2">
          <Settings className="h-4 w-4" />
          Change Password
        </Button>

        <Separator />

        <Button
          variant="outline"
          className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </CardContent>
    </Card>

  </div>

</div>

      
    </div>
  );
}

export default ProfilePage;

{/* <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-to-br from-white to-indigo-50/30 border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-center gap-4 lg:gap-0 lg:justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-indigo-600" />
                  Profile Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!isEditing) {
                      setEditForm({
                        firstName: firstName || "",
                        lastName: lastName || "",
                        email: user?.email || "",
                        jobPost: user?.jobPost || ""
                      });
                    }
                    setIsEditing(!isEditing);
                  }}
                  className="gap-2"
                >
                  <Edit className="h-3 w-3" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.linkedinProfile?.picture ? (
                    <img
                      src={user.linkedinProfile.picture}
                      alt={`${firstName} ${lastName}`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    getInitials()
                  )}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="firstName" className="text-sm">First Name</Label>
                          <Input
                            id="firstName"
                            value={editForm.firstName}
                            onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                          <Input
                            id="lastName"
                            value={editForm.lastName}
                            onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Last name"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="jobPost" className="text-sm">Job</Label>
                        <Input
                          id="jobPost"
                          type="text"
                          value={editForm.jobPost}
                          onChange={(e) => setEditForm(prev => ({ ...prev, jobPost: e.target.value }))}
                          placeholder="Python Developer"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-sm">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email}
                          disabled
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Email address"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile} className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600">
                          <CheckCircle className="h-3 w-3" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (

                    <div>
                      <h3 className="text-xl font-semibold">{`${firstName} ${lastName}`}</h3>
                      <p className="text-muted-foreground">{user?.jobPost}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                Connected Platforms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {platforms.map((platform, index) => {
                const Icon = platform.icon
                return (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-gradient-to-r ${platform.color} rounded-lg text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {platform.name}
                          {platform.connected ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </h4>
                        <div className="text-sm text-muted-foreground">
                          {platform.connected ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {platform.followers} followers
                                </span>
                                <span className="flex items-center gap-1">
                                  <BarChart3 className="h-3 w-3" />
                                  {platform.posts} posts
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <Clock className="h-3 w-3" />
                                Last sync: {platform.lastSync}
                              </div>
                            </div>
                          ) : (
                            <span>Not connected</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {platform.connected ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => disConnect(platform.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Disconnect
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReconnect(platform.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Reconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          className={`gap-2 bg-gradient-to-r ${platform.color} hover:opacity-90`}
                          onClick={() => handlePlatformConnect(platform.name)}
                        >
                          <Plus className="h-3 w-3" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-white to-green-50/30 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-green-600" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="font-medium">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about post performance
                    </p>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-yellow-50/30 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
                  PRO
                </Badge>
                Professional Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Posts this month</span>
                  <span>15/100</span>
                </div>
                <Progress value={15} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>AI generations</span>
                  <span>8/50</span>
                </div>
                <Progress value={16} className="h-2" />
              </div>

              <Separator />

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Renewal: August 24, 2024
                </p>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <CreditCard className="h-3 w-3" />
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-red-50/30 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button variant="outline" className="w-full gap-2">
                  <Settings className="h-4 w-4" />
                  Change Password
                </Button>
                
                <Separator />
                <Button
                  variant="outline"
                  className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div> */}