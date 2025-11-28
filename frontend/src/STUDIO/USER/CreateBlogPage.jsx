import React, { useRef, useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../LANDING-PAGE/ui/card"
import { Button } from "../LANDING-PAGE/ui/button"
import { Input } from "../LANDING-PAGE/ui/input"
import { Label } from "../LANDING-PAGE/ui/label"
import { Textarea } from "../LANDING-PAGE/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../LANDING-PAGE/ui/select"
import { Switch } from "../LANDING-PAGE/ui/switch"
import { Badge } from "../LANDING-PAGE/ui/badge"
import { Separator } from "../LANDING-PAGE/ui/separator"
import { Progress } from "../LANDING-PAGE/ui/progress"
import { PenTool, Upload, Wand2, Send, Save, Calendar, Sparkles, TrendingUp, Image as ImageIcon, Type, Zap, Maximize2, X } from "lucide-react"
import subredditData from "../../data/subreddits.json" // adjust path as needed

import { toast } from 'react-toastify';
import axiosClient from "../../api/axiosClient"
import { AuthContext } from "../../Navbar/AuthContext"

export function CreateBlogPage() {
  const [topic, setTopic] = useState("")
  const [content, setContent] = useState("")
  const [language, setLanguage] = useState("english")
  const [tone, setTone] = useState("Professional")
  const [selectTopic, setSelectTopic] = useState("Technology")
  const [wordCount, setWordCount] = useState(300)
  const [postMode, setPostMode] = useState("custom");
  const [image, setImage] = useState(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const { profile, logout: authLogout, setProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [name, setName] = useState("User");
  const [linkedinAutoPost, setLinkedinAutoPost] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [viralityScore, setViralityScore] = useState(0);
  const [todayBest, setTodayBest] = useState(null);

  // Fetch profile if not already loaded
  // 1️⃣ Fetch profile
  const fetchProfile = async () => {
    try {
      const res = await axiosClient.get("/profile");
      const data = res.data;
      setProfile?.(data); // update context if possible
      setName(data.name || "User");
      setLinkedinAutoPost(data.autoPostToLinkedIn || false);

      // After profile is fetched, call fetchTodayBestTime
      if (data?._id) {
        fetchTodayBestTime(data._id);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err.message);
    }
  };

  // 2️⃣ Fetch today's best time
  const fetchTodayBestTime = async (userId) => {
    try {
      const res = await axiosClient.get(`/analytics/best-time/${userId}`);
      const dailyBest = res.data.dailyBest || {};
      const todayName = new Date().toLocaleString("en-US", { weekday: "long" });

      if (dailyBest[todayName]) {
        const { key, avg } = dailyBest[todayName];
        const hour = key.split("-")[1];
        setTodayBest({
          hour,
          avg
        });
      }
    } catch (error) {
      console.error("Error fetching best time for today:", error);
    }
  };

  // 3️⃣ Run on mount
  useEffect(() => {
    fetchProfile();
    if (profile?._id) {
      fetchTodayBestTime(profile._id);
    }
  }, [profile]);

  const handleAutoPostToggle = async () => {
    const newValue = !linkedinAutoPost;
    try {
      await axiosClient.put("/preferences", { autoPostToLinkedIn: newValue });
      setLinkedinAutoPost(newValue);
      toast.success(`Auto-post ${newValue ? "enabled" : "disabled"}`, { autoClose: 1000 });
    } catch (err) {
      toast.error("Failed to update preference");
    }
  };

  useEffect(() => {
    if (!topic) {
      setViralityScore(0);
      return;
    }

    const delayDebounce = setTimeout(() => {
      calculateViralityScore(topic);
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounce);
  }, [topic]);

  // Calculate virality score based on topic
  const calculateViralityScore = async (topicText) => {
    try {
      const res = await axiosClient.get("/virality-score", {
        params: { topic: topicText }
      });
      setViralityScore(res.data.viralityScore || 0);
    } catch (error) {
      console.error("Error fetching virality score:", error);
      setViralityScore(0);
    }
  };

  const getViralityColor = score => {
    if (score >= 80) return "from-emerald-500 to-green-500"
    if (score >= 60) return "from-blue-500 to-indigo-500"
    if (score >= 40) return "from-amber-500 to-orange-500"
    return "from-red-500 to-pink-500"
  }

  const getViralityText = score => {
    if (score >= 80) return "Viral"
    if (score >= 60) return "High"
    if (score >= 40) return "Moderate"
    return "Low"
  }

  // Upload handler (from your old logic but sets `image`)
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); // direct set so preview shows
    };
    reader.readAsDataURL(file);
  };

  // Generate handler (from your old logic but sets `image`)
  const generateImage = async () => {
    try {
      setIsGeneratingImage(true);

      // Build prompt from existing form values
      const prompt = `A professional LinkedIn post image about the topic: "${topic}".Its content is ${content}, 
    tone: ${tone}, style: clean, modern, minimal, high quality`;

      // Call backend DALL·E 3 API
      const res = await axiosClient.post("/generate-image", { prompt });

      // Get the returned AI image URL
      setImage(res.data.imageUrl);
    } catch (error) {
      console.error("Error generating AI image:", error);
      toast.error(`Failed to generate image for ${topic}. Please try again.`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const [generatedByAI, setGeneratedByAI] = useState(false);

  // const handleGenerate = async () => {
  //   if (!topic.trim() && postMode === "custom") {
  //     toast.error("Please enter a topic");
  //     return;
  //   }
  //   setLoading(true);

  //   try {
  //     const res = await axiosClient.post("/generate-blog", {
  //       topic,
  //       content,
  //       language,
  //       tone,
  //       image,
  //       wordCount,
  //       viralityScore,
  //       // Instead of 'status', let backend handle platforms.linkedin.status
  //       linkedinAutoPost, // send this flag
  //     });

  //     const data = res.data;

  //     // Update UI fields with returned content
  //     if (data.title || data.video_title) setTopic(data.title || data.video_title);
  //     if (data.script || data.generated_text) setContent(data.script || data.generated_text);
  //     if (data.picture || data.image) setImage(data.picture || data.image);

  //     setOutput(data);
  //     setGeneratedByAI(true);

  //     toast.success("Blog generated successfully");

  //     // ✅ Notify if auto-post to LinkedIn happened
  //     if (data.platforms?.linkedin?.status === "posted") {
  //       toast.success("Successfully posted to LinkedIn");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to generate blog");
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  const handleGenerate = async () => {
  if (!topic.trim() && postMode === "custom") {
    toast.error("Please enter a topic");
    return;
  }
  setLoading(true);

  try {
    const res = await axiosClient.post("/generate-blog", {
      topic,
      content,
      language,
      tone,
      image,
      wordCount,
      viralityScore,
      linkedinAutoPost,
      redditAutoPost,
      facebookAutoPost,
      selectedSubreddit,
      selectedFlair,
      selectedFacebookPages,
    });

    const data = res.data;

    // Update frontend fields with returned content
    if (data.title || data.video_title) setTopic(data.title || data.video_title);
    if (data.script || data.generated_text) setContent(data.script || data.generated_text);
    if (data.picture || data.image) setImage(data.picture || data.image);

    setOutput(data);
    setGeneratedByAI(true);

    toast.success("Blog generated successfully");

    // ------------------ Handle Multi-Platform Auto-Post ------------------
    const postedPlatforms = [];

    // LinkedIn
    if (data.linkedInPosted || data.platforms?.linkedin?.status === "posted") {
      postedPlatforms.push("LinkedIn");
    }

    // Reddit
    if (data.platforms?.reddit?.status === "posted") {
      postedPlatforms.push(`Reddit (r/${selectedSubreddit})`);
    }

    // Facebook
    if (data.platforms?.facebook?.status === "posted") {
      postedPlatforms.push(
        `Facebook (${selectedFacebookPages.length} page${selectedFacebookPages.length > 1 ? "s" : ""})`
      );
    }

    if (postedPlatforms.length > 0) {
      toast.success(`Successfully auto-posted to: ${postedPlatforms.join(", ")}`, { autoClose: 3000 });
    }

  } catch (err) {
    console.error("Blog generation failed:", err.response?.data || err.message);

    // Handle quota exceeded
    const quotaMsg = err.response?.data?.error || err.response?.data?.msg;
    if (quotaMsg?.toLowerCase().includes("limit") || quotaMsg?.toLowerCase().includes("quota")) {
      toast.error(quotaMsg, { autoClose: 2000 });
    } else {
      toast.error("Failed to generate blog");
    }
  } finally {
    setLoading(false);
  }
};


  const [currentDraftId, setCurrentDraftId] = useState(null);
  // ------------------ LinkedIn Manual Post ------------------
  const handleManualLinkedInPost = async () => {
    if (!topic || !content) {
      toast.error("No content available to post");
      return;
    }

    try {
      // Step 1️⃣: Create or update unified draft post
      const createRes = await axiosClient.post("/unifiedPost/create", {
        postId: currentDraftId, // reuse existing draft if available
        title: topic || "Untitled Draft",
        topic: selectTopic || "General",
        content,
        image: image || "",
        viralityScore,
        platform: "linkedin",
      });

      const post = createRes.data.post;
      setCurrentDraftId(post._id); // store the draft ID

      // Step 2️⃣: Post manually to LinkedIn
      await axiosClient.post("/unifiedPost/manualPost", {
        postId: post._id,
        platform: "linkedin",
      });

      toast.success("Posted to LinkedIn successfully!");
    } catch (err) {
      console.error("❌ LinkedIn post failed:", err);
      toast.error(err.response?.data?.error || "Failed to post on LinkedIn");
    }
  };

  useEffect(() => {
    if (linkedinAutoPost && topic && content) {
      (async () => {
        try {
          // Create or reuse draft
          const createRes = await axiosClient.post("/unifiedPost/create", {
            postId: currentDraftId,
            title: topic || "Untitled Draft",
            topic: selectTopic || "General",
            content,
            image: image || "",
            viralityScore,
            platform: "linkedin",
          });

          const post = createRes.data.post;
          setCurrentDraftId(post._id);

          // Post manually
          await axiosClient.post("/unifiedPost/manualPost", {
            postId: post._id,
            platform: "linkedin",
          });

          toast.success("Auto-posted to LinkedIn successfully!");
        } catch (err) {
          console.error("❌ Auto-post to LinkedIn failed:", err);
          toast.error("Auto-post to LinkedIn failed");
        }
      })();
    }
  }, [linkedinAutoPost, topic, content]);

  // --- Reddit Related States ---
  const handleSaveDraft = async () => {
    try {
      if (!topic.trim() && !content.trim()) {
        toast.error("Please enter a topic or content before saving draft");
        return;
      }

      if (!selectedSubreddit) {
        toast.error("Please select a subreddit");
        return;
      }

      // ✅ Require at least one Facebook page
      if (!selectedFacebookPages || selectedFacebookPages.length === 0) {
        toast.error("Please select at least one Facebook page");
        return;
      }

      const payload = {
        postId: currentDraftId || undefined,
        title: topic || "Untitled Draft",
        topic: selectTopic || "General",
        content,
        image: image || "",
        viralityScore,
        platform: "linkedin", // ✅ required top-level for backend

        platforms: {
          linkedin: { status: "draft", scheduledTime: null, postedAt: null },

          reddit: {
            status: "draft",
            scheduledTime: null,
            postedAt: null,
            extra: {
              subreddit: selectedSubreddit || "",
              flairId: selectedFlair || ""
            }
          },

          facebook: {
            status: "draft",
            scheduledTime: null,
            postedAt: null,
            // ✅ save selected pages
            extra: { pageIds: selectedFacebookPages }
          },
        },
      };

      const res = await axiosClient.post("/unifiedPost/create", payload);
      const post = res.data.post;
      setCurrentDraftId(post._id);

      toast.success("Draft saved successfully!", { autoClose: 1500 });
    } catch (err) {
      console.error("Failed to save draft:", err);
      toast.error("Failed to save draft");
    }
  };

  const [selectedSubreddit, setSelectedSubreddit] = useState("");
  const [flairs, setFlairs] = useState([]);
  const [selectedFlair, setSelectedFlair] = useState("");
  const [redditAutoPost, setRedditAutoPost] = useState(false);

  // --- Fetch Flairs When Subreddit Changes ---
  useEffect(() => {
    const fetchFlairs = async () => {
      if (!selectedSubreddit) return;
      try {
        const res = await axiosClient.get(`/reddit/flairs?subreddit=${selectedSubreddit}`);
        setFlairs(res.data.flairs || []);
        setSelectedFlair(""); // reset selected flair
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch subreddit flairs");
        setFlairs([]);
      }
    };
    fetchFlairs();
  }, [selectedSubreddit]);

  // --- Toggle Handler ---
  const handleRedditAutoPostToggle = async () => {
    const newValue = !redditAutoPost;
    try {
      await axiosClient.put("/Redditpreferences", { autoPostReddit: newValue });
      setRedditAutoPost(newValue);
      toast.success(`Auto-post ${newValue ? "enabled" : "disabled"}`, { autoClose: 1000 });
    } catch (err) {
      toast.error("Failed to update preference");
    }
  };

  // ------------------ Reddit Manual Post ------------------
  const handlePostToReddit = async () => {
    if (!topic || !content) {
      toast.error("No content available to post");
      return;
    }
    if (!selectedSubreddit) {
      toast.error("Please select a subreddit");
      return;
    }

    try {
      // Step 1️⃣: Create or update unified draft post
      const createRes = await axiosClient.post("/unifiedPost/create", {
        postId: currentDraftId, // reuse existing draft if available
        title: topic,
        topic: selectTopic || "General",
        content,
        image: image || "",
        viralityScore,
        platform: "reddit",
        extra: {
          subreddit: selectedSubreddit,
          flairId: selectedFlair || null,
        },
      });

      const post = createRes.data.post;
      setCurrentDraftId(post._id); // store the draft ID for future reuse

      // Step 2️⃣: Post manually using unified route
      await axiosClient.post("/unifiedPost/manualPost", {
        postId: post._id,
        platform: "reddit",
      });

      toast.success(`Posted to r/${selectedSubreddit} successfully!`);
    } catch (err) {
      console.error("❌ Reddit post failed:", err);
      toast.error(err.response?.data?.error || "Failed to post on Reddit");
    }
  };

  useEffect(() => {
    if (redditAutoPost && topic && content && selectedSubreddit) {
      (async () => {
        try {
          // Step 1️⃣: Create or update unified draft post
          const createRes = await axiosClient.post("/unifiedPost/create", {
            postId: currentDraftId, // reuse existing draft
            title: topic,
            topic: selectTopic || "General",
            content,
            image: image || "",
            viralityScore,
            platform: "reddit",
            extra: {
              subreddit: selectedSubreddit,
              flairId: selectedFlair || null,
            },
          });

          const post = createRes.data.post;
          setCurrentDraftId(post._id); // store/update draft ID

          // Step 2️⃣: Manually post via unified route
          await axiosClient.post("/unifiedPost/manualPost", {
            postId: post._id,
            platform: "reddit",
          });

          toast.success(`Auto-posted to r/${selectedSubreddit}`);
        } catch (err) {
          console.error("❌ Auto-post to Reddit failed:", err);
          toast.error("Auto-post to Reddit failed");
        }
      })();
    }
  }, [redditAutoPost, topic, content, selectedSubreddit, selectedFlair]);

  // --- Facebook Related States ---
  
  const [facebookAutoPost, setFacebookAutoPost] = useState(false);
  const [facebookPages, setFacebookPages] = useState([]);
  const [selectedFacebookPages, setSelectedFacebookPages] = useState([]);

  // --- Fetch Facebook Pages ---
useEffect(() => {
  const fetchFacebookPages = async () => {
    try {
      const res = await axiosClient.get("/facebook/pages");
      setFacebookPages(res.data.pages || []);
    } catch (err) {
      console.error("Failed to fetch Facebook pages:", err);
      toast.error("Failed to fetch Facebook pages");
    }
  };
  fetchFacebookPages();
}, []);


  // --- Toggle Handler for Facebook Auto-Post ---
const handleFacebookAutoPostToggle = async () => {
  const newValue = !facebookAutoPost;
  try {
    await axiosClient.put("/facebook/preferences", { autoPostFacebook: newValue });
    setFacebookAutoPost(newValue);
    toast.success(`Facebook auto-post ${newValue ? "enabled" : "disabled"}`, { autoClose: 1000 });
  } catch (err) {
    console.error("Failed to update Facebook auto-post:", err);
    toast.error("Failed to update Facebook auto-post");
  }
};


// ------------------ Facebook Manual Post ------------------
const handleManualFacebookPost = async () => {
  if (!topic || !content) {
    toast.error("No content available to post");
    return;
  }

  if (!selectedFacebookPages.length) {
    toast.error("Please select at least one Facebook page");
    return;
  }

  try {
    // Step 1️⃣: Create or update unified draft post
    const createRes = await axiosClient.post("/unifiedPost/create", {
      postId: currentDraftId || undefined,
      title: topic || "Untitled Draft",
      topic: selectTopic || "General",
      content,
      image: image || "",
      viralityScore,
      platform: "facebook", // ✅ REQUIRED FIELD
      extra: { pageIds: selectedFacebookPages },
    });

    const post = createRes.data.post;
    setCurrentDraftId(post._id);

    // Step 2️⃣: Post manually to Facebook (multi-page support)
    await axiosClient.post("/unifiedPost/manualPost", {
      postId: post._id,
      platform: "facebook", // ✅ REQUIRED FIELD
      selectedPages: selectedFacebookPages, // ✅ send array of IDs
    });

    toast.success("Posted to all selected Facebook pages successfully!");
  } catch (err) {
    console.error("❌ Facebook post failed:", err);
    toast.error(err.response?.data?.error || "Failed to post on Facebook");
  }
};


// ------------------ Facebook Auto-Post Effect ------------------
useEffect(() => {
  if (facebookAutoPost && topic && content && selectedFacebookPages.length > 0) {
    (async () => {
      try {
        const createRes = await axiosClient.post("/unifiedPost/create", {
          postId: currentDraftId,
          title: topic || "Untitled Draft",
          topic: selectTopic || "General",
          content,
          image: image || "",
          viralityScore,
          platform: "facebook",
          extra: { pageIds: selectedFacebookPages },
        });

        const post = createRes.data.post;
        setCurrentDraftId(post._id);

        await Promise.all(
          selectedFacebookPages.map((pageId) =>
            axiosClient.post("/unifiedPost/manualPost", {
              postId: post._id,
              platform: "facebook",
              extra: { pageId },
            })
          )
        );

        toast.success("Auto-posted to selected Facebook pages successfully!");
      } catch (err) {
        console.error("❌ Auto-post to Facebook failed:", err);
        toast.error("Auto-post to Facebook failed");
      }
    })();
  }
}, [facebookAutoPost, topic, content, selectedFacebookPages]);


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-10 blur-xl"></div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <PenTool className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Create Blog Post
          </h1>
        </div>
        <p className="text-muted-foreground">
          Craft engaging LinkedIn content with AI-powered insights
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Topic Section */}
          <Card className="bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-4 w-4 text-blue-600" />
                Topic & Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Selection */}
              <div className="flex gap-3 mb-4">
                <Button
                  variant={postMode === "auto" ? "default" : "outline"}
                  className={`rounded-full ${postMode === "auto" ? "bg-blue-600 text-white" : ""}`}
                  onClick={() => setPostMode("auto")}
                >
                  Automated
                </Button>
                <Button
                  variant={postMode === "custom" ? "default" : "outline"}
                  className={`rounded-full ${postMode === "custom" ? "bg-green-600 text-white" : ""}`}
                  onClick={() => setPostMode("custom")}
                >
                  Custom
                </Button>
              </div>

              {/* Topic Input */}
              {postMode === "custom" ? (
                <>
                  <Label htmlFor="topic">Post Topic</Label>
                  <div className="relative">
                    <Input
                      id="topic"
                      placeholder="e.g., 'AI automation tips for marketing professionals'"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      className="pr-20"
                    />
                    {topic && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Badge
                          className={`bg-gradient-to-r ${getViralityColor(
                            viralityScore
                          )} text-white border-0 shadow-sm`}
                        >
                          <TrendingUp className="h-3 w-3" /> {viralityScore}% {getViralityText(viralityScore)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-lg text-blue-700 flex items-center justify-between w-full">
                  {topic ? (
                    <>
                      <div className="relative w-full">
                        <Input
                          className='pr-20'
                          id="topic"
                          value={topic}
                          onChange={e => setTopic(e.target.value)}
                        />
                        {
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Badge
                              className={`bg-gradient-to-r ${getViralityColor(
                                viralityScore
                              )} text-white border-0 shadow-sm`}
                            >
                              <TrendingUp className="h-3 w-3" /> {viralityScore}% {getViralityText(viralityScore)}
                            </Badge>
                          </div>
                        }
                      </div>
                    </>
                  ) : (
                    "Topic will be automatically selected from Google Trends."
                  )}
                </div>
              )}

              {/* Content Area */}
              <div className="space-y-2 mt-4">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your engaging LinkedIn post content here..."
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setGeneratedByAI(false); // user edited, so allow manual draft saving again
                  }}
                  className="min-h-48 resize-none text-lg lg:text-2xl"
                />
                <div className="flex flex-wrap gap-2 justify-between text-sm text-muted-foreground">
                  <span>{content.length} characters</span>
                  <span>
                    Recommended: 150-300 characters for optimal engagement
                  </span>
                </div>
              </div>

              {/* Language & Tone */}
              <div className="flex flex-row flex-wrap gap-8 mt-4">
                <div className="space-y-2 w-full lg:w-48">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">🇺🇸 English</SelectItem>
                      <SelectItem value="hindi">🇭🇮 Hindi</SelectItem>
                      <SelectItem value="french">🇫🇷 French</SelectItem>
                      <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 w-full lg:w-48">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Informative">Informative</SelectItem>
                      <SelectItem value="Emotional">Emotional</SelectItem>
                      <SelectItem value="Witty">Witty</SelectItem>
                      <SelectItem value="Authoritative">Authoritative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full lg:w-48">
                  <Label htmlFor="selectTopic">Topic</Label>
                  <Select value={selectTopic} onValueChange={setSelectTopic}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Productivity">Productivity</SelectItem>
                      <SelectItem value="Career">Career</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="AuthorLeadershipitative">Leadership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full lg:w-48">
                  <Label htmlFor="wordCount">Word Count</Label>
                  <Input
                    id="wordCount"
                    value={wordCount}
                    onChange={e => setWordCount(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-white to-purple-50/30 border-0 shadow-lg">
            <CardHeader>
              <CardTitle> Reddit Specific </CardTitle>
            </CardHeader>

            <CardContent>

              {/* Reddit Modal */}

              <div className="">
                <div className="">
                  <div className="space-y-1 pb-4"><Label>Select a Subreddit</Label></div>
                  
                  <select
                    className="border p-2 w-full mb-4"
                    value={selectedSubreddit}
                    onChange={(e) => setSelectedSubreddit(e.target.value)}
                  >
                    <option value="">-- Select a subreddit --</option>
                    {subredditData.subreddits.map((s) => (
                      <option key={s} value={s}>
                        r/{s}
                      </option>
                    ))}
                  </select>

                  {/* Flair dropdown */}
                  {flairs.length > 0 && (
                    <>
                      <Label className="block mb-1 font-medium">Select a Flair (optional)</Label>
                      <select
                        className="border p-2 w-full mb-4"
                        value={selectedFlair}
                        onChange={(e) => setSelectedFlair(e.target.value)}
                      >
                        <option value="">-- No flair / Default --</option>
                        {flairs.map(f => (
                          <option key={f.id} value={f.id}>
                            {f.text || "(No text)"}
                          </option>
                        ))}
                      </select>
                    </>
                  )}


                  {/* <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => setRedditModalOpen(false)}
                      className="bg-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePostToReddit}
                      className="bg-red-500 hover:bg-red-600"
                      disabled={!selectedSubreddit}
                    >
                      Post
                    </Button>
                  </div> */}
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Image Section (only for Custom posts) */}
          {(
            <Card className="bg-gradient-to-br from-white to-purple-50/30 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-purple-600" />
                  Visual Content
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {image ? (
                  <div className="relative group">
                    <img
                      src={image}
                      alt="Post preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                              transition-opacity rounded-lg flex items-center justify-center gap-3">
                      {/* View Image Button */}
                      <Button
                        variant="secondary"
                        onClick={() => setShowImageModal(true)}
                        className="bg-white/90 text-gray-900 hover:bg-white flex items-center gap-1"
                      >
                        <Maximize2 className="h-4 w-4" /> View
                      </Button>
                      {/* Remove Image Button */}
                      <Button
                        variant="secondary"
                        onClick={() => setImage(null)}
                        className="bg-white/90 text-gray-900 hover:bg-white"
                      >
                        Remove Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center space-y-4">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                    <div className="space-y-2">
                      <p className="text-muted-foreground">
                        Add visual content to boost engagement
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button variant="outline" className="gap-2" asChild>
                          <label className="cursor-pointer">
                            <Upload className="h-4 w-4" />
                            Upload Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-2 bg-gradient-to-r from-purple-50 to-violet-50 
                               border-purple-200 hover:from-purple-100 hover:to-violet-100"
                          onClick={generateImage}
                          disabled={isGeneratingImage}
                        >
                          <Wand2
                            className={`h-4 w-4 ${isGeneratingImage ? "animate-spin" : ""}`}
                          />
                          {isGeneratingImage ? "Generating..." : "Generate with AI"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardContent>
                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    {loading ? (
                      <>
                        Generating...
                        <span className="ml-2 animate-spin">⏳</span>
                      </>
                    ) : (
                      "Generate Blog"
                    )}
                  </Button>

                  {/* {!linkedinAutoPost && (
                    <Button
                      onClick={handleManualLinkedInPost}
                      className="bg-green-600 hover:bg-green-700 text-white px-6"
                    >
                      Post on LinkedIn
                    </Button>
                  )} */}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Full-Screen Image Modal */}
          {showImageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-5 right-5 text-white hover:text-gray-300"
              >
                <X className="h-8 w-8" />
              </button>
              <img
                src={image}
                alt="Full Size"
                className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
              />
            </div>
          )}


        </div>

        {/* Sidebar stays same */}
        <div className="space-y-6">
          {/* Settings */}
          <Card className="bg-gradient-to-br from-white to-green-50/30 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-600" />
                Publishing Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-post">Auto-post to LinkedIn</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically publish when ready
                  </p>
                </div>
                <Switch
                  id="auto-post"
                  checked={linkedinAutoPost}
                  onCheckedChange={handleAutoPostToggle}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-post">Auto-post to Reddit</Label>
                </div>
                <Switch
                  id="auto-post"
                  checked={redditAutoPost}
                  onCheckedChange={handleRedditAutoPostToggle}
                />
              </div>


              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-post">Auto-post to Facebook</Label>
                </div>
                <Switch
                  id="auto-post"
                  checked={facebookAutoPost}
                  onCheckedChange={handleFacebookAutoPostToggle}
                />
              </div>


              <Separator />

              <div className="space-y-3">
                <Button
                  className={`w-full gap-2 shadow-lg transition-all duration-300 ${linkedinAutoPost
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
                    }`}
                  onClick={handleManualLinkedInPost}
                  disabled={linkedinAutoPost}
                >
                  <Send className="h-4 w-4" />
                  Post Now to LinkedIn
                </Button>

                <Button
                  className={`w-full gap-2 shadow-lg transition-all duration-300 ${redditAutoPost
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-400 to-red-500 hover:from-red-600 hover:to-red-700 hover:shadow-xl"
                    }`}
                  onClick={handlePostToReddit}
                  disabled={!selectedSubreddit && redditAutoPost}
                >
                  <Send className="h-4 w-4" />
                  Post Now to Reddit
                </Button>

                {/* ✅ Facebook Page Checkbox Selector */}
                {facebookPages.length > 0 ? (
                  <div className="bg-gray-400 p-3 rounded-lg space-y-2 text-black">
                    <Label className="text-sm font-semibold">Select Your Facebook Pages to Post On</Label>

                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {facebookPages.map((page) => (
                        <label
                          key={page.pageId}
                          className="flex items-center gap-3 bg-gray-300 p-2 rounded-md hover:bg-gray-700 hover:text-white cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFacebookPages.includes(page.pageId)}
                            onChange={() => {
                              setSelectedFacebookPages((prev) =>
                                prev.includes(page.pageId)
                                  ? prev.filter((id) => id !== page.pageId)
                                  : [...prev, page.pageId]
                              );
                            }}
                            className="w-4 h-4 accent-blue-500"
                          />
                          {/* {page.picture ? (
                            <img
                              src={page.picture}
                              alt={page.pageName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs">
                              📘
                            </div>
                          )} */}
                          <span>{page.pageName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-black">No connected Facebook pages found</p>
                )}

                <Button
                  className={`w-full gap-2 shadow-lg transition-all duration-300 ${facebookAutoPost
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
                    }`}
                  onClick={handleManualFacebookPost}
                  disabled={facebookAutoPost}
                >
                  <Send className="h-4 w-4" />
                  Post Now to Facebook
                </Button>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleSaveDraft}
                  disabled={generatedByAI}
                  title={generatedByAI ? "Already saved as draft" : ""}
                >
                  <Save className="h-4 w-4" />
                  Save as Draft
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="bg-gradient-to-br from-white to-yellow-50/30 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-600" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">Trending Topics</p>
                <div className="space-y-2">
                  {[
                    "AI automation trends", "Remote work productivity", "LinkedIn marketing tips"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setTopic(suggestion)}
                      className="w-full text-left p-2 text-sm bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg hover:from-yellow-100 hover:to-amber-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Best Time to Post</p>
                <div className="text-sm text-muted-foreground">
                  {todayBest ? (
                    <>
                      📅 Today at {todayBest.hour}:00
                      <br />
                      🎯 {Math.round((todayBest.avg / 20) * 100)}% optimal engagement
                    </>
                  ) : (
                    <>Loading...</>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

}
