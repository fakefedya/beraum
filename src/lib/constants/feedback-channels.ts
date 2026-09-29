export const FEEDBACK_CHANNELS = ["telegram", "max", "email"] as const;

export type FeedbackChannel = (typeof FEEDBACK_CHANNELS)[number];

export const FEEDBACK_CHANNEL_LABELS: Record<FeedbackChannel, string> = {
  telegram: "Телеграм",
  max: "MAX",
  email: "Почта",
};
