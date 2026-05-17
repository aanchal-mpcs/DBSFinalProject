import type { Course } from "@/shared/types";
import { timeToHours, formatHour } from "@/shared/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const START_HOUR = 8;
const END_HOUR = 22;
const SLOT_HEIGHT = 48; // px per hour

interface Props {
  courses: Course[];
  colorMap: Record<string, string>;
  conflictIds: Set<string>;
  highlightedCourseIds: Set<string>;
}

interface MeetingLayout {
  key: string;
  course: Course;
  dayIdx: number;
  startH: number;
  endH: number;
  layoutIndex: number;
  layoutCount: number;
  meetingLabel: string;
  location: string;
}

export function CalendarGrid({ courses, colorMap, conflictIds, highlightedCourseIds }: Props) {
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  const openCourseDetails = (course: Course) => {
    if (!course.detailUrl) return;
    window.location.href = course.detailUrl;
  };

  const dayLayouts: MeetingLayout[][] = DAYS.map(() => []);

  courses.forEach((course) => {
    course.meetings.forEach((meeting, mi) => {
      if (!meeting.day || !meeting.start || !meeting.end) return;

      const startH = timeToHours(meeting.start);
      const endH = timeToHours(meeting.end);
      if (startH == null || endH == null) return;

      const dayIdx = DAYS.indexOf(meeting.day);
      if (dayIdx === -1) return;

      dayLayouts[dayIdx].push({
        key: `${course.id}-${mi}`,
        course,
        dayIdx,
        startH,
        endH,
        layoutIndex: 0,
        layoutCount: 1,
        meetingLabel: `${meeting.start} - ${meeting.end}`,
        location: course.location,
      });
    });
  });

  dayLayouts.forEach((entries) => {
    entries.sort((a, b) => a.startH - b.startH || a.endH - b.endH);

    const active: MeetingLayout[] = [];

    entries.forEach((entry) => {
      for (let i = active.length - 1; i >= 0; i--) {
        if (active[i].endH <= entry.startH) {
          active.splice(i, 1);
        }
      }

      const usedColumns = new Set(active.map((item) => item.layoutIndex));
      let column = 0;
      while (usedColumns.has(column)) column += 1;
      entry.layoutIndex = column;

      active.push(entry);
      const columnCount = Math.max(...active.map((item) => item.layoutIndex)) + 1;
      active.forEach((item) => {
        item.layoutCount = Math.max(item.layoutCount, columnCount);
      });
    });
  });

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
      {/* CSS Grid: time labels + 6 day columns */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `60px repeat(${DAYS.length}, 1fr)`,
          gridTemplateRows: `40px repeat(${hours.length}, ${SLOT_HEIGHT}px)`,
        }}
      >
        {/* Empty top-left corner */}
        <div className="border-b border-r border-gray-200" />

        {/* Day headers */}
        {DAYS.map((day) => (
          <div
            key={day}
            className="flex items-center justify-center border-b border-r border-gray-200 bg-gray-50 text-sm font-semibold text-gray-600 last:border-r-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            {day}
          </div>
        ))}

        {/* Time labels + grid cells */}
        {hours.map((hour, rowIdx) => (
          <>
            {/* Time label */}
            <div
              key={`time-${hour}`}
              className="-translate-y-2 flex items-start justify-center border-r border-gray-200 pt-0 text-[11px] text-gray-400 dark:border-slate-800 dark:text-slate-500"
              style={{ gridRow: rowIdx + 2, gridColumn: 1 }}
            >
              {formatHour(hour)}
            </div>

            {/* Day cells */}
            {DAYS.map((day, colIdx) => (
              <div
                key={`${day}-${hour}`}
                className="border-b border-r border-gray-100 last:border-r-0 dark:border-slate-900"
                style={{ gridRow: rowIdx + 2, gridColumn: colIdx + 2 }}
              />
            ))}
          </>
        ))}

        {/* Course blocks overlaid */}
        {dayLayouts.flat().map((entry) => {
            const { course, dayIdx, startH, endH, layoutIndex, layoutCount } = entry;
            const height = (endH - startH) * SLOT_HEIGHT;
            const isConflict = conflictIds.has(course.id);
            const widthPercent = 100 / layoutCount;
            const leftPercent = layoutIndex * widthPercent;
            const baseColor = colorMap[course.id] || "#666";
            const isHighlighted = highlightedCourseIds.has(course.id);

            return (
              <div
                key={entry.key}
                className="rounded-md px-1.5 py-1 text-white overflow-hidden cursor-default hover:shadow-lg transition-shadow z-10"
                onClick={() => openCourseDetails(course)}
                style={{
                  gridColumn: dayIdx + 2,
                  gridRow: `${Math.floor(startH - START_HOUR) + 2} / ${Math.ceil(endH - START_HOUR) + 2}`,
                  backgroundColor: baseColor,
                  backgroundImage: isConflict
                    ? "repeating-linear-gradient(135deg, rgba(75,85,99,0.6) 0px, rgba(75,85,99,0.6) 8px, rgba(255,255,255,0.06) 8px, rgba(255,255,255,0.06) 16px)"
                    : "none",
                  marginTop: `${((startH - START_HOUR) % 1) * SLOT_HEIGHT}px`,
                  height: `${height}px`,
                  position: "relative",
                  width: `calc(${widthPercent}% - 4px)`,
                  marginLeft: `calc(${leftPercent}% + 2px)`,
                  opacity: isConflict ? 0.56 : 0.92,
                  border: isConflict ? "1px solid rgba(107,114,128,0.6)" : "none",
                  outline: isHighlighted ? "3px solid rgba(239,68,68,0.98)" : "none",
                  outlineOffset: isHighlighted ? "1px" : "0px",
                  boxSizing: "border-box",
                  filter: isHighlighted ? "brightness(1.08) saturate(1.12)" : "none",
                  transform: isHighlighted ? "scale(1.02)" : "none",
                  boxShadow: isHighlighted
                    ? "0 0 0 2px rgba(239,68,68,0.3), 0 0 18px rgba(239,68,68,0.35)"
                    : isConflict
                      ? "inset 0 0 0 1px rgba(255,255,255,0.18)"
                      : "none",
                  zIndex: isHighlighted ? 20 : 10,
                  cursor: course.detailUrl ? "pointer" : "default",
                }}
                title={course.detailUrl ? "Open full course details" : undefined}
              >
                <div className="text-[10px] font-bold opacity-90">{course.code}</div>
                {course.isWaitlisted && (
                  <div className="mt-0.5 inline-block rounded bg-pink-500/90 px-1 py-0.5 text-[10px] font-bold uppercase tracking-wide text-yellow-300">
                    Waitlisted
                  </div>
                )}
                <div className="text-[11px] font-semibold leading-tight">{course.name}</div>
                <div className="text-[10px] opacity-80 mt-0.5">
                  {entry.meetingLabel}
                </div>
                <div className="text-[10px] opacity-70">{entry.location}</div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
