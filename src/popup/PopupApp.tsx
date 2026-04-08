import { useEffect, useState } from "react";
import type { StorageData, Schedule } from "@/shared/types";
import {
  getData,
  removeCourse,
  createSchedule,
  switchSchedule,
  deleteSchedule,
  onStorageChange,
} from "@/shared/storage";
import { findConflicts, COURSE_COLORS } from "@/shared/utils";

export function PopupApp() {
  const [data, setData] = useState<StorageData | null>(null);

  useEffect(() => {
    getData().then(setData);
    return onStorageChange(setData);
  }, []);

  if (!data) return null;

  const schedule = data.schedules[data.activeScheduleIndex];
  const courses = Object.values(schedule.courses);
  const conflicts = findConflicts(schedule.courses);

  const handleRemove = async (id: string) => {
    await removeCourse(id);
  };

  const handleOpenCalendar = () => {
    chrome.runtime.sendMessage({ type: "OPEN_CALENDAR" });
  };

  const handleNewSchedule = async () => {
    const name = `Schedule ${data.schedules.length + 1}`;
    await createSchedule(name);
  };

  const handleSwitch = async (index: number) => {
    await switchSchedule(index);
  };

  const handleDelete = async (index: number) => {
    await deleteSchedule(index);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="w-[380px] max-h-[500px] overflow-y-auto bg-white">
      {/* Header */}
      <div className="bg-maroon text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold">UChiSchedule</h1>
          <button
            onClick={handleOpenCalendar}
            className="text-xs bg-white text-maroon px-3 py-1.5 rounded font-semibold hover:bg-maroon-50 transition-colors"
          >
            Open Calendar
          </button>
        </div>
      </div>

      {/* Schedule selector */}
      <div className="px-4 py-2 bg-gray-50 border-b flex items-center gap-2">
        <select
          value={data.activeScheduleIndex}
          onChange={(e) => handleSwitch(Number(e.target.value))}
          className="text-sm border rounded px-2 py-1 flex-1"
        >
          {data.schedules.map((s, i) => (
            <option key={s.id} value={i}>
              {s.name} ({Object.keys(s.courses).length})
            </option>
          ))}
        </select>
        <button
          onClick={handleNewSchedule}
          className="text-xs bg-maroon text-white px-2 py-1 rounded font-semibold"
          title="New schedule"
        >
          +
        </button>
        {data.schedules.length > 1 && (
          <button
            onClick={() => handleDelete(data.activeScheduleIndex)}
            className="text-xs text-red-600 px-2 py-1 rounded border border-red-200 font-semibold"
            title="Delete schedule"
          >
            Del
          </button>
        )}
      </div>

      {/* Conflicts warning */}
      {conflicts.length > 0 && (
        <div className="mx-4 mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <strong>Conflicts:</strong>
          {conflicts.map((c, i) => (
            <div key={i}>
              {c.courseA.code} & {c.courseB.code} on {c.day}
            </div>
          ))}
        </div>
      )}

      {/* Course list */}
      <div className="px-4 py-3">
        {courses.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            <p>No courses saved yet.</p>
            <p className="mt-1">
              Visit the{" "}
              <a
                href="https://mpcs-courses.cs.uchicago.edu"
                target="_blank"
                rel="noopener"
                className="text-maroon underline"
              >
                MPCS catalog
              </a>{" "}
              to add courses.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {courses.map((course, i) => (
              <div
                key={course.id}
                className="border rounded-lg p-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: COURSE_COLORS[i % COURSE_COLORS.length] }}
                      />
                      <span className="text-xs font-bold text-maroon">
                        {course.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(course.code)}
                        className="text-[10px] text-gray-400 hover:text-gray-600"
                        title="Copy course code"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="text-sm font-semibold mt-0.5 truncate">
                      {course.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {course.instructor} &middot; {course.meetingText}
                    </div>
                    <div className="text-xs text-gray-400">{course.location}</div>
                  </div>
                  <button
                    onClick={() => handleRemove(course.id)}
                    className="text-gray-300 hover:text-red-500 text-lg leading-none"
                    title="Remove"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {courses.length > 0 && (
        <div className="px-4 py-3 border-t bg-gray-50 flex gap-2">
          <a
            href="https://my.uchicago.edu"
            target="_blank"
            rel="noopener"
            className="flex-1 text-center text-xs bg-maroon text-white py-2 rounded font-semibold no-underline hover:bg-maroon-800"
          >
            Register on my.UChicago
          </a>
          <button
            onClick={handleOpenCalendar}
            className="flex-1 text-xs border border-maroon text-maroon py-2 rounded font-semibold hover:bg-maroon-50"
          >
            View Calendar
          </button>
        </div>
      )}
    </div>
  );
}
