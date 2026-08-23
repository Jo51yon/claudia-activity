export interface ClaudiaActivity {
  id: string;
  user_id: string | null;
  activity_type: string;
  activity_data: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
}
