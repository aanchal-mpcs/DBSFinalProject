import { useEffect, useRef, useState } from "react";
import type { Course, StorageData } from "@/shared/types";
import {
  getData,
  removeCourse,
  createSchedule,
  switchSchedule,
  deleteSchedule,
  renameSchedule,
  duplicateSchedule,
  onStorageChange,
} from "@/shared/storage";
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
      <div className="px-4 py-2 bg-gray-50 border-b space-y-2">
        <div className="flex items-center gap-2">
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
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={handleNewSchedule}
            className="text-[11px] bg-maroon text-white px-2.5 py-1 rounded font-semibold"
            title="New schedule"
          >
            New
          </button>
          <button
            onClick={handleRenameSchedule}
            className="text-[11px] border border-gray-300 text-gray-700 px-2.5 py-1 rounded font-semibold hover:bg-gray-100"
            title="Rename schedule"
          >
            Rename
          </button>
          <button
            onClick={handleDuplicateSchedule}
            className="text-[11px] border border-gray-300 text-gray-700 px-2.5 py-1 rounded font-semibold hover:bg-gray-100"
            title="Duplicate schedule"
          >
            Duplicate
          </button>
          {data.schedules.length > 1 && (
            <button
              onClick={() => handleDelete(data.activeScheduleIndex)}
              className="text-[11px] text-red-600 px-2.5 py-1 rounded border border-red-200 font-semibold hover:bg-red-50"
              title="Delete schedule"
            >
              Delete
            </button>
          )}
        </div>
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
          <div className="text-center py-6 text-sm border border-dashed border-gray-200 rounded-lg bg-gray-50 px-4">
            <p className="text-gray-600 font-medium">No courses saved yet.</p>
            <p className="mt-1 text-gray-500">
              Start from the MPCS catalog or jump straight to registration.
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <a
                href="https://mpcs-courses.cs.uchicago.edu"
                target="_blank"
                rel="noopener"
                className="text-xs bg-maroon text-white px-3 py-1.5 rounded font-semibold no-underline hover:bg-maroon-800"
              >
                Open Catalog
              </a>
              <button
                onClick={() => handleRegisterClick("empty-register")}
                className="text-xs border border-teal-700 text-teal-700 px-3 py-1.5 rounded font-semibold hover:bg-teal-50"
              >
                {getRegisterLabel("empty-register")}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {courses.map((course, i) => (
              <div key={course.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
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
                    <div className="text-sm font-semibold mt-0.5 truncate">
                      {course.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {course.instructor} &middot; {course.meetingText}
                    </div>
                    <div className="text-xs text-gray-400">{course.location}</div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <a
                        href={getCourseFeedbackUrl(course)}
                        target="_blank"
                        rel="noopener"
                        className="text-[11px] bg-gray-600 text-white px-2.5 py-1 rounded font-semibold no-underline hover:bg-gray-700"
                      >
                        Feedback
                      </a>
                      <button
                        onClick={() => handleRegisterClick(`course:${course.id}`, course)}
                        className="text-[11px] bg-teal-700 text-white px-2.5 py-1 rounded font-semibold hover:bg-teal-800"
                      >
                        {getRegisterLabel(`course:${course.id}`)}
                      </button>
                      {course.detailUrl && (
                        <a
                          href={course.detailUrl}
                          target="_blank"
                          rel="noopener"
                          className="text-[11px] border border-maroon text-maroon px-2.5 py-1 rounded font-semibold no-underline hover:bg-maroon-50"
                        >
                          Description
                        </a>
                      )}
                    </div>
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleCopyText(course.code)}
                        className="text-[10px] text-gray-500 border border-gray-200 px-2 py-0.5 rounded hover:bg-gray-50"
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
                              className="text-[10px] text-gray-500 border border-gray-200 px-2 py-0.5 rounded hover:bg-gray-50"
                              title="Copy subject and catalog number"
                            >
                              Copy Number
                            </button>
                            {section && (
                              <button
                                onClick={() => handleCopyText(section)}
                                className="text-[10px] text-gray-500 border border-gray-200 px-2 py-0.5 rounded hover:bg-gray-50"
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
          <button
            onClick={() => handleRegisterClick("footer-register", courses)}
            className="flex-1 text-center text-xs bg-maroon text-white py-2 rounded font-semibold hover:bg-maroon-800"
          >
            {getRegisterLabel("footer-register")}
          </button>
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
