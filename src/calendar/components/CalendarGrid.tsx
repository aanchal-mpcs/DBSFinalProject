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

export function CalendarGrid({ courses, colorMap, conflictIds }: Props) {
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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
            className="flex items-center justify-center text-sm font-semibold text-gray-600 border-b border-r border-gray-200 bg-gray-50 last:border-r-0"
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
              className="flex items-start justify-center pt-0 text-[11px] text-gray-400 border-r border-gray-200 -translate-y-2"
              style={{ gridRow: rowIdx + 2, gridColumn: 1 }}
            >
              {formatHour(hour)}
            </div>

            {/* Day cells */}
            {DAYS.map((day, colIdx) => (
              <div
                key={`${day}-${hour}`}
                className="border-b border-r border-gray-100 last:border-r-0"
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

            return (
              <div
                key={entry.key}
                className="rounded-md px-1.5 py-1 text-white overflow-hidden cursor-default hover:shadow-lg transition-shadow z-10"
                onClick={() => openCourseDetails(course)}
                style={{
                  gridColumn: dayIdx + 2,
                  gridRow: `${Math.floor(startH - START_HOUR) + 2} / ${Math.ceil(endH - START_HOUR) + 2}`,
                  background: colorMap[course.id] || "#666",
                  marginTop: `${((startH - START_HOUR) % 1) * SLOT_HEIGHT}px`,
                  height: `${height}px`,
                  position: "relative",
                  width: `calc(${widthPercent}% - 4px)`,
                  marginLeft: `calc(${leftPercent}% + 2px)`,
                  opacity: isConflict ? 0.68 : 0.92,
                  border: isConflict ? "2px solid #d32f2f" : "none",
                  boxShadow: isConflict ? "0 0 0 1px #d32f2f" : "none",
                  cursor: course.detailUrl ? "pointer" : "default",
                }}
                title={course.detailUrl ? "Open full course details" : undefined}
              >
                <div className="text-[10px] font-bold opacity-90">{course.code}</div>
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
