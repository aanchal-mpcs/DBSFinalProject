import type { Course, Conflict } from "@/shared/types";
import {
  getCourseFeedbackUrl,
  parseCourseCodeParts,
  UCHICAGO_REGISTRATION_URL,
} from "@/shared/utils";

interface Props {
  courses: Course[];
  colorMap: Record<string, string>;
  conflicts: Conflict[];
  onRemove: (id: string) => void;
}

export function CourseList({ courses, colorMap, conflicts, onRemove }: Props) {
  const handleCopyText = (value: string) => {
    void navigator.clipboard.writeText(value);
  };

  return (
    <div>
      <h2 className="text-base font-bold text-gray-800 mb-3">Saved Courses</h2>

      {courses.length === 0 ? (
        <div className="text-sm leading-relaxed border border-dashed border-gray-200 rounded-lg bg-white p-4">
          <p className="text-gray-700 font-medium">No courses added yet.</p>
          <p className="text-gray-500 mt-1">
            Start in the MPCS course catalog, then come back here to compare, export, and register.
          </p>
          <div className="mt-3 flex gap-2 flex-wrap">
            <a
              href="https://mpcs-courses.cs.uchicago.edu"
              target="_blank"
              rel="noopener"
              className="text-xs bg-maroon text-white px-3 py-1.5 rounded font-semibold no-underline hover:bg-maroon-800"
            >
              Open Catalog
            </a>
            <a
              href={UCHICAGO_REGISTRATION_URL}
              target="_blank"
              rel="noopener"
              className="text-xs border border-teal-700 text-teal-700 px-3 py-1.5 rounded font-semibold no-underline hover:bg-teal-50"
            >
              Register
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg p-3 shadow-sm hover:shadow transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: colorMap[course.id] }}
                    />
                    <span className="text-xs font-bold text-maroon">
                      {course.code}
                    </span>
                  </div>
                  <div className="text-sm font-semibold mt-1">{course.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {course.instructor}
                  </div>
                  <div className="text-xs text-gray-400">
                    {course.meetingText} &middot; {course.location}
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <a
                      href={getCourseFeedbackUrl(course)}
                      target="_blank"
                      rel="noopener"
                      className="text-[11px] bg-gray-600 text-white px-2.5 py-1 rounded font-semibold no-underline hover:bg-gray-700"
                    >
                      Feedback
                    </a>
                    <a
                      href={UCHICAGO_REGISTRATION_URL}
                      target="_blank"
                      rel="noopener"
                      className="text-[11px] bg-teal-700 text-white px-2.5 py-1 rounded font-semibold no-underline hover:bg-teal-800"
                    >
                      Register
                    </a>
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
                  onClick={() => onRemove(course.id)}
                  className="text-gray-300 hover:text-red-500 text-lg leading-none flex-shrink-0"
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
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-sm font-bold text-red-700 mb-2">
            Schedule Conflicts
          </h3>
          <div className="space-y-1">
            {conflicts.map((c, i) => (
              <div key={i} className="text-xs text-red-600">
                {c.courseA.code} & {c.courseB.code} overlap on {c.day}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
