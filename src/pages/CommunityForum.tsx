import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useReputation } from "@/hooks/useReputation";
import Navigation from "@/components/Navigation";
import ImageUpload from "@/components/ImageUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Plus, Send, Flag, UserCircle, Heart, Lightbulb, Award, Mail, Image } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  user_id: string;
}

interface Comment {
  id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  user_id: string;
}

interface Reaction {
  id: string;
  user_id: string;
  reaction_type: string;
}

const CommunityForum = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { reputation, badges, updateReputation, addReaction, removeReaction } = useReputation(user?.id);
  
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [postReactions, setPostReactions] = useState<Record<string, Reaction[]>>({});
  const [loading, setLoading] = useState(true);
  
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostAnonymous, setNewPostAnonymous] = useState(true);
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  
  const [newComment, setNewComment] = useState("");
  const [newCommentAnonymous, setNewCommentAnonymous] = useState(true);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (selectedPost) {
      loadComments(selectedPost.id);
    }
  }, [selectedPost]);

  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forum_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } else {
      setPosts(data || []);
      await loadReactions(data || []);
    }
    setLoading(false);
  };

  const loadReactions = async (posts: ForumPost[]) => {
    const reactionsData: Record<string, Reaction[]> = {};
    
    for (const post of posts) {
      const { data } = await supabase
        .from("forum_reactions")
        .select("*")
        .eq("post_id", post.id);
      
      if (data) {
        reactionsData[post.id] = data;
      }
    }
    
    setPostReactions(reactionsData);
  };

  const loadComments = async (postId: string) => {
    const { data, error } = await supabase
      .from("forum_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } else {
      setComments(data || []);
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("forum_posts").insert({
      title: newPostTitle,
      content: newPostContent,
      is_anonymous: newPostAnonymous,
      user_id: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Post created successfully",
    });

    // Update reputation
    if (reputation) {
      await updateReputation({
        posts_count: reputation.posts_count + 1,
      });
    }

    setNewPostTitle("");
    setNewPostContent("");
    setNewPostImage(null);
    setShowImageUpload(false);
    setIsCreateDialogOpen(false);
    loadPosts();
  };

  const handleImageUploaded = (imageUrl: string) => {
    setNewPostImage(imageUrl);
  };

  const handleAddComment = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!selectedPost || !newComment.trim()) {
      toast({
        title: "Error",
        description: "Please write a comment",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("forum_comments").insert({
      post_id: selectedPost.id,
      content: newComment,
      is_anonymous: newCommentAnonymous,
      user_id: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      return;
    }

    // Update reputation
    if (reputation) {
      await updateReputation({
        comments_count: reputation.comments_count + 1,
      });
    }

    setNewComment("");
    loadComments(selectedPost.id);
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const existingReaction = postReactions[postId]?.find(
      (r) => r.user_id === user.id && r.reaction_type === reactionType
    );

    if (existingReaction) {
      await removeReaction(postId, null, reactionType);
    } else {
      await addReaction(postId, null, reactionType);
    }

    loadPosts();
  };

  const handleStartConversation = async (otherUserId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (otherUserId === user.id) {
      toast({
        title: "Error",
        description: "You cannot message yourself",
        variant: "destructive",
      });
      return;
    }

    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("*")
      .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${user.id})`)
      .maybeSingle();

    if (existingConv) {
      navigate("/messages");
      return;
    }

    // Create new conversation
    const { error } = await supabase.from("conversations").insert({
      participant_1_id: user.id,
      participant_2_id: otherUserId,
      is_anonymous: true,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
      return;
    }

    navigate("/messages");
  };

  const handleFlagPost = async (postId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const { error } = await supabase
      .from("forum_posts")
      .update({ 
        is_flagged: true, 
        flag_reason: "Flagged by user" 
      })
      .eq("id", postId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to flag post",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Post has been flagged for review",
    });

    loadPosts();
  };

  const getReactionCount = (postId: string, reactionType: string) => {
    return postReactions[postId]?.filter((r) => r.reaction_type === reactionType).length || 0;
  };

  const hasUserReacted = (postId: string, reactionType: string) => {
    return postReactions[postId]?.some((r) => r.user_id === user?.id && r.reaction_type === reactionType) || false;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Community Forum</h1>
            </div>
            <p className="text-muted-foreground">
              Share experiences and support each other in a safe space
            </p>
            {reputation && (
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="outline" className="gap-1">
                  <Award className="h-3 w-3" />
                  {reputation.total_points} points
                </Badge>
                <Badge variant="secondary">{badges.length} badges earned</Badge>
              </div>
            )}
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
                <DialogDescription>
                  Share your thoughts with the community. Images are AI-moderated for safety.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Post title"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Share your story..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                  />
                </div>
                
                {/* Image Upload Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Add Image (Optional)</Label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowImageUpload(!showImageUpload)}
                      className="gap-2"
                    >
                      <Image className="h-4 w-4" />
                      {showImageUpload ? "Hide" : "Add Image"}
                    </Button>
                  </div>
                  {showImageUpload && (
                    <ImageUpload onImageUploaded={handleImageUploaded} />
                  )}
                  {newPostImage && (
                    <div className="mt-2 relative">
                      <img 
                        src={newPostImage} 
                        alt="Post image" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Image attached</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous"
                    checked={newPostAnonymous}
                    onCheckedChange={setNewPostAnonymous}
                  />
                  <Label htmlFor="anonymous">Post anonymously</Label>
                </div>
                <Button onClick={handleCreatePost} className="w-full">
                  Create Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">All Posts</h2>
              {posts.map((post) => (
                <Card 
                  key={post.id} 
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setSelectedPost(post)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFlagPost(post.id);
                        }}
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      {post.is_anonymous ? (
                        <>
                          <UserCircle className="h-4 w-4" />
                          Anonymous
                        </>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                      {" • "}
                      {new Date(post.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-3">{post.content}</p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant={hasUserReacted(post.id, "helpful") ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReaction(post.id, "helpful");
                      }}
                    >
                      <Lightbulb className="h-4 w-4 mr-1" />
                      {getReactionCount(post.id, "helpful")}
                    </Button>
                    <Button
                      variant={hasUserReacted(post.id, "supportive") ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReaction(post.id, "supportive");
                      }}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {getReactionCount(post.id, "supportive")}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="sticky top-24 h-fit">
              {selectedPost ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>{selectedPost.title}</CardTitle>
                      {!selectedPost.is_anonymous && selectedPost.user_id !== user?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartConversation(selectedPost.user_id)}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      {selectedPost.is_anonymous ? (
                        <>
                          <UserCircle className="h-4 w-4" />
                          Anonymous
                        </>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                      {" • "}
                      {new Date(selectedPost.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-sm">{selectedPost.content}</p>
                    
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {comment.is_anonymous ? (
                                  <>
                                    <UserCircle className="h-3 w-3" />
                                    Anonymous
                                  </>
                                ) : (
                                  <Badge variant="outline" className="h-5">User</Badge>
                                )}
                                {" • "}
                                {new Date(comment.created_at).toLocaleDateString()}
                              </div>
                              {!comment.is_anonymous && comment.user_id !== user?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStartConversation(comment.user_id)}
                                >
                                  <Mail className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-3">
                    <div className="flex items-center space-x-2 w-full">
                      <Switch
                        id="comment-anonymous"
                        checked={newCommentAnonymous}
                        onCheckedChange={setNewCommentAnonymous}
                      />
                      <Label htmlFor="comment-anonymous" className="text-sm">Comment anonymously</Label>
                    </div>
                    <div className="flex gap-2 w-full">
                      <Input
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                      />
                      <Button onClick={handleAddComment} size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">
                      Select a post to view details and comments
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityForum;