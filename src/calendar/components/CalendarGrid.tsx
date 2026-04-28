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

export function CalendarGrid({ courses, colorMap, conflictIds }: Props) {
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

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
        {courses.map((course) =>
          course.meetings.map((meeting, mi) => {
            if (!meeting.day || !meeting.start || !meeting.end) return null;

            const startH = timeToHours(meeting.start);
            const endH = timeToHours(meeting.end);
            if (startH == null || endH == null) return null;

            const dayIdx = DAYS.indexOf(meeting.day);
            if (dayIdx === -1) return null;

            const height = (endH - startH) * SLOT_HEIGHT;
            const isConflict = conflictIds.has(course.id);

            return (
              <div
                key={`${course.id}-${mi}`}
                className="rounded-md px-1.5 py-1 text-white overflow-hidden cursor-default hover:shadow-lg transition-shadow z-10"
                style={{
                  gridColumn: dayIdx + 2,
                  gridRow: `${Math.floor(startH - START_HOUR) + 2} / ${Math.ceil(endH - START_HOUR) + 2}`,
                  background: colorMap[course.id] || "#666",
                  marginTop: `${((startH - START_HOUR) % 1) * SLOT_HEIGHT}px`,
                  height: `${height}px`,
                  position: "relative",
                  opacity: isConflict ? 0.68 : 0.92,
                  border: isConflict ? "2px solid #d32f2f" : "none",
                  boxShadow: isConflict ? "0 0 0 1px #d32f2f" : "none",
                }}
              >
                <div className="text-[10px] font-bold opacity-90">{course.code}</div>
                <div className="text-[11px] font-semibold leading-tight">{course.name}</div>
                <div className="text-[10px] opacity-80 mt-0.5">
                  {meeting.start} - {meeting.end}
                </div>
                <div className="text-[10px] opacity-70">{course.location}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
