import type { Course, CourseMeeting, Conflict } from "./types";

// Convert time string like "5:30pm" to decimal hours (17.5)
export function timeToHours(timeStr: string): number | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toLowerCase();
  if (period === "pm" && hours !== 12) hours += 12;
  if (period === "am" && hours === 12) hours = 0;
  return hours + minutes / 60;
}

// Convert decimal hours to minutes from midnight
export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60);
}

// Format hour as display string
export function formatHour(h: number): string {
  const hour = Math.floor(h);
  const period = hour >= 12 ? "PM" : "AM";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display} ${period}`;
}

// Parse meeting time text: "Monday 5:30pm - 8:30pm"
export function parseMeetingTime(text: string): CourseMeeting[] {
  const lines = text
    .split(/\n|<br\s*\/?>/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.map((line) => {
    const match = line.match(
      /^(\w+)\s+(\d{1,2}:\d{2}(?:am|pm))\s*[-–]\s*(\d{1,2}:\d{2}(?:am|pm))$/i
    );
    if (!match) return { day: "", start: "", end: "", raw: line };
    return { day: match[1], start: match[2], end: match[3] };
  });
}

// Check if two meetings overlap
export function meetingsOverlap(a: CourseMeeting, b: CourseMeeting): boolean {
  if (!a.day || !b.day || a.day !== b.day) return false;
  const aStart = timeToHours(a.start);
  const aEnd = timeToHours(a.end);
  const bStart = timeToHours(b.start);
  const bEnd = timeToHours(b.end);
  if (aStart == null || aEnd == null || bStart == null || bEnd == null)
    return false;
  return aStart < bEnd && bStart < aEnd;
}

// Find all conflicts between courses
export function findConflicts(courses: Record<string, Course>): Conflict[] {
  const courseList = Object.values(courses);
  const conflicts: Conflict[] = [];

  for (let i = 0; i < courseList.length; i++) {
    for (let j = i + 1; j < courseList.length; j++) {
      const a = courseList[i];
      const b = courseList[j];
      for (const ma of a.meetings) {
        for (const mb of b.meetings) {
          if (meetingsOverlap(ma, mb)) {
            conflicts.push({ courseA: a, courseB: b, day: ma.day });
          }
        }
      }
    }
  }
  return conflicts;
}

// Check if a course conflicts with any saved courses
export function courseConflictsWithSaved(
  course: Course,
  savedCourses: Record<string, Course>
): Course[] {
  const conflicting: Course[] = [];
  for (const saved of Object.values(savedCourses)) {
    if (saved.id === course.id) continue;
    for (const ma of course.meetings) {
      for (const mb of saved.meetings) {
        if (meetingsOverlap(ma, mb)) {
          conflicting.push(saved);
          break;
        }
      }
    }
  }
  return conflicting;
}

// Build RateMyProfessor search URL
export function getRMPUrl(instructor: string): string {
  const encoded = encodeURIComponent(instructor + " University of Chicago");
  return `https://www.ratemyprofessors.com/search/professors?q=${encoded}&sid=U2Nob29sLTExMTI=`;
}

// Build course feedback URL
export function getCourseFeedbackUrl(): string {
  return "https://coursefeedback.uchicago.edu/";
}

// Color palette for course blocks
export const COURSE_COLORS = [
  "#2e7d32", // green
  "#1565c0", // blue
  "#6a1b9a", // purple
  "#ef6c00", // orange
  "#00838f", // teal
  "#ad1457", // pink
  "#4527a0", // deep purple
  "#558b2f", // light green
  "#c62828", // red
  "#00695c", // dark teal
];

// Generate ICS file content from courses
export function generateICS(courses: Record<string, Course>): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UChiSchedule//EN",
    "CALSCALE:GREGORIAN",
  ];

  // Use next Monday as reference date for the schedule
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + daysUntilMonday);

  const dayOffsets: Record<string, number> = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  };

  for (const course of Object.values(courses)) {
    for (const meeting of course.meetings) {
      if (!meeting.day || !meeting.start || !meeting.end) continue;
      const offset = dayOffsets[meeting.day];
      if (offset === undefined) continue;

      const startH = timeToHours(meeting.start);
      const endH = timeToHours(meeting.end);
      if (startH == null || endH == null) continue;

      const eventDate = new Date(monday);
      eventDate.setDate(monday.getDate() + offset);

      const startDate = new Date(eventDate);
      startDate.setHours(Math.floor(startH), Math.round((startH % 1) * 60), 0);
      const endDate = new Date(eventDate);
      endDate.setHours(Math.floor(endH), Math.round((endH % 1) * 60), 0);

      const fmt = (d: Date) =>
        d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

      lines.push("BEGIN:VEVENT");
      lines.push(`DTSTART:${fmt(startDate)}`);
      lines.push(`DTEND:${fmt(endDate)}`);
      lines.push(`SUMMARY:${course.code} - ${course.name}`);
      lines.push(`LOCATION:${course.location}`);
      lines.push(`DESCRIPTION:Instructor: ${course.instructor}`);
      lines.push(`UID:${course.id}-${meeting.day}@uchischedule`);
      lines.push("END:VEVENT");
    }
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
