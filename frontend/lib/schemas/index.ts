import { z } from "zod";

//* Lore Piece Schema
export const lorePieceSchema = z.object({
  id: z.number().optional(),
  world_id: z.number().optional(),
  type: z.enum(["character", "faction", "setting", "relic", "event"]),
  name: z.string(),
  description: z.string(),
  details: z.record(z.string(), z.any()),
  created_at: z.string().optional(),
});

export type LorePiece = z.infer<typeof lorePieceSchema>;

//* Selected Lore Schema
export const selectedLoreSchema = z.object({
  character: lorePieceSchema.optional(),
  faction: lorePieceSchema.optional(),
  setting: lorePieceSchema.optional(),
  event: lorePieceSchema.optional(),
  relic: lorePieceSchema.optional(),
});

export type SelectedLore = z.infer<typeof selectedLoreSchema>;

//* Auth Schemas
export const registerRequestSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const loginRequestSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

export const authResponseSchema = z.object({
  token: z.string(),
  user: userSchema.pick({ id: true, username: true, email: true }),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

export const registerResponseSchema = z.object({
  user: userSchema,
});

export type RegisterResponse = z.infer<typeof registerResponseSchema>;

//* Story & World Schemas
export const fullStorySchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  theme: z.string().optional(),
  quest: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
  pieces: selectedLoreSchema.optional(),
});

export type FullStory = z.infer<typeof fullStorySchema>;

export const worldSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  user_name: z.string().optional(),
  status: z.string(),
  theme: z.string(),
  full_story: fullStorySchema,
  lore_pieces: z.array(lorePieceSchema).optional(),
  session_id: z.number().optional(),
  active_sessions: z.number().optional(),
  portrait_url: z.string().optional(),
  image_url: z.string().optional(),
  active_image_type: z.string(),
  visibility: z.string(),
  rating: z.number().optional(),
  user_rating: z.number().optional(),
  rating_count: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  relevance: z.number().optional(),
});

export type World = z.infer<typeof worldSchema>;

//* Adventure Schemas
export const adventureSessionSchema = z.object({
  id: z.number(),
  world_id: z.number(),
  protagonist: z.any().optional(),
});

export type AdventureSession = z.infer<typeof adventureSessionSchema>;

//* Generation Stage Type
export const generationStageSchema = z.enum([
  "characters",
  "factions",
  "settings",
  "events",
  "relics",
  "full-story",
]);

export type GenerationStage = z.infer<typeof generationStageSchema>;
