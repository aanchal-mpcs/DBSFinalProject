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
}

export interface Schedule {
  id: string;
  name: string;
  courses: Record<string, Course>;
}

export interface StorageData {
  schedules: Schedule[];
  activeScheduleIndex: number;
}

export interface Conflict {
  courseA: Course;
  courseB: Course;
  day: string;
}
