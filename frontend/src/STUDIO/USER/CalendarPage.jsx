import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, } from "../LANDING-PAGE/ui/card";
import { Button } from "../LANDING-PAGE/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../LANDING-PAGE/ui/select";
import { Badge } from "../LANDING-PAGE/ui/badge";
import { Tabs, TabsList, TabsTrigger, } from "../LANDING-PAGE/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "../LANDING-PAGE/ui/table";
import { Input } from "../LANDING-PAGE/ui/input";
import { Label } from "../LANDING-PAGE/ui/label";
import { Textarea } from "../LANDING-PAGE/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "../LANDING-PAGE/ui/dialog";
import { Calendar, Filter, ChevronLeft, ChevronRight, Clock, TrendingUp, Search, List, CalendarDays, Eye, Heart, MessageCircle, Share2, AlertTriangle, CheckCircle, XCircle, MoreHorizontal, Edit, Trash2, Plus, FileText, CalendarX, Edit3 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, } from "../LANDING-PAGE/ui/dropdown-menu";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";


export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("calendar");
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [drafts, setDrafts] = useState([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [viewingMode, setViewingMode] = useState("view"); // "view" or "edit"
  const [deletePost, setDeletePost] = useState(null);
  // Scheduling state
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [schedulingPost, setSchedulingPost] = useState("draft");
  const [selectedDraft, setSelectedDraft] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("linkedin");


  // Rescheduling state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [postToReschedule, setPostToReschedule] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [rescheduleTime, setRescheduleTime] = useState("09:00");

  const [viewingPost, setViewingPost] = useState(null)
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", content: "", topic: "" });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const res = await axiosClient.get("/unifiedPost/scheduled");

      const postsArray = res.data.posts || []; // <-- access the array inside the object

      const formattedPosts = [];

      postsArray.forEach((post) => {
        for (const [platform, details] of Object.entries(post.platforms || {})) {
          if (details.status === "draft" || details.status === "scheduled") {
            const scheduled = details.scheduledTime
              ? new Date(details.scheduledTime)
              : new Date(post.createdAt);

            formattedPosts.push({
              id: post._id,
              title: post.title,
              content: post.content,
              platform,
              date: scheduled,
              time: details.scheduledTime
                ? `${String(scheduled.getHours()).padStart(2, "0")}:${String(
                  scheduled.getMinutes()
                ).padStart(2, "0")}`
                : "00:00",
              status: details.status,
              topic: post.topic,
              viralityScore: post.viralityScore || 0,
            });
          }
        }
      });

      setPosts(formattedPosts);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchDrafts = async () => {
    try {
      setLoadingDrafts(true);

      const res = await axiosClient.get("/unifiedPost/scheduled");
      const postsArray = res.data.posts || [];

      // Create formatted draft list
      const formattedDrafts = postsArray.map((post) => {
        // Find which platforms are in draft state
        const draftPlatforms = Object.entries(post.platforms || {})
          .filter(([_, p]) => p?.status === "draft")
          .map(([platform]) => platform);

        return {
          _id: post._id,
          title: post.title,
          content: post.content,
          topic: post.topic,
          image: post.image,
          viralityScore: post.viralityScore || 0,
          draftPlatforms, // ✅ keep list of platforms in draft
          createdAt: post.createdAt,
        };
      });

      // Filter only posts that have at least one draft platform
      const draftsOnly = formattedDrafts.filter(
        (draft) => draft.draftPlatforms.length > 0
      );

      // ✅ Deduplicate by ID (avoid duplicates in UI)
      const dedupedDrafts = Array.from(
        new Map(draftsOnly.map((d) => [d._id, d])).values()
      );

      setDrafts(dedupedDrafts);
    } catch (err) {
      console.error("Failed to fetch drafts:", err);
      toast.error("Failed to fetch drafts");
    } finally {
      setLoadingDrafts(false);
    }
  };


  useEffect(() => {
    fetchDrafts();
  }, []);

  const startEdit = (post) => {
    setEditForm({
      title: post.title || "",
      content: post.content || "",
      topic: post.topic || ""
    });
    setIsEditing(true);
  };


  const handleEditChange = (e) => {
    // Prevent editing if viewingPost is posted
    if (viewingPost && viewingPost.status === "posted") {
      toast.error("Posted posts cannot be edited.");
      return;
    }
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    // Prevent editing if posted
    if (viewingPost && viewingPost.status === "posted") {
      toast.error("Posted posts cannot be edited.");
      return;
    }
    try {
      // Use post id (either _id or id)
      const postId = viewingPost.id || viewingPost._id;
      await axiosClient.put(`/blogs/${postId}`, editForm);
      toast.success("Post updated successfully!");
      setIsEditing(false);
      setViewingPost(null);
      await fetchPosts(); // Refresh posts after edit
    } catch (err) {
      console.error("Error updating blog:", err);
      toast.error("Failed to update post");
    }
  };

  const [newPostForm, setNewPostForm] = useState({
    title: "",
    content: "",
    topic: "General",
    time: "09:00",
  });

  // Unschedule confirmation state
  const [isUnscheduling, setIsUnscheduling] = useState(false);
  const [postToUnschedule, setPostToUnschedule] = useState(null);




  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getFilteredPosts = () => {
    return posts.filter((post) => {
      const matchesStatus =
        selectedStatus === "all" ||
        post.status === selectedStatus;
      const matchesTopic =
        selectedTopic === "all" ||
        post.topic.toLowerCase() === selectedTopic;
      const matchesSearch =
        searchQuery === "" ||
        post.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        post.content
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesStatus && matchesTopic && matchesSearch;
    });
  };
  useEffect(() => {
    getPostsForDate();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "from-blue-500 to-indigo-500";
      case "posted":
        return "from-green-500 to-emerald-500";
      case "failed":
        return "from-red-500 to-pink-500";
      default:
        return "from-gray-500 to-slate-500";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "posted":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "posted":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getViralityColor = (score) => {
    if (score >= 80)
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (score >= 60)
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (score >= 40)
      return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const calculateViralityScore = (
    content,
    title,
  ) => {
    const viralKeywords = [
      "AI",
      "ML",
      "automation",
      "future",
      "trends",
      "tips",
      "hack",
      "secret",
      "ultimate",
      "game-changer",
      "breakthrough",
    ];
    const combinedText = `${title} ${content}`.toLowerCase();
    const score = viralKeywords.reduce(
      (acc, keyword) => {
        return combinedText.includes(keyword.toLowerCase())
          ? acc + 15
          : acc;
      },
      Math.floor(Math.random() * 40) + 30,
    );
    return Math.min(score, 95);
  };

  const handleDateClick = (date) => {
    if (date < new Date().setHours(0, 0, 0, 0)) return; // Prevent scheduling in the past
    setSelectedDate(date);
    setIsScheduling(true);
  };
  useEffect(() => {
    fetchScheduledPosts();
  }, []);
  const fetchScheduledPosts = async () => {
    return posts.filter((post) => post.status === "scheduled");
  };

  const getPostsForDate = (date) => {
    if (!date) return [];

    const targetYear = date.getFullYear();
    const targetMonth = date.getMonth();
    const targetDay = date.getDate();

    return getFilteredPosts()
      .filter((post) => post.status !== "draft")
      .filter((post) => {
        // Each post may have multiple platforms
        const postDate = new Date(post.scheduledTime || post.date);
        return (
          postDate.getFullYear() === targetYear &&
          postDate.getMonth() === targetMonth &&
          postDate.getDate() === targetDay
        );
      })
      .map((post) => ({
        ...post,
        time: post.time || (() => {
          const d = new Date(post.scheduledTime || post.date);
          return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        })(),
      }));
  };
  const handleSchedulePost = async () => {
    if (!selectedDate || schedulingPost !== "draft" || !selectedDraft) return;

    const draft = drafts.find((d) => d._id === selectedDraft);
    if (!draft) return;

    const [hour, minute] = newPostForm.time.split(":");

    const dateObj =
      selectedDate instanceof Date
        ? new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          parseInt(hour, 10),
          parseInt(minute, 10)
        )
        : (() => {
          const [y, m, d] = selectedDate.split("-");
          return new Date(
            parseInt(y, 10),
            parseInt(m, 10) - 1,
            parseInt(d, 10),
            parseInt(hour, 10),
            parseInt(minute, 10)
          );
        })();

    if (dateObj.getTime() < new Date().getTime()) {
      toast.error("Cannot schedule in the past. Please select a future time.");
      return;
    }

    const scheduledTimeISO = dateObj.toISOString();

    if (!selectedPlatform) {
      toast.error("Please select a platform before scheduling.");
      return;
    }

    const payload = {
      postId: draft._id,
      scheduledTime: scheduledTimeISO,
      platform: selectedPlatform,
    };

    try {
      await axiosClient.post("/unifiedPost/schedule", payload);
      // await axiosClient.delete(`/blogs/${selectedDraft}`);
      await fetchDrafts();
      await fetchPosts();

      toast.success(`Draft scheduled successfully for ${selectedPlatform}!`);

      setIsScheduling(false);
      setSelectedDate(null);
      setSelectedDraft("");
      setNewPostForm({
        title: "",
        content: "",
        topic: "General",
        time: "09:00",
        image: "",
      });
    } catch (err) {
      console.error("Schedule draft error:", err);
      toast.error("Error scheduling draft");
    }
  };

  const handleUnschedulePost = (post, platform) => {
    // setPostToUnschedule({ post, platform });
    // setIsUnscheduling(true);
    setIsScheduling(false);
    setPostToUnschedule({ post, platform });
    setIsUnscheduling(true);
  };

  const confirmUnschedule = async () => {
    if (!postToUnschedule) return;
    const { post, platform } = postToUnschedule;

    try {
      // Call backend to unschedule a specific platform
      await axiosClient.delete(`/unifiedPost/cancel/${post._id}/${platform}`);

      // Refresh posts and drafts after unscheduling
      await fetchPosts();
      await fetchDrafts();
      toast.success(`${platform} post unscheduled and moved to drafts!`);
    } catch (err) {
      toast.error("Failed to unschedule post");
      console.error(err);
    } finally {
      setIsUnscheduling(false);
      setPostToUnschedule(null);
    }
  };

  const cancelUnschedule = () => {
    setIsUnscheduling(false);
    setPostToUnschedule(null);
  };

  const handleReschedulePost = async (post, platform, newDate, newTime) => {
    if (!post || !platform || !newDate || !newTime) return;

    const [hour, minute] = newTime.split(":");
    const dateObj =
      newDate instanceof Date
        ? new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate(),
          parseInt(hour, 10),
          parseInt(minute, 10)
        )
        : (() => {
          const [y, m, d] = newDate.split("-");
          return new Date(
            parseInt(y, 10),
            parseInt(m, 10) - 1,
            parseInt(d, 10),
            parseInt(hour, 10),
            parseInt(minute, 10)
          );
        })();

    if (dateObj.getTime() < new Date().getTime()) {
      toast.error("Cannot schedule in the past");
      return;
    }

    const payload = {
      postId: post._id,
      platform,
      newScheduledTime: dateObj.toISOString(),
    };

    try {
      await axiosClient.post("/unifiedPost/reschedule", payload);
      await fetchPosts();
      await fetchDrafts();
      toast.success(`${platform} post rescheduled successfully!`);
    } catch (err) {
      console.error("❌ Reschedule error:", err);
      toast.error("Failed to reschedule post");
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const dayNames = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];
  const filteredPosts = getFilteredPosts();

  const statusCounts = {
    all: posts.length,
    scheduled: posts.filter((p) => p.status === "scheduled")
      .length,
    posted: posts.filter((p) => p.status === "posted").length,
    failed: posts.filter((p) => p.status === "failed").length,
    draft: posts.filter((p) => p.status === "draft").length,
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
  const [unschedulePost, setUnschedulePost] = useState(null);
  const [unschedulePlatforms, setUnschedulePlatforms] = useState([]);
  useEffect(() => {
    if (!unschedulePost) {
      setUnschedulePlatforms([]);
      return;
    }

    const postId = unschedulePost.id || unschedulePost._id;
    // posts are stored as per-platform entries (with .platform and .status)
    const platforms = posts
      .filter((p) => (p.id === postId || p._id === postId) && p.status === "scheduled")
      .map((p) => p.platform);

    const unique = Array.from(new Set(platforms));
    setUnschedulePlatforms(unique);

    // default selectedPlatform to first available scheduled platform (if any)
    if (unique.length > 0) {
      setSelectedPlatform(unique[0]);
    }
  }, [unschedulePost, posts]);


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10 blur-xl"></div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
            Content Calendar
          </h1>
        </div>
        <p className="text-muted-foreground">
          Create a Post in Posts Section and Save it as Draft. Then Click on any future date to Schedule Content.
        </p>
      </div>

      {/* Filters and Controls */}
      <Card className="bg-gradient-to-r from-white to-purple-50/30 border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Filters:</span>
                </div>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Status ({statusCounts.all})
                    </SelectItem>
                    <SelectItem value="scheduled">
                      Scheduled ({statusCounts.scheduled})
                    </SelectItem>
                    <SelectItem value="posted">
                      Posted ({statusCounts.posted})
                    </SelectItem>
                    <SelectItem value="failed">
                      Failed ({statusCounts.failed})
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedTopic}
                  onValueChange={setSelectedTopic}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Topics
                    </SelectItem>
                    <SelectItem value="technology">
                      Technology
                    </SelectItem>
                    <SelectItem value="marketing">
                      Marketing
                    </SelectItem>
                    <SelectItem value="productivity">
                      Productivity
                    </SelectItem>
                    <SelectItem value="career">
                      Career
                    </SelectItem>
                    <SelectItem value="business">
                      Business
                    </SelectItem>
                    <SelectItem value="leadership">
                      Leadership
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="pl-10 w-64"
                />
              </div>
            </div> */}

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Tabs
                value={viewMode === "calendar" ? "calendar" : "list"}
                onValueChange={(value) => setViewMode(value)}
              >
                <TabsList>
                  <TabsTrigger
                    value="calendar"
                    className="gap-2"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Calendar View
                  </TabsTrigger>
                  {/* <TabsTrigger value="list" className="gap-2">
                    <List className="h-4 w-4" />
                    List View ({filteredPosts.length})
                  </TabsTrigger> */}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content based on view mode */}


      {loadingPosts ? (
        <div className="flex justify-center items-center h-40">
          <span>Loading posts...</span>
        </div>
      ) :
        /* Calendar View */
        <Card className="bg-gradient-to-br from-white to-indigo-50/30 border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {monthNames[currentDate.getMonth()]}{" "}
                {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateMonth("prev")}
                  className="text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateMonth("next")}
                  className="text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {/* Day Headers */}
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="p-4 bg-gray-50 border-b font-medium text-center text-gray-600"
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {days.map((date, index) => {
                const postsForDate = getPostsForDate(date);
                const isToday =
                  date &&
                  date.toDateString() ===
                  new Date().toDateString();
                const isPast =
                  date &&
                  date < new Date().setHours(0, 0, 0, 0);
                const canSchedule = date && !isPast;

                return (
                  <div
                    key={index}
                    className={`min-h-32 p-2 border-b border-r border-gray-200 ${date
                      ? canSchedule
                        ? "bg-white hover:bg-purple-50 cursor-pointer"
                        : "bg-gray-50"
                      : "bg-gray-50"
                      } ${isToday ? "bg-blue-50 ring-2 ring-blue-500 ring-inset" : ""} transition-colors`}
                    onClick={() =>
                      canSchedule && handleDateClick(date)
                    }
                  >
                    {date && (
                      <>
                        <div
                          className={`text-sm font-medium mb-2 flex items-center justify-between ${isToday
                            ? "text-blue-600"
                            : isPast
                              ? "text-gray-400"
                              : "text-gray-900"
                            }`}
                        >
                          <span>
                            {date.getDate()}
                            {isToday && (
                              <span className="ml-1 text-xs">
                                (Today)
                              </span>
                            )}
                          </span>
                          {canSchedule && (
                            <Plus className="h-3 w-3 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                        <div className="space-y-1">
                          {postsForDate.map((post) => (
                            <DropdownMenu key={post.id}>
                              <DropdownMenuTrigger asChild>
                                <div
                                  className={`p-2 rounded-lg text-xs bg-gradient-to-r ${getStatusColor(post.status)} text-white cursor-pointer hover:shadow-md transition-all duration-200 group`}
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >
                                  <div className="flex items-center gap-1 mb-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{post.time}</span>
                                  </div>
                                  <div className="font-medium truncate">
                                    {post.title}
                                  </div>
                                  {post.engagement && (
                                    <div className="flex items-center gap-1 mt-1 opacity-80">
                                      <TrendingUp className="h-3 w-3" />
                                      <span>
                                        {formatNumber(
                                          post.engagement
                                            .impressions,
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => {
                                    setViewingPost(post);
                                    setViewingMode("view");
                                    setIsEditing(false);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => {
                                    setViewingPost(post);
                                    setViewingMode("edit");
                                    setEditForm({
                                      title: post.title || "",
                                      content: post.content || "",
                                      topic: post.topic || ""
                                    });
                                    setIsEditing(true);
                                  }}
                                  disabled={post.status === "posted"}
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit Post
                                </DropdownMenuItem>
                                {post.status ===
                                  "scheduled" && (
                                    <>
                                      <DropdownMenuItem
                                        className="gap-2"
                                        onClick={() => {
                                          setPostToReschedule(post);
                                          setRescheduleDate(post.date);
                                          setRescheduleTime(post.time);
                                          setIsRescheduling(true);
                                        }}
                                      >
                                        <Calendar className="h-4 w-4" />
                                        Reschedule
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="gap-2 text-orange-600 focus:text-orange-600"
                                        // onClick={() => handleUnschedulePost(post)}
                                        onClick={() => setUnschedulePost(post)}
                                      >
                                        <CalendarX className="h-4 w-4" />
                                        Unschedule
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 text-red-600 focus:text-red-600"
                                  onClick={() => setDeletePost(post)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      }


      {deletePost && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          {/* Transparent clickable overlay to close */}
          <div
            className="absolute inset-0"
            onClick={() => setDeletePost(null)}
          ></div>

          {/* Confirmation box */}
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-[320px] z-10 border border-gray-200">
            <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <strong>{deletePost.title}</strong>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDeletePost(null)}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 text-white"
                onClick={async () => {
                  try {
                    await axiosClient.delete(`/blogs/${deletePost.id || deletePost._id}`);
                    setPosts(prev => prev.filter(p => p.id !== (deletePost.id || deletePost._id)));
                    toast.success("Post deleted successfully");
                    setDeletePost(null);
                  } catch (err) {
                    console.error("Error deleting post:", err);
                    toast.error("Failed to delete post");
                  }
                }}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {unschedulePost && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          {/* Transparent clickable overlay */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setUnschedulePost(null)}
          ></div>

          {/* Confirmation box */}
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-[340px] z-10 border border-gray-200">
            <h3 className="text-lg font-semibold">Unschedule Post</h3>
            <p className="mt-2 text-sm text-gray-600">
              Choose the platform you want to unschedule{" "}
              <strong>{unschedulePost.title}</strong> from:
            </p>

            {/* Platform selection buttons */}
            <div className="flex flex-col gap-2 mt-4">
              {unschedulePlatforms.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No scheduled platforms found for this post.
                </div>
              ) : (
                unschedulePlatforms.map((platform) => (
                  <Button
                    key={platform}
                    variant={selectedPlatform === platform ? "default" : "outline"}
                    onClick={() => setSelectedPlatform(platform)}
                    className="capitalize"
                  >
                    {platform}
                  </Button>
                ))
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" onClick={() => setUnschedulePost(null)}>
                Cancel
              </Button>

              <Button
                className="bg-orange-600 text-white"
                disabled={!selectedPlatform}
                onClick={async () => {
                  try {
                    const postId = unschedulePost._id || unschedulePost.id;

                    const response = await axiosClient.delete(
                      `/unifiedPost/cancel/${postId}/${selectedPlatform}`
                    );

                    toast.success(`Post unscheduled from ${selectedPlatform} successfully`);

                    // Refresh authoritative data from backend (avoid shape mismatch)
                    await fetchPosts();
                    await fetchDrafts();

                    setUnschedulePost(null);
                    setSelectedPlatform(null);
                  } catch (err) {
                    console.error("Error unscheduling post:", err);
                    toast.error("Failed to unschedule post");
                  }
                }}
              >
                Confirm Unschedule
              </Button>


            </div>
          </div>
        </div>
      )}


      {/* Scheduling Dialog */}
      <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Schedule Post for {selectedDate?.toLocaleDateString()}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Post Type Selection */}
            <div className="space-y-3">
              <Label>What would you like to schedule?</Label>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSchedulingPost("draft")}
                  className="h-20 flex-row gap-2"
                >
                  <FileText className="h-5 w-5" />
                  Schedule Draft
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Draft Selector */}
              <div className="space-y-2">
                <Label>Select a draft to schedule</Label>
                <Select
                  value={selectedDraft}
                  onValueChange={setSelectedDraft}
                  disabled={loadingDrafts || drafts.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingDrafts
                          ? "Loading drafts..."
                          : drafts.length === 0
                            ? "Create a draft first"
                            : "Choose a draft..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {drafts.map((draft) => (
                      <SelectItem key={draft._id} value={draft._id}>
                        {draft.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Display draft details */}
              {selectedDraft && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  {(() => {
                    const draft = drafts.find((d) => d._id === selectedDraft);
                    return draft ? (
                      <div className="space-y-2">
                        <h4 className="font-medium">{draft.title}</h4>
                        <p className="text-sm text-muted-foreground">{draft.content}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{draft.topic}</Badge>
                          <Badge variant="outline" className={getViralityColor(draft.viralityScore)}>
                            {draft.viralityScore}% Virality
                          </Badge>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Platform Selector */}
              {selectedDraft && (
                <div className="space-y-2">
                  <Label>Select Platform</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose platform..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const draft = drafts.find((d) => d._id === selectedDraft);
                        if (!draft || !draft.draftPlatforms) return null;

                        const availablePlatforms = draft.draftPlatforms;

                        // If none available, show placeholder
                        if (availablePlatforms.length === 0)
                          return (
                            <SelectItem key="none" value="">
                              No platforms available
                            </SelectItem>
                          );

                        return availablePlatforms.map((plat) => (
                          <SelectItem key={plat} value={plat}>
                            {plat.charAt(0).toUpperCase() + plat.slice(1)}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Posting Time */}
              <div className="space-y-2">
                <Label>Posting Time</Label>
                <div className="flex gap-2">
                  {/* Hour Selector */}
                  <Select
                    value={newPostForm.time.split(":")[0]}
                    onValueChange={(hour) =>
                      setNewPostForm((prev) => ({ ...prev, time: `${hour}:${prev.time.split(":")[1] || "00"}` }))
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Minute Selector */}
                  <Select
                    value={newPostForm.time.split(":")[1]}
                    onValueChange={(minute) =>
                      setNewPostForm((prev) => ({ ...prev, time: `${prev.time.split(":")[0] || "09"}:${minute}` }))
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsScheduling(false)}>Cancel</Button>
              <Button
                onClick={handleSchedulePost}
                disabled={!selectedDraft || !selectedPlatform}
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Calendar className="h-4 w-4" />
                Schedule Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* Unschedule Confirmation Dialog */}
      <Dialog
        open={isUnscheduling}
        onOpenChange={setIsUnscheduling}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarX className="h-5 w-5 text-orange-600" />
              Unschedule Post
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to unschedule this post? It
              will be removed from your calendar.
            </p>

            {postToUnschedule && (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-sm mb-1">
                  {postToUnschedule.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {postToUnschedule.date.toLocaleDateString()}{" "}
                    at {postToUnschedule.time}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={cancelUnschedule}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmUnschedule}
                className="gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              >
                <CalendarX className="h-4 w-4" />
                Unschedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <Card className="bg-gradient-to-r from-white to-gray-50/50 border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-6">
            <span className="font-medium text-gray-700">
              Status Legend:
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded"></div>
                <span className="text-sm">
                  Scheduled ({statusCounts.scheduled})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded"></div>
                <span className="text-sm">
                  Posted ({statusCounts.posted})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-gray-300 to-gray-500 rounded"></div>
                <span className="text-sm">
                  Drafts ({statusCounts.draft})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded"></div>
                <span className="text-sm">
                  Failed ({statusCounts.failed})
                </span>
              </div>
            </div>
            <span className="text-sm text-purple-600 ml-auto">
              💡 Click on any future date to schedule content
            </span>
          </div>
        </CardContent>
      </Card>

      {/* View Post Dialog */}
      <Dialog open={!!viewingPost} onOpenChange={() => setViewingPost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingPost && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Edit3 className="h-5 w-5 text-indigo-600" />
                      Edit Post
                    </>
                  ) : (
                    <>
                      <Eye className="h-5 w-5 text-indigo-600" />
                      Post Details
                    </>
                  )}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {isEditing ? (
                  <>
                    <Label>Title</Label>
                    <input
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                      className="border rounded p-2 w-full"
                    />

                    <Label>Content</Label>
                    <textarea
                      name="content"
                      value={editForm.content}
                      onChange={handleEditChange}
                      className="border rounded p-2 w-full"
                      rows={6}
                    />

                    <Label>Topic</Label>
                    <input
                      name="topic"
                      value={editForm.topic}
                      onChange={handleEditChange}
                      className="border rounded p-2 w-full"
                    />
                  </>
                ) : (
                  <>
                    {/* Your existing read-only details UI here */}
                    <h3 className="text-xl font-semibold mb-2">
                      {viewingPost.title}
                    </h3>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">
                        {viewingPost.content}
                      </p>
                    </div>
                    {/* keep the rest of your read-only display */}
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setViewingPost(null)}>
                  Close
                </Button>
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-indigo-600 text-white" onClick={saveEdit}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  viewingMode === "edit" && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-4 w-4" />
                      Edit Post
                    </Button>
                  )
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRescheduling} onOpenChange={setIsRescheduling}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Reschedule Post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label>New Date</Label>
            <Input
              type="date"
              value={rescheduleDate ? rescheduleDate.toISOString().slice(0, 10) : ""}
              onChange={e => setRescheduleDate(new Date(e.target.value))}
            />
            <Label>New Time</Label>
            <Input
              type="time"
              value={rescheduleTime}
              onChange={e => setRescheduleTime(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsRescheduling(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 text-white"
                onClick={async () => {
                  if (!postToReschedule || !rescheduleDate || !rescheduleTime) return;
                  try {
                    const [hour, minute] = rescheduleTime.split(":");
                    const newDate = new Date(rescheduleDate);
                    newDate.setHours(hour, minute, 0, 0);
                    await axiosClient.put(`/schedule/${postToReschedule.id}`, {
                      scheduledTime: newDate.toISOString(),
                      // Optionally send other fields if you want to allow editing them
                    });
                    toast.success("Post rescheduled!");
                    setIsRescheduling(false);
                    setPostToReschedule(null);
                    await fetchPosts();
                  } catch (err) {
                    toast.error("Failed to reschedule post");
                  }
                }}
              >
                <Calendar className="h-4 w-4" />
                Confirm Reschedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}