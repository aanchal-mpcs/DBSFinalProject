export interface CourseMeeting {
  day: string;
  start: string; // e.g. "5:30pm"
  end: string; // e.g. "8:30pm"
  raw?: string;
}

export interface Course {
  id: string; // e.g. "MPCS-51100-1"
  code: string; // e.g. "MPCS 51100-1"
  name: string;
  instructor: string;
  location: string;
  meetingText: string;
  meetings: CourseMeeting[];
  detailUrl: string | null;
  term?: "Spring" | "Summer" | "Autumn" | "Winter";
  year?: number;
  color?: number;
  isWaitlisted?: boolean;
}

export interface Schedule {
  id: string;
  name: string;
  courses: Record<string, Course>;
}

export type ThemePreference = "system" | "light" | "dark";

export interface StorageData {
  schedules: Schedule[];
  activeScheduleIndex: number;
  themePreference: ThemePreference;
}

export interface Conflict {
  courseA: Course;
  courseB: Course;
  day: string;
  start: string;
  end: string;
}
