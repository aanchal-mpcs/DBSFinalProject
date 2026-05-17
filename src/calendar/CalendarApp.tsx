import { useEffect, useRef, useState } from "react";
import type { StorageData } from "@/shared/types";
import {
  getData,
  removeCourse,
  clearActiveScheduleCourses,
  setCourseWaitlisted,
  switchSchedule,
  createSchedule,
  deleteSchedule,
  renameSchedule,
  duplicateSchedule,
  setThemePreference,
  onStorageChange,
} from "@/shared/storage";
import {
  applyThemePreference,
  getNextThemePreference,
  getThemePreferenceLabel,
} from "@/shared/theme";
import {
  findConflicts,
  generateICS,
  COURSE_COLORS,
  getConflictKey,
  getConflictDescription,
  getRegistrationFeedbackLabel,
  runRegistrationHandoff,
} from "@/shared/utils";
import { CalendarGrid } from "./components/CalendarGrid";
import { CourseList } from "./components/CourseList";

export function CalendarApp() {
  const [data, setData] = useState<StorageData | null>(null);
  const [registerFeedback, setRegisterFeedback] = useState<string | null>(null);
  const [selectedConflictKey, setSelectedConflictKey] = useState<string | null>(null);
  const registerFeedbackTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    getData().then(setData);
    return onStorageChange(setData);
  }, []);

  useEffect(() => {
    if (!data) return;
    applyThemePreference(data.themePreference);
  }, [data]);

  useEffect(() => {
    return () => {
      if (registerFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(registerFeedbackTimeoutRef.current);
      }
    };
  }, []);

  if (!data) return null;

  const schedule = data.schedules[data.activeScheduleIndex];
  const courses = schedule.courses;
  const courseList = Object.values(courses);
  const conflicts = findConflicts(courses);
  const conflictIds = new Set(
    conflicts.flatMap((c) => [c.courseA.id, c.courseB.id])
  );
  const selectedConflict = conflicts.find((conflict) => getConflictKey(conflict) === selectedConflictKey) ?? null;
  const highlightedCourseIds = new Set(
    selectedConflict ? [selectedConflict.courseA.id, selectedConflict.courseB.id] : []
  );

  const handleRemove = async (id: string) => {
    await removeCourse(id);
  };

  const handleWaitlistToggle = async (id: string, isWaitlisted?: boolean) => {
    await setCourseWaitlisted(id, !isWaitlisted);
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

  const handleRenameSchedule = async () => {
    const nextName = window.prompt("Rename this schedule", schedule.name)?.trim();
    if (!nextName) return;
    await renameSchedule(data.activeScheduleIndex, nextName);
  };

  const handleDuplicateSchedule = async () => {
    await duplicateSchedule(data.activeScheduleIndex);
  };

  const handleRegisterClick = async () => {
    const { copied } = await runRegistrationHandoff(courseList);
    const label = copied ? getRegistrationFeedbackLabel(courseList) : "Opened Registration";
    setRegisterFeedback(label);

    if (registerFeedbackTimeoutRef.current !== null) {
      window.clearTimeout(registerFeedbackTimeoutRef.current);
    }

    registerFeedbackTimeoutRef.current = window.setTimeout(() => {
      setRegisterFeedback(null);
      registerFeedbackTimeoutRef.current = null;
    }, 1600);
  };

  const handleThemeToggle = async () => {
    await setThemePreference(getNextThemePreference(data.themePreference));
  };

  const handleConflictSelect = (conflictKey: string) => {
    setSelectedConflictKey((current) => (current === conflictKey ? null : conflictKey));
  };

  const handleClearCalendar = async () => {
    if (courseList.length === 0) return;
    const confirmed = window.confirm(`Clear all ${courseList.length} courses from ${schedule.name}?`);
    if (!confirmed) return;
    await clearActiveScheduleCourses();
  };

  // Assign colors to courses
  const colorMap: Record<string, string> = {};
  courseList.forEach((c, i) => {
    colorMap[c.id] = COURSE_COLORS[i % COURSE_COLORS.length];
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="bg-maroon text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-bold tracking-tight">UChiSchedule</h1>
          <span className="text-sm opacity-80">Weekly Planner</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <button
            onClick={handleThemeToggle}
            className="rounded bg-white/15 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/25 dark:bg-white/10 dark:hover:bg-white/20"
          >
            {getThemePreferenceLabel(data.themePreference)}
          </button>
          {/* Schedule selector */}
          <select
            value={data.activeScheduleIndex}
            onChange={(e) => handleSwitch(Number(e.target.value))}
            className="rounded px-2 py-1 text-sm text-gray-800 dark:bg-slate-800 dark:text-slate-100 dark:ring-1 dark:ring-slate-700"
          >
            {data.schedules.map((s, i) => (
              <option key={s.id} value={i}>
                {s.name} ({Object.keys(s.courses).length})
              </option>
            ))}
          </select>
          <button
            onClick={handleNewSchedule}
            className="rounded bg-white/20 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20"
          >
            New
          </button>
          <button
            onClick={handleRenameSchedule}
            className="rounded bg-white/15 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/25 dark:bg-white/10 dark:hover:bg-white/20"
          >
            Rename
          </button>
          <button
            onClick={handleDuplicateSchedule}
            className="rounded bg-white/15 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/25 dark:bg-white/10 dark:hover:bg-white/20"
          >
            Duplicate
          </button>
          {data.schedules.length > 1 && (
            <button
              onClick={() => handleDelete(data.activeScheduleIndex)}
              className="rounded bg-red-500/80 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-red-500 dark:bg-red-600/80 dark:hover:bg-red-600"
            >
              Delete
            </button>
          )}

          <span className="text-sm opacity-80">
            {courseList.length} course{courseList.length !== 1 ? "s" : ""}
          </span>
          {conflicts.length > 0 && (
            <span className="rounded bg-red-950/20 px-2.5 py-1 text-xs font-semibold text-red-100 ring-1 ring-white/15">
              {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""}
            </span>
          )}

          {courseList.length > 0 && (
            <button
              onClick={handleClearCalendar}
              className="rounded bg-white/15 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/25 dark:bg-white/10 dark:hover:bg-white/20"
            >
              Clear Calendar
            </button>
          )}

          {courseList.length > 0 && (
            <button
              onClick={handleExportICS}
              className="rounded bg-white/20 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20"
            >
              Export .ics
            </button>
          )}

          <button
            onClick={handleRegisterClick}
            className="rounded bg-white px-4 py-1.5 text-sm font-semibold text-maroon transition-colors hover:bg-gray-100 dark:bg-slate-100 dark:text-maroon-800 dark:hover:bg-white"
          >
            {registerFeedback ?? "Register"}
          </button>
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
            highlightedCourseIds={highlightedCourseIds}
          />
        </div>

        {/* Sidebar */}
        <div className="w-[300px] flex-shrink-0">
          <CourseList
            courses={courseList}
            colorMap={colorMap}
            conflicts={conflicts}
            onRemove={handleRemove}
            onToggleWaitlisted={handleWaitlistToggle}
            highlightedCourseIds={highlightedCourseIds}
            onSelectConflict={handleConflictSelect}
            selectedConflictKey={selectedConflictKey}
          />
        </div>
      </div>
    </div>
  );
}
