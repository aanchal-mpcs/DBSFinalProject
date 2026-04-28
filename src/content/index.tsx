import React from "react";
import { createRoot } from "react-dom/client";
import {
  scrapeCourseRow,
  getCourseRows,
  scrapeCourseDetailPage,
} from "./scraper";
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

function injectCalendarButtons() {
  const semesterPattern = /\b(Spring|Summer|Autumn|Winter)\s+\d{4}\b/i;
  const headings = document.querySelectorAll<HTMLElement>(
    "h1, h2, h3, h4, .page-title, .title"
  );

  for (const heading of headings) {
    if (!semesterPattern.test(heading.textContent?.trim() ?? "")) continue;
    if (heading.parentElement?.querySelector(".uchi-see-calendar-btn")) continue;

    const button = document.createElement("button");
    button.textContent = "See My Calendar";
    button.className = "uchi-see-calendar-btn";
    button.style.marginLeft = "10px";
    button.style.padding = "6px 12px";
    button.style.border = "none";
    button.style.borderRadius = "6px";
    button.style.background = "#800000";
    button.style.color = "#fff";
    button.style.fontSize = "12px";
    button.style.fontWeight = "600";
    button.style.cursor = "pointer";
    button.style.verticalAlign = "middle";

    button.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "OPEN_CALENDAR" });
    });

    heading.insertAdjacentElement("afterend", button);
  }
}

async function mountDetailPageActions() {
  const course = scrapeCourseDetailPage();
  const heading = document.querySelector("h1");
  if (!course || !heading) return false;
  const detailCourse = course;
  if (document.querySelector(".uchi-course-detail-actions")) return true;

  const mountPoint = document.createElement("div");
  mountPoint.className = "uchi-course-detail-actions";
  mountPoint.style.margin = "12px 0 20px";
  heading.insertAdjacentElement("afterend", mountPoint);

  const root = createRoot(mountPoint);

  async function render() {
    const schedule = await getActiveSchedule();
    const isAdded = detailCourse.id in schedule.courses;
    const conflictsWith = courseConflictsWithSaved(detailCourse, schedule.courses);
    root.render(
      <CourseActions
        course={detailCourse}
        isAdded={isAdded}
        conflictsWith={conflictsWith}
      />
    );
  }

  await render();
  onStorageChange(() => {
    render();
  });

  return true;
}

async function mountCatalogActions(table: Element) {
  if (table.querySelector("thead tr th:last-child")?.textContent === "UChiSchedule") {
    return;
  }

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

async function init() {
  injectCalendarButtons();

  const table = document.querySelector(".table-container table");
  if (table) {
    await mountCatalogActions(table);
  }

  await mountDetailPageActions();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
