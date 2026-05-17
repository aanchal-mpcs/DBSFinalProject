import { useEffect, useRef, useState } from "react";
import type { Course, StorageData } from "@/shared/types";
import {
  getData,
  removeCourse,
  clearActiveScheduleCourses,
  createSchedule,
  switchSchedule,
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
  COURSE_COLORS,
  getCourseFeedbackUrl,
  getRegistrationFeedbackLabel,
  parseCourseCodeParts,
  runRegistrationHandoff,
} from "@/shared/utils";

export function PopupApp() {
  const [data, setData] = useState<StorageData | null>(null);
  const [registerFeedback, setRegisterFeedback] = useState<{ key: string; label: string } | null>(
    null
  );
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

  const handleRenameSchedule = async () => {
    const nextName = window.prompt("Rename this schedule", schedule.name)?.trim();
    if (!nextName) return;
    await renameSchedule(data.activeScheduleIndex, nextName);
  };

  const handleDuplicateSchedule = async () => {
    await duplicateSchedule(data.activeScheduleIndex);
  };

  const handleCopyText = (value: string) => {
    void navigator.clipboard.writeText(value);
  };

  const showRegisterFeedback = (key: string, label: string) => {
    setRegisterFeedback({ key, label });

    if (registerFeedbackTimeoutRef.current !== null) {
      window.clearTimeout(registerFeedbackTimeoutRef.current);
    }

    registerFeedbackTimeoutRef.current = window.setTimeout(() => {
      setRegisterFeedback(null);
      registerFeedbackTimeoutRef.current = null;
    }, 1600);
  };

  const getRegisterLabel = (key: string) =>
    registerFeedback?.key === key ? registerFeedback.label : "Register";

  const handleRegisterClick = async (key: string, courseOrCourses?: Course | Course[]) => {
    const { copied } = await runRegistrationHandoff(courseOrCourses);
    showRegisterFeedback(
      key,
      copied ? getRegistrationFeedbackLabel(courseOrCourses) : "Opened Registration"
    );
  };

  const handleThemeToggle = async () => {
    await setThemePreference(getNextThemePreference(data.themePreference));
  };

  const handleClearCalendar = async () => {
    if (courses.length === 0) return;
    const confirmed = window.confirm(`Clear all ${courses.length} courses from ${schedule.name}?`);
    if (!confirmed) return;
    await clearActiveScheduleCourses();
  };

  return (
    <div className="max-h-[500px] w-[380px] overflow-y-auto bg-white text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <div className="bg-maroon text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold">UChiSchedule</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleThemeToggle}
              className="rounded bg-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-white/25"
            >
              {getThemePreferenceLabel(data.themePreference)}
            </button>
            <button
              onClick={handleOpenCalendar}
              className="text-xs bg-white text-maroon px-3 py-1.5 rounded font-semibold hover:bg-maroon-50 transition-colors"
            >
              Open Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Schedule selector */}
      <div className="space-y-2 border-b bg-gray-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <select
            value={data.activeScheduleIndex}
            onChange={(e) => handleSwitch(Number(e.target.value))}
            className="flex-1 rounded border px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {data.schedules.map((s, i) => (
              <option key={s.id} value={i}>
                {s.name} ({Object.keys(s.courses).length})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={handleNewSchedule}
            className="rounded bg-maroon px-2.5 py-1 text-[11px] font-semibold text-white"
            title="New schedule"
          >
            New
          </button>
          <button
            onClick={handleRenameSchedule}
            className="rounded border border-gray-300 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Rename schedule"
          >
            Rename
          </button>
          <button
            onClick={handleDuplicateSchedule}
            className="rounded border border-gray-300 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Duplicate schedule"
          >
            Duplicate
          </button>
          {courses.length > 0 && (
            <button
              onClick={handleClearCalendar}
              className="rounded border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/40"
              title="Remove all courses from this schedule"
            >
              Clear
            </button>
          )}
          {data.schedules.length > 1 && (
            <button
              onClick={() => handleDelete(data.activeScheduleIndex)}
              className="rounded border border-red-200 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
              title="Delete schedule"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Conflicts warning */}
      {conflicts.length > 0 && (
        <div className="mx-4 mt-3 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
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
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="font-medium text-gray-600 dark:text-slate-200">No courses saved yet.</p>
            <p className="mt-1 text-gray-500 dark:text-slate-400">
              Start from the MPCS catalog or jump straight to registration.
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <a
                href="https://mpcs-courses.cs.uchicago.edu"
                target="_blank"
                rel="noopener"
                className="rounded bg-maroon px-3 py-1.5 text-xs font-semibold text-white no-underline hover:bg-maroon-800"
              >
                Open Catalog
              </a>
              <button
                onClick={() => handleRegisterClick("empty-register")}
                className="rounded bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
              >
                {getRegisterLabel("empty-register")}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {courses.map((course, i) => (
              <div key={course.id} className="rounded-lg border p-3 transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
                    </div>
                    <div className="mt-0.5 truncate text-sm font-semibold dark:text-slate-100">
                      {course.name}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                      {course.instructor} &middot; {course.meetingText}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-slate-500">{course.location}</div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <a
                        href={getCourseFeedbackUrl(course)}
                        target="_blank"
                        rel="noopener"
                        className="rounded bg-gray-600 px-2.5 py-1 text-[11px] font-semibold text-white no-underline hover:bg-gray-700"
                      >
                        Feedback
                      </a>
                      <button
                        onClick={() => handleRegisterClick(`course:${course.id}`, course)}
                        className="rounded bg-teal-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-teal-800"
                      >
                        {getRegisterLabel(`course:${course.id}`)}
                      </button>
                      {course.detailUrl && (
                        <a
                          href={course.detailUrl}
                          target="_blank"
                          rel="noopener"
                          className="rounded border border-maroon px-2.5 py-1 text-[11px] font-semibold text-maroon no-underline hover:bg-maroon-50 dark:border-maroon-600 dark:text-maroon-50 dark:hover:bg-maroon-900/30"
                        >
                          Description
                        </a>
                      )}
                    </div>
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleCopyText(course.code)}
                        className="rounded border border-gray-200 px-2 py-0.5 text-[10px] text-gray-500 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                        title="Copy full course code"
                      >
                        Copy Code
                      </button>
                      {(() => {
                        const codeParts = parseCourseCodeParts(course.code);
                        if (!codeParts) return null;
                        const section = codeParts.section;

                        return (
                          <>
                            <button
                              onClick={() =>
                                handleCopyText(`${codeParts.subject} ${codeParts.catalogNumber}`)
                              }
                              className="rounded border border-gray-200 px-2 py-0.5 text-[10px] text-gray-500 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                              title="Copy subject and catalog number"
                            >
                              Copy Number
                            </button>
                            {section && (
                              <button
                                onClick={() => handleCopyText(section)}
                                className="rounded border border-gray-200 px-2 py-0.5 text-[10px] text-gray-500 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                                title="Copy course section"
                              >
                                Copy Section
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(course.id)}
                    className="text-lg leading-none text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400"
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
        <div className="flex gap-2 border-t bg-gray-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => handleRegisterClick("footer-register", courses)}
            className="flex-1 text-center text-xs bg-teal-700 text-white py-2 rounded font-semibold hover:bg-teal-800"
          >
            {getRegisterLabel("footer-register")}
          </button>
          <button
            onClick={handleOpenCalendar}
            className="flex-1 text-xs bg-maroon text-white py-2 rounded font-semibold hover:bg-maroon-800"
          >
            Open Calendar
          </button>
        </div>
      )}
    </div>
  );
}
