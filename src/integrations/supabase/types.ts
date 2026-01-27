export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action_type: string
          actor_id: string | null
          created_at: string
          id: string
          new_state: Json | null
          notes: string | null
          previous_state: Json | null
          target_entity_id: string
          target_entity_type: string
        }
        Insert: {
          action_type: string
          actor_id?: string | null
          created_at?: string
          id?: string
          new_state?: Json | null
          notes?: string | null
          previous_state?: Json | null
          target_entity_id: string
          target_entity_type: string
        }
        Update: {
          action_type?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          new_state?: Json | null
          notes?: string | null
          previous_state?: Json | null
          target_entity_id?: string
          target_entity_type?: string
        }
        Relationships: []
      }
      blocks: {
        Row: {
          created_at: string | null
          target_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          target_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          target_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          body: string
          created_at: string | null
          id: string
          is_removed: boolean | null
          post_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          is_removed?: boolean | null
          post_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          is_removed?: boolean | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          avatar_url: string | null
          cover_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          follower_count: number | null
          handle: string
          id: string
          is_private: boolean | null
          member_count: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          follower_count?: number | null
          handle: string
          id?: string
          is_private?: boolean | null
          member_count?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          follower_count?: number | null
          handle?: string
          id?: string
          is_private?: boolean | null
          member_count?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_follows: {
        Row: {
          community_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_follows_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_memberships: {
        Row: {
          community_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          caption: string | null
          community_id: string
          created_at: string | null
          id: string
          post_id: string
          shared_by: string
        }
        Insert: {
          caption?: string | null
          community_id: string
          created_at?: string | null
          id?: string
          post_id: string
          shared_by: string
        }
        Update: {
          caption?: string | null
          community_id?: string
          created_at?: string | null
          id?: string
          post_id?: string
          shared_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          is_muted: boolean | null
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          is_muted?: boolean | null
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          is_muted?: boolean | null
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      creator_contribution_scores: {
        Row: {
          account_age_days: number
          activity_score: number
          ccs_score: number
          community_participation: number
          completion_rate: number
          created_at: string
          eligibility_reason: string | null
          eligibility_updated_at: string | null
          eligible_for_earnings: boolean
          estimated_reach: number
          id: string
          interaction_views_30d: number
          interactions_completed: number
          interactions_declined: number
          profile_views_30d: number
          reports_against_others: number
          reports_received: number
          tier_multiplier: number
          updated_at: string
          user_id: string
          visibility_weight: number
        }
        Insert: {
          account_age_days?: number
          activity_score?: number
          ccs_score?: number
          community_participation?: number
          completion_rate?: number
          created_at?: string
          eligibility_reason?: string | null
          eligibility_updated_at?: string | null
          eligible_for_earnings?: boolean
          estimated_reach?: number
          id?: string
          interaction_views_30d?: number
          interactions_completed?: number
          interactions_declined?: number
          profile_views_30d?: number
          reports_against_others?: number
          reports_received?: number
          tier_multiplier?: number
          updated_at?: string
          user_id: string
          visibility_weight?: number
        }
        Update: {
          account_age_days?: number
          activity_score?: number
          ccs_score?: number
          community_participation?: number
          completion_rate?: number
          created_at?: string
          eligibility_reason?: string | null
          eligibility_updated_at?: string | null
          eligible_for_earnings?: boolean
          estimated_reach?: number
          id?: string
          interaction_views_30d?: number
          interactions_completed?: number
          interactions_declined?: number
          profile_views_30d?: number
          reports_against_others?: number
          reports_received?: number
          tier_multiplier?: number
          updated_at?: string
          user_id?: string
          visibility_weight?: number
        }
        Relationships: []
      }
      creator_score_audit_logs: {
        Row: {
          change_type: string
          created_at: string
          id: string
          new_value: Json | null
          previous_value: Json | null
          reason: string | null
          user_id: string
        }
        Insert: {
          change_type: string
          created_at?: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          reason?: string | null
          user_id: string
        }
        Update: {
          change_type?: string
          created_at?: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      drafts: {
        Row: {
          content_type: string
          created_at: string | null
          draft_data: Json
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string | null
          draft_data?: Json
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string | null
          draft_data?: Json
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expression_reactions: {
        Row: {
          created_at: string
          emoji: string
          expression_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          expression_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          expression_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expression_reactions_expression_id_fkey"
            columns: ["expression_id"]
            isOneToOne: false
            referencedRelation: "expressions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expression_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expression_replies: {
        Row: {
          content: string
          created_at: string
          expression_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          expression_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          expression_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expression_replies_expression_id_fkey"
            columns: ["expression_id"]
            isOneToOne: false
            referencedRelation: "expressions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expression_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expression_responses: {
        Row: {
          created_at: string | null
          expression_id: string | null
          id: string
          response_data: Json
          sticker_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expression_id?: string | null
          id?: string
          response_data?: Json
          sticker_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expression_id?: string | null
          id?: string
          response_data?: Json
          sticker_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expression_responses_expression_id_fkey"
            columns: ["expression_id"]
            isOneToOne: false
            referencedRelation: "expressions"
            referencedColumns: ["id"]
          },
        ]
      }
      expression_views: {
        Row: {
          completed: boolean | null
          expression_id: string
          id: string
          viewed_at: string
          viewer_id: string
          watch_duration_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          expression_id: string
          id?: string
          viewed_at?: string
          viewer_id: string
          watch_duration_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          expression_id?: string
          id?: string
          viewed_at?: string
          viewer_id?: string
          watch_duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "expression_views_expression_id_fkey"
            columns: ["expression_id"]
            isOneToOne: false
            referencedRelation: "expressions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expression_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expressions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          media_type: string
          media_url: string
          thumbnail_url: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string
          media_url: string
          thumbnail_url?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string
          media_url?: string
          thumbnail_url?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "expressions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
          status: Database["public"]["Enums"]["follow_status"] | null
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
          status?: Database["public"]["Enums"]["follow_status"] | null
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
          status?: Database["public"]["Enums"]["follow_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          amount_due: number
          cancelled_by: string | null
          client_base_price: number
          client_user_id: string
          created_at: string
          id: string
          metadata: Json | null
          notes: string | null
          provider_tier_price: number
          provider_user_id: string
          status: Database["public"]["Enums"]["interaction_status"]
          updated_at: string
        }
        Insert: {
          amount_due?: number
          cancelled_by?: string | null
          client_base_price?: number
          client_user_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          provider_tier_price?: number
          provider_user_id: string
          status?: Database["public"]["Enums"]["interaction_status"]
          updated_at?: string
        }
        Update: {
          amount_due?: number
          cancelled_by?: string | null
          client_base_price?: number
          client_user_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          provider_tier_price?: number
          provider_user_id?: string
          status?: Database["public"]["Enums"]["interaction_status"]
          updated_at?: string
        }
        Relationships: []
      }
      media_user_tags: {
        Row: {
          created_at: string | null
          id: string
          media_index: number | null
          position_x: number | null
          position_y: number | null
          post_id: string | null
          tagged_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          media_index?: number | null
          position_x?: number | null
          position_y?: number | null
          post_id?: string | null
          tagged_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          media_index?: number | null
          position_x?: number | null
          position_y?: number | null
          post_id?: string | null
          tagged_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_user_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_user_tags_tagged_user_id_fkey"
            columns: ["tagged_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          message_type: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          message_type?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          message_type?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mutes: {
        Row: {
          created_at: string | null
          target_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          target_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          target_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mutes_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mutes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          comments_enabled: boolean
          created_at: string
          follows_enabled: boolean
          id: string
          interactions_enabled: boolean
          mentions_enabled: boolean
          push_enabled: boolean
          reactions_enabled: boolean
          replies_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_enabled?: boolean
          created_at?: string
          follows_enabled?: boolean
          id?: string
          interactions_enabled?: boolean
          mentions_enabled?: boolean
          push_enabled?: boolean
          reactions_enabled?: boolean
          replies_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_enabled?: boolean
          created_at?: string
          follows_enabled?: boolean
          id?: string
          interactions_enabled?: boolean
          mentions_enabled?: boolean
          push_enabled?: boolean
          reactions_enabled?: boolean
          replies_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          message: string | null
          read_at: string | null
          target_id: string | null
          target_thumbnail_url: string | null
          target_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          read_at?: string | null
          target_id?: string | null
          target_thumbnail_url?: string | null
          target_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          read_at?: string | null
          target_id?: string | null
          target_thumbnail_url?: string | null
          target_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_items: {
        Row: {
          added_at: string | null
          playlist_id: string
          position: number
          post_id: string
        }
        Insert: {
          added_at?: string | null
          playlist_id: string
          position: number
          post_id: string
        }
        Update: {
          added_at?: string | null
          playlist_id?: string
          position?: number
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          option_index: number
          poll_id: string
          user_id: string
          voted_at: string | null
        }
        Insert: {
          option_index: number
          poll_id: string
          user_id: string
          voted_at?: string | null
        }
        Update: {
          option_index?: number
          poll_id?: string
          user_id?: string
          voted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string | null
          duration_hours: number | null
          ends_at: string | null
          id: string
          is_anonymous: boolean | null
          options: Json
          post_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_hours?: number | null
          ends_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          options?: Json
          post_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_hours?: number | null
          ends_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          options?: Json
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tag_map: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tag_map_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tag_map_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "topic_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      post_views: {
        Row: {
          id: string
          post_id: string
          view_duration_seconds: number | null
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          post_id: string
          view_duration_seconds?: number | null
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          post_id?: string
          view_duration_seconds?: number | null
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          community_id: string | null
          content: string | null
          content_warning_enabled: boolean | null
          content_warning_type:
            | Database["public"]["Enums"]["content_warning_type"]
            | null
          created_at: string | null
          id: string
          language_code: string | null
          media_meta: Json | null
          media_type: string | null
          media_url: string | null
          moderation_status:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          thumbnail_url: string | null
          tone: Database["public"]["Enums"]["emotional_tone"] | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          author_id: string
          community_id?: string | null
          content?: string | null
          content_warning_enabled?: boolean | null
          content_warning_type?:
            | Database["public"]["Enums"]["content_warning_type"]
            | null
          created_at?: string | null
          id?: string
          language_code?: string | null
          media_meta?: Json | null
          media_type?: string | null
          media_url?: string | null
          moderation_status?:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          thumbnail_url?: string | null
          tone?: Database["public"]["Enums"]["emotional_tone"] | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          author_id?: string
          community_id?: string | null
          content?: string | null
          content_warning_enabled?: boolean | null
          content_warning_type?:
            | Database["public"]["Enums"]["content_warning_type"]
            | null
          created_at?: string | null
          id?: string
          language_code?: string | null
          media_meta?: Json | null
          media_type?: string | null
          media_url?: string | null
          moderation_status?:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          thumbnail_url?: string | null
          tone?: Database["public"]["Enums"]["emotional_tone"] | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          cover_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          handle: string | null
          id: string
          is_private: boolean | null
          is_verified: boolean | null
          language_pref: string | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          handle?: string | null
          id: string
          is_private?: boolean | null
          is_verified?: boolean | null
          language_pref?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          handle?: string | null
          id?: string
          is_private?: boolean | null
          is_verified?: boolean | null
          language_pref?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          p256dh_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          type?: Database["public"]["Enums"]["reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          details: string | null
          id: string
          internal_notes: string | null
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"] | null
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          id?: string
          internal_notes?: string | null
          reason: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string | null
          details?: string | null
          id?: string
          internal_notes?: string | null
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saves: {
        Row: {
          created_at: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saves_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_posts: {
        Row: {
          created_at: string | null
          id: string
          post_data: Json
          scheduled_for: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_data: Json
          scheduled_for: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_data?: Json
          scheduled_for?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      service_directory_entries: {
        Row: {
          created_at: string | null
          delivery_type: string | null
          description: string | null
          id: string
          languages_supported: string[] | null
          links: Json | null
          name: string
          owner_profile_id: string | null
          owner_user_id: string
          price_range: string | null
          regions_served: string[] | null
          tags: string[] | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          delivery_type?: string | null
          description?: string | null
          id?: string
          languages_supported?: string[] | null
          links?: Json | null
          name: string
          owner_profile_id?: string | null
          owner_user_id: string
          price_range?: string | null
          regions_served?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          delivery_type?: string | null
          description?: string | null
          id?: string
          languages_supported?: string[] | null
          links?: Json | null
          name?: string
          owner_profile_id?: string | null
          owner_user_id?: string
          price_range?: string | null
          regions_served?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "service_directory_entries_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_directory_entries_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_tags: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_community_members: {
        Row: {
          created_at: string
          id: string
          member_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          member_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_community_members_member_user_id_fkey"
            columns: ["member_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_device_metrics: {
        Row: {
          device_pixel_ratio: number
          device_type: string
          pointer_type: string
          updated_at: string
          user_id: string
          viewport_width: number
        }
        Insert: {
          device_pixel_ratio: number
          device_type?: string
          pointer_type?: string
          updated_at?: string
          user_id: string
          viewport_width: number
        }
        Update: {
          device_pixel_ratio?: number
          device_type?: string
          pointer_type?: string
          updated_at?: string
          user_id?: string
          viewport_width?: number
        }
        Relationships: []
      }
      user_grid_layout_preference: {
        Row: {
          created_at: string
          id: string
          layout_style: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          layout_style?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          layout_style?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_pathways: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          pathway_type: string
          started_at: string | null
          status: Database["public"]["Enums"]["pathway_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          pathway_type: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["pathway_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          pathway_type?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["pathway_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profile_grid_order: {
        Row: {
          id: string
          ordered_post_ids: string[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          ordered_post_ids?: string[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          ordered_post_ids?: string[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profile_grid_order_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile_tab_order: {
        Row: {
          id: string
          ordered_tab_ids: string[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          ordered_tab_ids?: string[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          ordered_tab_ids?: string[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profile_tab_order_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          amount_due: number | null
          billing_period: Database["public"]["Enums"]["billing_period"] | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          plan_type: Database["public"]["Enums"]["plan_type"] | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscriber_count: number | null
          tier_colour: Database["public"]["Enums"]["era_tier"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_due?: number | null
          billing_period?: Database["public"]["Enums"]["billing_period"] | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          plan_type?: Database["public"]["Enums"]["plan_type"] | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscriber_count?: number | null
          tier_colour?: Database["public"]["Enums"]["era_tier"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_due?: number | null
          billing_period?: Database["public"]["Enums"]["billing_period"] | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          plan_type?: Database["public"]["Enums"]["plan_type"] | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscriber_count?: number | null
          tier_colour?: Database["public"]["Enums"]["era_tier"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_support_links: {
        Row: {
          created_at: string
          id: string
          organization_name: string | null
          provider_role: string
          provider_user_id: string
          status: Database["public"]["Enums"]["support_link_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_name?: string | null
          provider_role: string
          provider_user_id: string
          status?: Database["public"]["Enums"]["support_link_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_name?: string | null
          provider_role?: string
          provider_user_id?: string
          status?: Database["public"]["Enums"]["support_link_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          account_type_requested: string | null
          admin_notes: string | null
          created_at: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          submitted_fields: Json | null
          user_id: string
        }
        Insert: {
          account_type_requested?: string | null
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          submitted_fields?: Json | null
          user_id: string
        }
        Update: {
          account_type_requested?: string | null
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          submitted_fields?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_cards: {
        Row: {
          card_data: Json
          card_type: string
          id: string
          post_id: string | null
          timestamp_seconds: number
        }
        Insert: {
          card_data?: Json
          card_type: string
          id?: string
          post_id?: string | null
          timestamp_seconds: number
        }
        Update: {
          card_data?: Json
          card_type?: string
          id?: string
          post_id?: string | null
          timestamp_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "video_cards_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      video_chapters: {
        Row: {
          id: string
          post_id: string | null
          timestamp_seconds: number
          title: string
        }
        Insert: {
          id?: string
          post_id?: string | null
          timestamp_seconds: number
          title: string
        }
        Update: {
          id?: string
          post_id?: string | null
          timestamp_seconds?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_chapters_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_ccs_change: {
        Args: {
          p_change_type: string
          p_new_value: Json
          p_previous_value: Json
          p_reason?: string
          p_user_id: string
        }
        Returns: undefined
      }
      user_is_conversation_participant: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      billing_period: "monthly" | "yearly"
      content_warning_type: "sensitive" | "triggering" | "graphic" | "other"
      emotional_tone: "support" | "steady" | "inspiration" | "progress"
      era_tier: "pink" | "green" | "blue" | "purple" | "orange"
      follow_status: "requested" | "approved"
      interaction_status:
        | "draft"
        | "requested"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "accepted"
        | "declined"
      moderation_status: "published" | "limited" | "removed"
      pathway_status: "available" | "in_progress" | "completed"
      plan_type: "free" | "client" | "provider"
      reaction_type: "heart" | "hug"
      report_status: "new" | "reviewing" | "actioned" | "dismissed"
      subscription_plan: "free" | "creator" | "professional" | "organization"
      subscription_status: "active" | "canceled" | "past_due" | "trialing"
      support_link_status: "pending" | "active" | "inactive" | "ended"
      user_type: "individual" | "organization" | "professional"
      verification_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      billing_period: ["monthly", "yearly"],
      content_warning_type: ["sensitive", "triggering", "graphic", "other"],
      emotional_tone: ["support", "steady", "inspiration", "progress"],
      era_tier: ["pink", "green", "blue", "purple", "orange"],
      follow_status: ["requested", "approved"],
      interaction_status: [
        "draft",
        "requested",
        "confirmed",
        "completed",
        "cancelled",
        "accepted",
        "declined",
      ],
      moderation_status: ["published", "limited", "removed"],
      pathway_status: ["available", "in_progress", "completed"],
      plan_type: ["free", "client", "provider"],
      reaction_type: ["heart", "hug"],
      report_status: ["new", "reviewing", "actioned", "dismissed"],
      subscription_plan: ["free", "creator", "professional", "organization"],
      subscription_status: ["active", "canceled", "past_due", "trialing"],
      support_link_status: ["pending", "active", "inactive", "ended"],
      user_type: ["individual", "organization", "professional"],
      verification_status: ["pending", "approved", "rejected"],
    },
  },
} as const
