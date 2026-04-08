import type { Course } from "@/shared/types";
import { parseMeetingTime } from "@/shared/utils";

// Scrape course data from an MPCS catalog table row
export function scrapeCourseRow(row: HTMLTableRowElement): Course | null {
  const cells = row.querySelectorAll("td");
  if (cells.length < 5) return null;

  const code = cells[0].textContent?.trim() ?? "";
  const nameLink = cells[1].querySelector("a");
  const name = nameLink?.textContent?.trim() ?? cells[1].textContent?.trim() ?? "";
  const detailPath = nameLink?.getAttribute("href") ?? null;
  const instructor = cells[2].textContent?.trim() ?? "";
  const location = cells[3].textContent?.trim() ?? "";
  const meetingText = cells[4].textContent?.trim() ?? "";
  const meetings = parseMeetingTime(meetingText);

  if (!code) return null;

  return {
    id: code.replace(/\s+/g, "-"),
    code,
    name,
    instructor,
    location,
    meetingText,
    meetings,
    detailUrl: detailPath
      ? `${window.location.origin}${detailPath}`
      : null,
  };
}

// Get all course rows from the page
export function getCourseRows(): HTMLTableRowElement[] {
  const rows = document.querySelectorAll<HTMLTableRowElement>(
    ".table-container table tbody tr"
  );
  return Array.from(rows);
}
