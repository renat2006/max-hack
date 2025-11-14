export type NotificationType =
  | "first_game"
  | "streak_milestone"
  | "score_milestone"
  | "game_complete"
  | "daily_reminder"
  | "achievement_unlock"
  | "leaderboard_rank";

export type NotificationTemplate = {
  title: string;
  message: string;
  emoji: string;
  withImage?: boolean;
  imageType?: "achievement" | "stats" | "streak" | "rank";
};

export const NOTIFICATIONS: Record<NotificationType, NotificationTemplate> = {
  first_game: {
    title: "🎮 First Game!",
    message: "Great start! You just completed your first mini-game. Keep it up!",
    emoji: "🎮",
    withImage: true,
    imageType: "achievement",
  },

  streak_milestone: {
    title: "🔥 Hot Streak!",
    message:
      "Incredible! You have {streakDays} days in a row of victories. You're a true champion!",
    emoji: "🔥",
    withImage: true,
    imageType: "streak",
  },

  score_milestone: {
    title: "⭐️ New Record!",
    message:
      "Congratulations! Your total score has reached {totalScore} points. Keep conquering the heights!",
    emoji: "⭐️",
    withImage: true,
    imageType: "stats",
  },

  game_complete: {
    title: "✅ Game Complete",
    message:
      "Orbit cleared! +{score} pts\nTotal: {totalScore} pts\nLevels: {levelsCleared}\nAccuracy: {accuracyPercent}%\nTime: {duration}",
    emoji: "✅",
    withImage: true,
    imageType: "stats",
  },

  daily_reminder: {
    title: "👋 Time to Play!",
    message:
      "Hey! Don't forget to log in today and improve your results. Your competitors are not sleeping!",
    emoji: "👋",
  },

  achievement_unlock: {
    title: "🏆 Achievement Unlocked!",
    message: "{achievementName}\n{achievementDescription}",
    emoji: "🏆",
    withImage: true,
    imageType: "achievement",
  },

  leaderboard_rank: {
    title: "📊 New Position in Rankings!",
    message: "You climbed to {rank} place in the overall ranking! Keep it up!",
    emoji: "📊",
    withImage: true,
    imageType: "rank",
  },
};

export const ACHIEVEMENT_DEFINITIONS = {
  first_steps: {
    name: "First Steps",
    description: "Completed the first mini-game",
    emoji: "👣",
  },
  speed_demon: {
    name: "Speed Demon",
    description: "Completed the game in record time",
    emoji: "⚡",
  },
  perfectionist: {
    name: "Perfectionist",
    description: "Got 100% accuracy in the game",
    emoji: "💯",
  },
  night_owl: {
    name: "Night Owl",
    description: "Played after midnight",
    emoji: "🦉",
  },
  dedication: {
    name: "Dedication",
    description: "Played 7 days in a row",
    emoji: "💪",
  },
  century: {
    name: "Century",
    description: "Scored 100+ points",
    emoji: "💯",
  },
  top_ten: {
    name: "Top 10",
    description: "Entered the top 10 rankings",
    emoji: "🔟",
  },
  champion: {
    name: "Champion",
    description: "Took 1st place in the rankings",
    emoji: "👑",
  },
};

export const BUTTON_LABELS = {
  play_now: "🎮 Play Now",
  view_stats: "📊 Statistics",
  leaderboard: "🏆 Leaderboard",
  share: "📤 Share",
};

export const formatMessage = (
  template: string,
  params: Record<string, string | number>,
): string => {
  let result = template;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`{${key}}`, String(value));
  });
  return result;
};
