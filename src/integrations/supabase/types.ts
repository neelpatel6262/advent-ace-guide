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
      itineraries: {
        Row: {
          budget: string
          created_at: string
          destination: string
          end_date: string
          id: string
          interests: string
          is_favorite: boolean | null
          itinerary_data: Json
          start_date: string
          travelers: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          budget: string
          created_at?: string
          destination: string
          end_date: string
          id?: string
          interests: string
          is_favorite?: boolean | null
          itinerary_data: Json
          start_date: string
          travelers: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          budget?: string
          created_at?: string
          destination?: string
          end_date?: string
          id?: string
          interests?: string
          is_favorite?: boolean | null
          itinerary_data?: Json
          start_date?: string
          travelers?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      journey_segments: {
        Row: {
          arrival_time: string | null
          booking_link: string | null
          carbon_kg: number | null
          cost: number | null
          created_at: string | null
          departure_time: string | null
          duration_minutes: number | null
          from_location: string
          id: string
          luggage_policy: string | null
          notes: string | null
          provider_name: string | null
          route_id: string | null
          segment_order: number
          to_location: string
          transport_type: string
        }
        Insert: {
          arrival_time?: string | null
          booking_link?: string | null
          carbon_kg?: number | null
          cost?: number | null
          created_at?: string | null
          departure_time?: string | null
          duration_minutes?: number | null
          from_location: string
          id?: string
          luggage_policy?: string | null
          notes?: string | null
          provider_name?: string | null
          route_id?: string | null
          segment_order: number
          to_location: string
          transport_type: string
        }
        Update: {
          arrival_time?: string | null
          booking_link?: string | null
          carbon_kg?: number | null
          cost?: number | null
          created_at?: string | null
          departure_time?: string | null
          duration_minutes?: number | null
          from_location?: string
          id?: string
          luggage_policy?: string | null
          notes?: string | null
          provider_name?: string | null
          route_id?: string | null
          segment_order?: number
          to_location?: string
          transport_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_segments_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "multi_transport_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      multi_transport_routes: {
        Row: {
          carbon_footprint_kg: number | null
          comfort_rating: number | null
          created_at: string | null
          destination_coordinates: Json | null
          destination_location: string
          id: string
          initial_transit_time_minutes: number | null
          is_recommended: boolean | null
          itinerary_id: string | null
          journey_segments: Json | null
          num_transfers: number | null
          origin_coordinates: Json | null
          origin_location: string
          route_type: string | null
          starting_address: string
          starting_coordinates: Json | null
          starting_location_id: string | null
          total_cost: number | null
          total_duration_including_start: number | null
          total_duration_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          carbon_footprint_kg?: number | null
          comfort_rating?: number | null
          created_at?: string | null
          destination_coordinates?: Json | null
          destination_location: string
          id?: string
          initial_transit_time_minutes?: number | null
          is_recommended?: boolean | null
          itinerary_id?: string | null
          journey_segments?: Json | null
          num_transfers?: number | null
          origin_coordinates?: Json | null
          origin_location: string
          route_type?: string | null
          starting_address: string
          starting_coordinates?: Json | null
          starting_location_id?: string | null
          total_cost?: number | null
          total_duration_including_start?: number | null
          total_duration_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          carbon_footprint_kg?: number | null
          comfort_rating?: number | null
          created_at?: string | null
          destination_coordinates?: Json | null
          destination_location?: string
          id?: string
          initial_transit_time_minutes?: number | null
          is_recommended?: boolean | null
          itinerary_id?: string | null
          journey_segments?: Json | null
          num_transfers?: number | null
          origin_coordinates?: Json | null
          origin_location?: string
          route_type?: string | null
          starting_address?: string
          starting_coordinates?: Json | null
          starting_location_id?: string | null
          total_cost?: number | null
          total_duration_including_start?: number | null
          total_duration_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "multi_transport_routes_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "multi_transport_routes_starting_location_id_fkey"
            columns: ["starting_location_id"]
            isOneToOne: false
            referencedRelation: "saved_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_locations: {
        Row: {
          address: string
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          latitude: number | null
          location_name: string
          location_type: string | null
          longitude: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          latitude?: number | null
          location_name: string
          location_type?: string | null
          longitude?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          latitude?: number | null
          location_name?: string
          location_type?: string | null
          longitude?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
