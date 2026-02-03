export interface PlanItem {
  content: string;
  completed: boolean;
  calories?: number;
  duration?: string;
}

export interface DailyPlan {
  day: string;
  focus?: string;
  lastUpdated?: number; // Timestamp
  exercises: PlanItem[];
  diet: PlanItem[];
  // completed: boolean; // Removed global day completion in favor of granular tracking
}
