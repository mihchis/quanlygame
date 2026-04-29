import { useMemo } from "react";
import { useLibrary } from "./useLibrary";

export function useUserStats() {
  const { library } = useLibrary();

  const stats = useMemo(() => {
    const playedGames = library.filter(i => i.status === "completed").length;
    const completedAchievements = library.reduce((acc, curr) => acc + (curr.achievements?.filter(a => a.completed).length || 0), 0);
    const completedQuests = library.reduce((acc, curr) => acc + (curr.quests?.filter(q => q.completed).length || 0), 0);

    // XP Formula: 100 per game played, 10 per achievement, 5 per quest
    const totalXP = (playedGames * 100) + (completedAchievements * 10) + (completedQuests * 5);
    
    // Level Formula: Each level requires 500 XP
    const level = Math.floor(totalXP / 500) + 1;
    const currentLevelXP = totalXP % 500;
    const nextLevelXP = 500;
    const progress = (currentLevelXP / nextLevelXP) * 100;

    return {
      totalXP,
      level,
      currentLevelXP,
      nextLevelXP,
      progress,
      playedGames,
      completedAchievements,
      completedQuests
    };
  }, [library]);

  return stats;
}
