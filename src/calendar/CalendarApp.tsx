import { useEffect, useState } from "react";
import type { StorageData } from "@/shared/types";
import {
  getData,
  removeCourse,
  switchSchedule,
  createSchedule,
  deleteSchedule,
  onStorageChange,
} from "@/shared/storage";
import { findConflicts, generateICS, COURSE_COLORS } from "@/shared/utils";
import { CalendarGrid } from "./components/CalendarGrid";
import { CourseList } from "./components/CourseList";

export function CalendarApp() {
  const [data, setData] = useState<StorageData | null>(null);

  useEffect(() => {
    getData().then(setData);
    return onStorageChange(setData);
  }, []);

  if (!data) return null;

  const schedule = data.schedules[data.activeScheduleIndex];
  const courses = schedule.courses;
  const courseList = Object.values(courses);
  const conflicts = findConflicts(courses);
  const conflictIds = new Set(
    conflicts.flatMap((c) => [c.courseA.id, c.courseB.id])
  );

  const handleRemove = async (id: string) => {
    await removeCourse(id);
  };

  const handleExportICS = () => {
    const ics = generateICS(courses);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${schedule.name.replace(/\s+/g, "_")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNewSchedule = async () => {
    await createSchedule(`Schedule ${data.schedules.length + 1}`);
  };

  const handleSwitch = async (index: number) => {
    await switchSchedule(index);
  };

  const handleDelete = async (index: number) => {
    await deleteSchedule(index);
  };

  // Assign colors to courses
  const colorMap: Record<string, string> = {};
  courseList.forEach((c, i) => {
    colorMap[c.id] = COURSE_COLORS[i % COURSE_COLORS.length];
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-maroon text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-bold tracking-tight">UChiSchedule</h1>
          <span className="text-sm opacity-80">Weekly Planner</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Schedule selector */}
          <select
            value={data.activeScheduleIndex}
            onChange={(e) => handleSwitch(Number(e.target.value))}
            className="text-sm text-gray-800 rounded px-2 py-1"
          >
            {data.schedules.map((s, i) => (
              <option key={s.id} value={i}>
                {s.name} ({Object.keys(s.courses).length})
              </option>
            ))}
          </select>
          <button
            onClick={handleNewSchedule}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded font-semibold transition-colors"
          >
            + New
          </button>
          {data.schedules.length > 1 && (
            <button
              onClick={() => handleDelete(data.activeScheduleIndex)}
              className="text-xs bg-red-500/80 hover:bg-red-500 px-3 py-1.5 rounded font-semibold transition-colors"
            >
              Delete
            </button>
          )}

          <span className="text-sm opacity-80">
            {courseList.length} course{courseList.length !== 1 ? "s" : ""}
          </span>

          {courseList.length > 0 && (
            <button
              onClick={handleExportICS}
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded font-semibold transition-colors"
            >
              Export .ics
            </button>
          )}

          <a
            href="https://my.uchicago.edu"
            target="_blank"
            rel="noopener"
            className="text-sm bg-white text-maroon px-4 py-1.5 rounded font-semibold no-underline hover:bg-gray-100 transition-colors"
          >
            Register on my.UChicago
          </a>
        </div>
      </header>

      {/* Main content */}
      <div className="flex gap-5 p-5 max-w-[1500px] mx-auto">
        {/* Calendar grid */}
        <div className="flex-1">
          <CalendarGrid
            courses={courseList}
            colorMap={colorMap}
            conflictIds={conflictIds}
          />
        </div>

        {/* Sidebar */}
        <div className="w-[300px] flex-shrink-0">
          <CourseList
            courses={courseList}
            colorMap={colorMap}
            conflicts={conflicts}
            onRemove={handleRemove}
          />
        </div>
      </div>
    </div>
  );
}
