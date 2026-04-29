export type GameStatus = "playing" | "played" | "plan-to-play";

export interface Game {
  id: number;
  slug: string;
  name: string;
  released: string;
  tba: boolean;
  background_image: string;
  rating: number;
  rating_top: number;
  ratings: any[];
  ratings_count: number;
  reviews_text_count: number;
  added: number;
  added_by_status: any;
  metacritic: number;
  playtime: number;
  suggestions_count: number;
  updated: string;
  user_game: any;
  reviews_count: number;
  saturated_color: string;
  dominant_color: string;
  platforms: any[];
  parent_platforms: any[];
  genres: any[];
  stores: any[];
  clip: any;
  tags: any[];
  esrb_rating: any;
  short_screenshots: any[];
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  image: string;
  percent: string;
  completed?: boolean;
}

export interface Quest {
  id: string;
  title: string;
  type: "main" | "side";
  completed: boolean;
}

export interface LibraryItem {
  id: string;
  userId: string;
  gameId: number;
  name: string;
  backgroundImage: string;
  status: GameStatus;
  addedAt: any;
  updatedAt: any;
  achievements: Achievement[];
  quests: Quest[];
  rating?: number; // 1-5
  review?: string;
  notes?: string;
  platforms?: string[];
  selectedPlatform?: string;
}
