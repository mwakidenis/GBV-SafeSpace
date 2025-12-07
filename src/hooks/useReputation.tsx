import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Reputation {
  total_points: number;
  posts_count: number;
  comments_count: number;
  helpful_reactions_received: number;
}

interface Badge {
  badge_name: string;
  earned_at: string;
}

const BADGE_THRESHOLDS = {
  first_post: { posts_count: 1, name: "First Steps", description: "Created your first post" },
  active_contributor: { posts_count: 5, name: "Active Contributor", description: "Created 5 posts" },
  community_leader: { posts_count: 20, name: "Community Leader", description: "Created 20 posts" },
  helpful_member: { helpful_reactions_received: 10, name: "Helpful Member", description: "Received 10 helpful reactions" },
  supportive_soul: { helpful_reactions_received: 50, name: "Supportive Soul", description: "Received 50 helpful reactions" },
  conversation_starter: { comments_count: 10, name: "Conversation Starter", description: "Posted 10 comments" },
};

export const useReputation = (userId: string | undefined) => {
  const [reputation, setReputation] = useState<Reputation | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadReputation();
      loadBadges();
    }
  }, [userId]);

  const loadReputation = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("user_reputation")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error loading reputation:", error);
      setLoading(false);
      return;
    }

    if (!data) {
      // Create initial reputation entry
      const { data: newRep, error: createError } = await supabase
        .from("user_reputation")
        .insert({
          user_id: userId,
          total_points: 0,
          posts_count: 0,
          comments_count: 0,
          helpful_reactions_received: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating reputation:", createError);
      } else {
        setReputation(newRep);
      }
    } else {
      setReputation(data);
    }

    setLoading(false);
  };

  const loadBadges = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("user_badges")
      .select("*")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    if (error) {
      console.error("Error loading badges:", error);
      return;
    }

    setBadges(data || []);
  };

  const updateReputation = async (updates: Partial<Reputation>) => {
    if (!userId || !reputation) return;

    const newRep = { ...reputation, ...updates };
    const points = 
      (newRep.posts_count * 10) + 
      (newRep.comments_count * 5) + 
      (newRep.helpful_reactions_received * 3);

    const { error } = await supabase
      .from("user_reputation")
      .update({
        ...updates,
        total_points: points,
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating reputation:", error);
      return;
    }

    setReputation({ ...newRep, total_points: points });
    await checkAndAwardBadges(newRep);
  };

  const checkAndAwardBadges = async (rep: Reputation) => {
    if (!userId) return;

    const earnedBadgeNames = badges.map((b) => b.badge_name);

    for (const [key, threshold] of Object.entries(BADGE_THRESHOLDS)) {
      if (earnedBadgeNames.includes(threshold.name)) continue;

      let shouldAward = false;

      if ("posts_count" in threshold && rep.posts_count >= threshold.posts_count) {
        shouldAward = true;
      } else if ("comments_count" in threshold && rep.comments_count >= threshold.comments_count) {
        shouldAward = true;
      } else if ("helpful_reactions_received" in threshold && rep.helpful_reactions_received >= threshold.helpful_reactions_received) {
        shouldAward = true;
      }

      if (shouldAward) {
        const { error } = await supabase.from("user_badges").insert({
          user_id: userId,
          badge_name: threshold.name,
        });

        if (!error) {
          toast({
            title: "New Badge Earned! 🎉",
            description: `${threshold.name}: ${threshold.description}`,
          });
          loadBadges();
        }
      }
    }
  };

  const addReaction = async (postId: string | null, commentId: string | null, reactionType: string) => {
    if (!userId) return;

    const { error } = await supabase.from("forum_reactions").insert({
      user_id: userId,
      post_id: postId,
      comment_id: commentId,
      reaction_type: reactionType,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Reaction added",
      description: "Your support has been recorded",
    });
  };

  const removeReaction = async (postId: string | null, commentId: string | null, reactionType: string) => {
    if (!userId) return;

    let query = supabase
      .from("forum_reactions")
      .delete()
      .eq("user_id", userId)
      .eq("reaction_type", reactionType);

    if (postId) {
      query = query.eq("post_id", postId);
    } else if (commentId) {
      query = query.eq("comment_id", commentId);
    }

    const { error } = await query;

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove reaction",
        variant: "destructive",
      });
    }
  };

  return {
    reputation,
    badges,
    loading,
    updateReputation,
    addReaction,
    removeReaction,
  };
};

export { BADGE_THRESHOLDS };