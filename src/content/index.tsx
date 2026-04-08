import React from "react";
import { createRoot } from "react-dom/client";
import { scrapeCourseRow, getCourseRows } from "./scraper";
import { CourseActions } from "./components/CourseActions";
import { getActiveSchedule, onStorageChange } from "@/shared/storage";
import { courseConflictsWithSaved } from "@/shared/utils";
import type { Course } from "@/shared/types";

interface RowState {
  course: Course;
  row: HTMLTableRowElement;
  mountPoint: HTMLTableCellElement;
  root: ReturnType<typeof createRoot>;
}

async function init() {
  const table = document.querySelector(".table-container table");
  if (!table) return;

  // Add header column
  const thead = table.querySelector("thead tr");
  if (thead) {
    const th = document.createElement("th");
    th.textContent = "UChiSchedule";
    th.style.fontSize = "11px";
    th.style.fontWeight = "600";
    th.style.color = "#800000";
    th.style.minWidth = "200px";
    thead.appendChild(th);
  }

  const rows = getCourseRows();
  const rowStates: RowState[] = [];

  // Create mount points for each row
  for (const row of rows) {
    const course = scrapeCourseRow(row);
    if (!course) continue;

    const td = document.createElement("td");
    td.style.verticalAlign = "top";
    td.style.padding = "4px";
    row.appendChild(td);

    const root = createRoot(td);
    rowStates.push({ course, row, mountPoint: td, root });
  }

  // Render function that updates all rows based on current saved courses
  async function renderAll() {
    const schedule = await getActiveSchedule();
    const savedCourses = schedule.courses;

    for (const state of rowStates) {
      const isAdded = state.course.id in savedCourses;
      const conflictsWith = courseConflictsWithSaved(state.course, savedCourses);

      // Update row highlighting for conflicts
      if (conflictsWith.length > 0 && !isAdded) {
        state.row.classList.add("uchi-conflict");
      } else {
        state.row.classList.remove("uchi-conflict");
      }

      state.root.render(
        <CourseActions
          course={state.course}
          isAdded={isAdded}
          conflictsWith={conflictsWith}
        />
      );
    }
  }

  // Initial render
  await renderAll();

  // Re-render when storage changes (e.g., course added/removed from popup or calendar)
  onStorageChange(() => {
    renderAll();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
