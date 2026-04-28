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

function findLabeledValue(labels: string[]): string {
  const normalizedLabels = labels.map((label) => label.toLowerCase());

  const tableRows = document.querySelectorAll("tr");
  for (const row of tableRows) {
    const cells = row.querySelectorAll("th, td");
    if (cells.length < 2) continue;
    const label = cells[0].textContent?.trim().toLowerCase() ?? "";
    if (normalizedLabels.includes(label)) {
      return cells[1].textContent?.trim() ?? "";
    }
  }

  const dts = document.querySelectorAll("dt");
  for (const dt of dts) {
    const label = dt.textContent?.trim().toLowerCase() ?? "";
    if (!normalizedLabels.includes(label)) continue;
    const dd = dt.nextElementSibling;
    if (dd?.tagName.toLowerCase() === "dd") {
      return dd.textContent?.trim() ?? "";
    }
  }

  const lines = document.body.innerText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = 0; i < lines.length - 1; i++) {
    if (normalizedLabels.includes(lines[i].toLowerCase())) {
      return lines[i + 1];
    }
  }

  return "";
}

export function scrapeCourseDetailPage(): Course | null {
  const heading = document.querySelector("h1");
  const title = heading?.textContent?.trim() ?? "";
  if (!title) return null;

  const titleMatch = title.match(
    /^([A-Z]{4}\s+\d{5})(?:-(\d+))?\s+(.+?)(?:\s+\((Spring|Summer|Autumn|Winter)\s+\d{4}\))?$/i
  );
  if (!titleMatch) return null;

  const baseCode = titleMatch[1];
  const sectionFromTitle = titleMatch[2];
  const name = titleMatch[3].trim();
  const section = sectionFromTitle || findLabeledValue(["section"]);
  const code = section ? `${baseCode}-${section}` : baseCode;
  const instructor = findLabeledValue(["instructor(s)", "instructors"]);
  const location = findLabeledValue(["location"]);
  const meetingText = findLabeledValue(["meeting times"]);

  return {
    id: code.replace(/\s+/g, "-"),
    code,
    name,
    instructor,
    location,
    meetingText,
    meetings: parseMeetingTime(meetingText),
    detailUrl: window.location.href,
  };
}
