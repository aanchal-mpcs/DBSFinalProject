export interface QuarterDateRange {
  start: string;
  end: string;
}

// Source: UChicago academic calendar / registrar calendar pages.
// Official entry point:
// https://www.uchicago.edu/education-and-research/academic-calendar#nav-current
// Machine-readable current-year calendar:
// https://events.uchicago.edu/academic/calendar/year.php
export const QUARTER_DATE_RANGES: Record<string, QuarterDateRange> = {
  "Summer-2025": { start: "2025-06-16", end: "2025-08-23" },
  "Autumn-2025": { start: "2025-09-29", end: "2025-12-13" },
  "Winter-2026": { start: "2026-01-05", end: "2026-03-14" },
  "Spring-2026": { start: "2026-03-23", end: "2026-06-06" },
  "Summer-2026": { start: "2026-06-15", end: "2026-08-22" },
  "Autumn-2026": { start: "2026-09-28", end: "2026-12-12" },
  "Winter-2027": { start: "2027-01-04", end: "2027-03-13" },
  "Spring-2027": { start: "2027-03-22", end: "2027-06-05" },
  "Summer-2027": { start: "2027-06-14", end: "2027-08-14" },
  "Autumn-2027": { start: "2027-09-27", end: "2027-12-11" },
  "Winter-2028": { start: "2028-01-03", end: "2028-03-11" },
};
