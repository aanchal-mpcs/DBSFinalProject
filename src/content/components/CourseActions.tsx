import { useEffect, useRef, useState } from "react";
import type { Course } from "@/shared/types";
import { addCourse, removeCourse } from "@/shared/storage";
import {
  getCourseFeedbackUrl,
  getRegistrationFeedbackLabel,
  runRegistrationHandoff,
} from "@/shared/utils";

interface Props {
  course: Course;
  isAdded: boolean;
  conflictsWith: Course[];
}

export function CourseActions({ course, isAdded: initialAdded, conflictsWith }: Props) {
  const [added, setAdded] = useState(initialAdded);
  const [showPopup, setShowPopup] = useState(false);
  const [registerFeedback, setRegisterFeedback] = useState<string | null>(null);
  const registerFeedbackTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (registerFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(registerFeedbackTimeoutRef.current);
      }
    };
  }, []);

  const handleFeedbackClick = () => {
    window.open(getCourseFeedbackUrl(course), "_blank", "noopener");
  };

  const showRegisterFeedback = (label: string) => {
    setRegisterFeedback(label);

    if (registerFeedbackTimeoutRef.current !== null) {
      window.clearTimeout(registerFeedbackTimeoutRef.current);
    }

    registerFeedbackTimeoutRef.current = window.setTimeout(() => {
      setRegisterFeedback(null);
      registerFeedbackTimeoutRef.current = null;
    }, 1600);
  };

  const handleRegisterClick = async () => {
    const { copied } = await runRegistrationHandoff(course);
    showRegisterFeedback(copied ? getRegistrationFeedbackLabel(course) : "Opened Registration");
  };

  const handleToggle = async () => {
    if (added) {
      await removeCourse(course.id);
      setAdded(false);
    } else {
      await addCourse(course);
      setAdded(true);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", position: "relative" }}>
      <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
        {/* Add/Remove button */}
        <button
          onClick={handleToggle}
          style={{
            padding: "3px 8px",
            border: "none",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            color: "#fff",
            background: added ? "#4a7c59" : "#800000",
            whiteSpace: "nowrap",
          }}
        >
          {added ? "Added" : "+ Calendar"}
        </button>

        {/* Course detail popup toggle */}
        <button
          onClick={() => setShowPopup(!showPopup)}
          style={{
            padding: "3px 8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            color: "#333",
            background: showPopup ? "#eee" : "#fff",
            whiteSpace: "nowrap",
          }}
        >
          Details
        </button>

        <button
          onClick={handleFeedbackClick}
          style={{
            padding: "3px 8px",
            border: "none",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#fff",
            background: "#555",
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          Feedback
        </button>

        <button
          onClick={handleRegisterClick}
          style={{
            padding: "3px 8px",
            border: "none",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#fff",
            background: "#0f766e",
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          {registerFeedback ?? "Register"}
        </button>

        {course.detailUrl && (
          <a
            href={course.detailUrl}
            target="_blank"
            rel="noopener"
            style={{
              padding: "3px 8px",
              border: "1px solid #800000",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#800000",
              background: "#fff",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Description
          </a>
        )}
      </div>

      {/* Conflict warning */}
      {conflictsWith.length > 0 && (
        <div
          style={{
            fontSize: "10px",
            color: "#c62828",
            fontWeight: 600,
            padding: "2px 4px",
            background: "#fff3f3",
            borderRadius: "3px",
            border: "1px solid #ffcdd2",
          }}
        >
          Conflicts with: {conflictsWith.map((c) => c.code).join(", ")}
        </div>
      )}

      {/* Course detail popup */}
      {showPopup && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 1000,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            minWidth: "320px",
            marginTop: "4px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#800000", fontWeight: 700 }}>
                {course.code}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, marginTop: "2px" }}>
                {course.name}
              </div>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                border: "none",
                background: "none",
                fontSize: "18px",
                cursor: "pointer",
                color: "#999",
                padding: "0 4px",
              }}
            >
              x
            </button>
          </div>

          <div style={{ marginTop: "12px", fontSize: "13px", color: "#555", lineHeight: 1.6 }}>
            <div><strong>Instructor:</strong> {course.instructor}</div>
            <div><strong>Location:</strong> {course.location}</div>
            <div><strong>Schedule:</strong> {course.meetingText}</div>
          </div>

          <div style={{ marginTop: "12px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              onClick={handleToggle}
              style={{
                padding: "6px 12px",
                border: "none",
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                color: "#fff",
                background: added ? "#4a7c59" : "#800000",
              }}
            >
              {added ? "Remove from Calendar" : "Add to Calendar"}
            </button>

            <button
              onClick={handleFeedbackClick}
              style={{
                padding: "6px 12px",
                border: "none",
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#fff",
                background: "#555",
                cursor: "pointer",
              }}
            >
              Feedback
            </button>

            <button
              onClick={handleRegisterClick}
              style={{
                padding: "6px 12px",
                border: "none",
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#fff",
                background: "#0f766e",
                cursor: "pointer",
              }}
            >
              {registerFeedback ?? "Register"}
            </button>

            {course.detailUrl && (
              <a
                href={course.detailUrl}
                target="_blank"
                rel="noopener"
                style={{
                  padding: "6px 12px",
                  border: "1px solid #800000",
                  borderRadius: "5px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#800000",
                  background: "#fff",
                  textDecoration: "none",
                }}
              >
                Description
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
