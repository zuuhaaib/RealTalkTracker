export type ParticipantStats = {
  messages: number;
  words: number;
  characters: number;
  messagePercentage: number;
  averageWordsPerMessage: number;
};

export type BehaviorStats = {
  doubleTexts: number;
  conversationStarts: number;
  medianResponseTimeSeconds: number | null;
};

export type Awards = {
  biggestYapper: string | null;
  mostWords: string | null;
  longestMessages: string | null;
  conversationStarter: string | null;
  doubleTexter: string | null;
  fastestResponder: string | null;
};

export type HourActivity = {
  hour: number;
  messages: number;
};

export type WeekdayActivity = {
  day: string;
  messages: number;
};

export type MonthActivity = {
  month: string;
  messages: number;
};

export type ActivityStats = {
  messagesByHour: HourActivity[];
  messagesByWeekday: WeekdayActivity[];
  messagesByMonth: MonthActivity[];
  busiestHour: number | null;
  busiestDay: string | null;
  busiestMonth: string | null;
};

export type AIAnalysis = {
  funniest: {
    person: string;
    confidence: number;
    reason: string;
  };

  participants: Record<
    string,
    {
      humorStyle: string;
      textingStyle: string;
      summary: string;
    }
  >;

  conversationDynamic: string;
  recurringTopics: string[];
  insideJokesOrPatterns: string[];
  interestingObservations: string[];

  // How much of the chat the AI actually saw.
  sample?: {
    excerpts: number;
    sampledMessages: number;
    readableMessages: number;
  };
};

export type AnalyzeResponse = {
  platform: "whatsapp" | "instagram";
  messageCount: number;

  statistics: {
    totalMessages: number;
    participants: Record<string, ParticipantStats>;
  };

  behavior: Record<string, BehaviorStats>;
  awards: Awards;
  activity: ActivityStats;
  aiAnalysis: AIAnalysis | { error: string };
};