export interface UserStats {
  id: number;
  xp: number;
  level: number;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  type: 'homework' | 'exam' | 'study';
  due_date: string;
  completed: boolean;
  xp_reward: number;
}

export interface Grade {
  id: number;
  subject: string;
  score: number;
  max_score: number;
  weight: number;
}

export interface TimetableEntry {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  subject: string;
}

export interface TimetableSettings {
  num_classes: number;
  start_time: string;
  class_duration: number;
  break_duration: number;
  break_after: number;
}
