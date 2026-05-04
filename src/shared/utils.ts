import type { Course, CourseMeeting, Conflict } from "./types";
import { QUARTER_DATE_RANGES } from "./quarterDates";

export const UCHICAGO_REGISTRATION_URL =
  "https://coursesearch92.ais.uchicago.edu/psc/prd92guest/EMPLOYEE/HRMS/c/UC_STUDENT_RECORDS_FL.UC_CLASS_SEARCH_FL.GBL";

export interface CourseCodeParts {
  subject: string;
  catalogNumber: string;
  section: string | null;
}

export function getCourseQuarterLabel(course: Course): string | null {
  if (!course.term || !course.year) return null;
  return `${course.term} ${course.year}`;
}

export function inferScheduleQuarterLabel(courses: Record<string, Course>): string | null {
  const quarterLabels = new Set(
    Object.values(courses)
      .map(getCourseQuarterLabel)
      .filter((label): label is string => Boolean(label))
  );

  if (quarterLabels.size !== 1) return null;
  return Array.from(quarterLabels)[0];
}

export function isGenericScheduleName(name: string): boolean {
  return /^Schedule \d+(?: Copy)?$/.test(name.trim());
}

export function isAutoScheduleName(name: string): boolean {
  return (
    isGenericScheduleName(name) ||
    /^(Spring|Summer|Autumn|Winter) \d{4}(?: Copy)?$/.test(name.trim())
  );
}

export function deriveScheduleName(
  courses: Record<string, Course>,
  fallbackName: string
): string {
  return inferScheduleQuarterLabel(courses) ?? fallbackName;
}

export function recomputeAutoScheduleName(
  name: string,
  courses: Record<string, Course>,
  fallbackName: string
): string {
  if (!isAutoScheduleName(name)) return name;

  const suffix = name.trim().endsWith(" Copy") ? " Copy" : "";
  return `${deriveScheduleName(courses, fallbackName)}${suffix}`;
}

// Convert time string like "5:30pm" or "6pm" to decimal hours (17.5 / 18)
export function timeToHours(timeStr: string): number | null {
  const match = timeStr.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = match[2] ? parseInt(match[2]) : 0;
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

// Parse meeting time text like "Monday 5:30pm - 8:30pm" or "Monday 6pm - 8pm"
export function parseMeetingTime(text: string): CourseMeeting[] {
  const lines = text
    .split(/\n|<br\s*\/?>/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.map((line) => {
    const match = line.match(
      /^(\w+)\s+(\d{1,2}(?::\d{2})?(?:am|pm))\s*[-–]\s*(\d{1,2}(?::\d{2})?(?:am|pm))$/i
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

// Build course feedback URL
export function getCourseFeedbackUrl(course?: Course): string {
  if (!course) return "https://coursefeedback.uchicago.edu/";

  const codeParts = parseCourseCodeParts(course.code);
  if (!codeParts) return "https://coursefeedback.uchicago.edu/";

  const params = new URLSearchParams({
    CourseDepartment: codeParts.subject,
    CourseNumber: codeParts.catalogNumber,
  });

  return `https://coursefeedback.uchicago.edu/?${params.toString()}`;
}

export function parseCourseCodeParts(courseCode: string): CourseCodeParts | null {
  const match = courseCode.match(/^([A-Z]{4})\s+(\d{5})(?:-(.+))?$/);
  if (!match) return null;

  return {
    subject: match[1],
    catalogNumber: match[2],
    section: match[3] ?? null,
  };
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

function formatICSDateLocal(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function quarterKey(course: Course): string | null {
  if (!course.term || !course.year) return null;
  return `${course.term}-${course.year}`;
}

function getQuarterDateRange(course: Course): { start: Date; end: Date } | null {
  const key = quarterKey(course);
  if (!key) return null;
  const range = QUARTER_DATE_RANGES[key];
  if (!range) return null;
  return {
    start: new Date(`${range.start}T00:00:00`),
    end: new Date(`${range.end}T23:59:59`),
  };
}

function getFallbackWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + daysUntilMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 0);

  return { start: monday, end: sunday };
}

function firstMeetingDateForRange(
  rangeStart: Date,
  dayOffset: number
): Date {
  const first = new Date(rangeStart);
  const currentDay = first.getDay();
  const targetDay = dayOffset === 6 ? 0 : dayOffset + 1;
  const offset = (targetDay - currentDay + 7) % 7;
  first.setDate(first.getDate() + offset);
  return first;
}

// Generate ICS file content from courses
export function generateICS(courses: Record<string, Course>): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UChiSchedule//EN",
    "CALSCALE:GREGORIAN",
  ];

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

      const quarterRange = getQuarterDateRange(course) ?? getFallbackWeekRange();
      const eventDate = firstMeetingDateForRange(quarterRange.start, offset);

      const startDate = new Date(eventDate);
      startDate.setHours(Math.floor(startH), Math.round((startH % 1) * 60), 0);
      const endDate = new Date(eventDate);
      endDate.setHours(Math.floor(endH), Math.round((endH % 1) * 60), 0);

      lines.push("BEGIN:VEVENT");
      lines.push(`DTSTART:${formatICSDateLocal(startDate)}`);
      lines.push(`DTEND:${formatICSDateLocal(endDate)}`);
      lines.push(`RRULE:FREQ=WEEKLY;UNTIL=${formatICSDateLocal(quarterRange.end)}`);
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
