import { useEffect, useRef, useState } from "react";
import type { Course, Conflict } from "@/shared/types";
import {
  getConflictDescription,
  getConflictKey,
  getCourseFeedbackUrl,
  getRegistrationFeedbackLabel,
  parseCourseCodeParts,
  runRegistrationHandoff,
} from "@/shared/utils";

interface Props {
  courses: Course[];
  colorMap: Record<string, string>;
  conflicts: Conflict[];
  onRemove: (id: string) => void;
  onToggleWaitlisted: (id: string, isWaitlisted?: boolean) => void;
  highlightedCourseIds: Set<string>;
  onSelectConflict: (conflictKey: string) => void;
  selectedConflictKey: string | null;
}

export function CourseList({
  courses,
  colorMap,
  conflicts,
  onRemove,
  onToggleWaitlisted,
  highlightedCourseIds,
  onSelectConflict,
  selectedConflictKey,
}: Props) {
  const [registerFeedback, setRegisterFeedback] = useState<{ key: string; label: string } | null>(
    null
  );
  const registerFeedbackTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (registerFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(registerFeedbackTimeoutRef.current);
      }
    };
  }, []);

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
    <div>
      <h2 className="mb-3 text-base font-bold text-gray-800 dark:text-slate-100">Saved Courses</h2>

      {courses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm leading-relaxed dark:border-slate-700 dark:bg-slate-900">
          <p className="font-medium text-gray-700 dark:text-slate-200">No courses added yet.</p>
          <p className="mt-1 text-gray-500 dark:text-slate-400">
            Start in the MPCS course catalog, then come back here to compare, export, and register.
          </p>
          <div className="mt-3 flex gap-2 flex-wrap">
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
          {courses.map((course) => (
            <div
              key={course.id}
              className={`rounded-lg bg-white p-3 shadow-sm transition-shadow hover:shadow dark:bg-slate-900 dark:ring-1 dark:ring-slate-800 ${
                highlightedCourseIds.has(course.id)
                  ? "border border-red-600 bg-red-500 text-white ring-2 ring-red-600 shadow-[0_0_0_1px_rgba(220,38,38,0.45),0_0_20px_rgba(239,68,68,0.3)] dark:border-red-500 dark:bg-red-600 dark:text-white dark:ring-red-400 dark:shadow-[0_0_0_1px_rgba(248,113,113,0.45),0_0_22px_rgba(239,68,68,0.34)]"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: colorMap[course.id] }}
                    />
                    <span className={`text-xs font-bold ${highlightedCourseIds.has(course.id) ? "text-red-950 dark:text-white" : "text-maroon"}`}>
                      {course.code}
                    </span>
                    {conflicts.some((conflict) => conflict.courseA.id === course.id || conflict.courseB.id === course.id) && (
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        highlightedCourseIds.has(course.id)
                          ? "bg-red-50/80 text-red-900 dark:bg-white/20 dark:text-white"
                          : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-200"
                      }`}>
                        Conflict
                      </span>
                    )}
                  </div>
                  <div className={`mt-1 text-sm font-semibold ${highlightedCourseIds.has(course.id) ? "text-red-950 dark:text-white" : "dark:text-slate-100"}`}>{course.name}</div>
                  <div className={`mt-1 text-xs ${highlightedCourseIds.has(course.id) ? "text-red-900 dark:text-red-50" : "text-gray-500 dark:text-slate-400"}`}>
                    {course.instructor}
                  </div>
                  <div className={`text-xs ${highlightedCourseIds.has(course.id) ? "text-red-800 dark:text-red-100" : "text-gray-400 dark:text-slate-500"}`}>
                    {course.meetingText} &middot; {course.location}
                  </div>
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
                    <button
                      onClick={() => onToggleWaitlisted(course.id, course.isWaitlisted)}
                      className="rounded border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/40"
                    >
                      {course.isWaitlisted ? "Waitlisted" : "Mark Waitlisted"}
                    </button>
                  </div>
                  {course.isWaitlisted && (
                    <div className="mt-2 rounded border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                      <span className="font-semibold">Status:</span> Waitlisted
                    </div>
                  )}
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
                  onClick={() => onRemove(course.id)}
                  className="flex-shrink-0 text-lg leading-none text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400"
                  title="Remove course"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/40">
          <h3 className="mb-2 text-sm font-bold text-red-700 dark:text-red-300">
            Schedule Conflicts
          </h3>
          <div className="space-y-1">
            {conflicts.map((c) => {
              const conflictKey = getConflictKey(c);
              const isSelected = selectedConflictKey === conflictKey;

              return (
                <button
                  key={conflictKey}
                  onClick={() => onSelectConflict(conflictKey)}
                  className={`block w-full rounded px-2 py-1 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-red-500 text-white ring-2 ring-red-600 shadow-[0_0_0_1px_rgba(220,38,38,0.35),0_0_14px_rgba(239,68,68,0.28)] dark:bg-red-600 dark:text-white dark:ring-red-400 dark:shadow-[0_0_0_1px_rgba(248,113,113,0.35),0_0_16px_rgba(239,68,68,0.32)]"
                      : "text-red-600 hover:bg-red-100 dark:text-red-200 dark:hover:bg-red-900/40"
                  }`}
                >
                  {getConflictDescription(c)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
