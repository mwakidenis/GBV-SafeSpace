import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Shield,
  Award,
  MessageCircle,
  FileText,
  Heart,
  Settings,
  Calendar,
  Trophy,
  Star,
  Lock,
  BookOpen,
} from "lucide-react";
import { format } from "date-fns";

interface UserStats {
  postsCount: number;
  commentsCount: number;
  evidenceCount: number;
  messagesCount: number;
  totalPoints: number;
  badgesCount: number;
  lessonsCompleted: number;
}

interface Badge {
  id: string;
  badge_name: string;
  earned_at: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<{ full_name: string | null }>({ full_name: null });
  const [stats, setStats] = useState<UserStats>({
    postsCount: 0,
    commentsCount: 0,
    evidenceCount: 0,
    messagesCount: 0,
    totalPoints: 0,
    badgesCount: 0,
    lessonsCompleted: 0,
  });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    loadUserData();
  }, [user, authLoading, navigate]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile({ full_name: profileData.full_name });
      }

      // Load stats in parallel
      const [
        { count: postsCount },
        { count: commentsCount },
        { count: evidenceCount },
        { count: messagesCount },
        { data: reputationData },
        { data: badgesData },
        { count: lessonsCount },
      ] = await Promise.all([
        supabase.from("forum_posts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("forum_comments").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("evidence_files").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("private_messages").select("*", { count: "exact", head: true }).eq("sender_id", user.id),
        supabase.from("user_reputation").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_badges").select("*").eq("user_id", user.id),
        supabase.from("lesson_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", true),
      ]);

      setStats({
        postsCount: postsCount || 0,
        commentsCount: commentsCount || 0,
        evidenceCount: evidenceCount || 0,
        messagesCount: messagesCount || 0,
        totalPoints: reputationData?.total_points || 0,
        badgesCount: badgesData?.length || 0,
        lessonsCompleted: lessonsCount || 0,
      });

      setBadges(badgesData || []);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badgeName: string) => {
    if (badgeName.includes("First")) return <Star className="h-4 w-4" />;
    if (badgeName.includes("Helpful")) return <Heart className="h-4 w-4" />;
    if (badgeName.includes("Active")) return <MessageCircle className="h-4 w-4" />;
    if (badgeName.includes("Learner")) return <BookOpen className="h-4 w-4" />;
    return <Award className="h-4 w-4" />;
  };

  const calculateLevel = (points: number) => {
    if (points >= 1000) return { level: 5, name: "Guardian", progress: 100 };
    if (points >= 500) return { level: 4, name: "Advocate", progress: ((points - 500) / 500) * 100 };
    if (points >= 200) return { level: 3, name: "Supporter", progress: ((points - 200) / 300) * 100 };
    if (points >= 50) return { level: 2, name: "Member", progress: ((points - 50) / 150) * 100 };
    return { level: 1, name: "Newcomer", progress: (points / 50) * 100 };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const levelInfo = calculateLevel(stats.totalPoints);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">My Profile</h1>
          </div>
          <p className="text-muted-foreground">
            View your activity, achievements, and progress
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>{profile.full_name || "Anonymous User"}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge variant="outline" className="text-lg px-4 py-2 gap-2">
                  <Trophy className="h-4 w-4" />
                  Level {levelInfo.level}: {levelInfo.name}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to next level</span>
                  <span>{Math.round(levelInfo.progress)}%</span>
                </div>
                <Progress value={levelInfo.progress} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Points</span>
                <Badge>{stats.totalPoints} pts</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm">{user?.created_at ? format(new Date(user.created_at), "MMM yyyy") : "N/A"}</span>
              </div>

              <Button onClick={() => navigate("/settings")} variant="outline" className="w-full gap-2">
                <Settings className="h-4 w-4" />
                Edit Settings
              </Button>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="md:col-span-2">
            <Tabs defaultValue="stats" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="badges">Badges</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MessageCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.postsCount}</p>
                        <p className="text-sm text-muted-foreground">Forum Posts</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <MessageCircle className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.commentsCount}</p>
                        <p className="text-sm text-muted-foreground">Comments</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Lock className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.evidenceCount}</p>
                        <p className="text-sm text-muted-foreground">Evidence Files</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-destructive/10 rounded-lg">
                        <BookOpen className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.lessonsCompleted}</p>
                        <p className="text-sm text-muted-foreground">Lessons Done</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reputation Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Posts Created</span>
                      <span className="text-primary">+{stats.postsCount * 10} pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Comments Made</span>
                      <span className="text-primary">+{stats.commentsCount * 5} pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Lessons Completed</span>
                      <span className="text-primary">+{stats.lessonsCompleted * 20} pts</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center font-bold">
                      <span>Total Points</span>
                      <span className="text-primary">{stats.totalPoints} pts</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="badges" className="space-y-4">
                {badges.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {badges.map((badge) => (
                      <Card key={badge.id} className="p-4 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                          {getBadgeIcon(badge.badge_name)}
                        </div>
                        <h4 className="font-semibold text-sm">{badge.badge_name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(badge.earned_at), "MMM d, yyyy")}
                        </p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No Badges Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Keep participating in the community to earn badges!
                    </p>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Available Badges</CardTitle>
                    <CardDescription>Complete activities to unlock badges</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">First Post</p>
                        <p className="text-xs text-muted-foreground">Create your first forum post</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <Heart className="h-5 w-5 text-pink-500" />
                      <div>
                        <p className="font-medium">Helpful Member</p>
                        <p className="text-xs text-muted-foreground">Receive 10 helpful reactions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Quick Learner</p>
                        <p className="text-xs text-muted-foreground">Complete 5 lessons</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.postsCount > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <p className="text-sm">Created {stats.postsCount} forum posts</p>
                        </div>
                      )}
                      {stats.commentsCount > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-secondary" />
                          <p className="text-sm">Made {stats.commentsCount} comments</p>
                        </div>
                      )}
                      {stats.evidenceCount > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-accent" />
                          <p className="text-sm">Uploaded {stats.evidenceCount} evidence files</p>
                        </div>
                      )}
                      {stats.lessonsCompleted > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <p className="text-sm">Completed {stats.lessonsCompleted} lessons</p>
                        </div>
                      )}
                      {stats.postsCount === 0 && stats.commentsCount === 0 && stats.evidenceCount === 0 && (
                        <p className="text-muted-foreground text-center py-4">
                          No activity yet. Start by exploring the platform!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => navigate("/forum")} variant="outline" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Go to Forum
                  </Button>
                  <Button onClick={() => navigate("/learn")} variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Continue Learning
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
