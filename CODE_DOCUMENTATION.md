# Code Documentation

## Overview

`UChiSchedule` is a Chrome extension for the University of Chicago MPCS course catalog. It lets users save courses from the catalog, manage multiple schedules, inspect conflicts in a weekly calendar, mark waitlisted courses, and export a schedule as an `.ics` file.

This project is a frontend-only extension:

- No backend services are used.
- Persistent state is stored in `chrome.storage.local`.
- The extension targets the MPCS catalog site at `https://mpcs-courses.cs.uchicago.edu/*`.

## Tech Stack

- `TypeScript`
- `React 18`
- `Vite`
- `@crxjs/vite-plugin`
- `Tailwind CSS`
- `Chrome Extension Manifest V3`

## High-Level Architecture

The extension is split into four main runtime areas:

1. `content script`
   Injects controls into the MPCS catalog and course detail pages.

2. `popup UI`
   Displays the saved courses for the active schedule and provides quick management actions.

3. `calendar page`
   Renders a full weekly planner view, conflict list, waitlist controls, and `.ics` export.

4. `background service worker`
   Handles extension-level messaging, currently used to open the calendar page.

Shared logic lives in `src/shared/*` and is reused across all three UI surfaces.

## Repository Structure

```text
src/
  background/
    index.ts                # Background service worker
  calendar/
    main.tsx                # Calendar page bootstrap
    CalendarApp.tsx         # Main calendar page container
    components/
      CalendarGrid.tsx      # Weekly grid rendering
      CourseList.tsx        # Sidebar course list and conflict list
    index.html              # Calendar page HTML entry
  content/
    index.tsx               # Content script entry
    scraper.ts              # Catalog/detail page scraping logic
    content.css             # Injected page styles
    components/
      CourseActions.tsx     # Buttons injected into catalog/detail pages
  popup/
    main.tsx                # Popup bootstrap
    PopupApp.tsx            # Popup UI
    index.html              # Popup HTML entry
  shared/
    storage.ts              # chrome.storage.local data access
    utils.ts                # Conflict, time, URL, registration, ICS helpers
    theme.ts                # Theme preference helpers
    quarterDates.ts         # Quarter start/end dates for ICS recurrence
    types.ts                # Shared TypeScript types
  manifest.ts               # Chrome extension manifest definition
```

## Build and Bootstrapping

### `vite.config.ts`

This file configures Vite with:

- `react()` for React support
- `crx({ manifest })` for Chrome extension bundling
- the `@` path alias mapped to `src`
- an additional HTML input for the calendar page

### `src/manifest.ts`

The manifest declares:

- Manifest V3
- `storage` permission
- a module-based background worker at `src/background/index.ts`
- a content script for the MPCS catalog domain
- the popup entry at `src/popup/index.html`
- extension icons

## Data Model

Shared types are defined in [src/shared/types.ts](/Users/as/DesignBuildShip/FinalProject/src/shared/types.ts).

### `Course`

Represents one catalog course or section. Important fields:

- `id`: normalized identifier used as the storage key
- `code`: human-readable course code like `MPCS 51100-1`
- `name`, `instructor`, `location`
- `meetingText`: original meeting-time text
- `meetings`: parsed meeting blocks used for conflict detection and calendar layout
- `detailUrl`: link back to the catalog detail page
- `term`, `year`: used for schedule naming and `.ics` recurrence windows
- `isWaitlisted`: optional user-managed flag

### `Schedule`

A saved schedule contains:

- `id`
- `name`
- `courses: Record<string, Course>`

The course record is keyed by `course.id`, so add/remove operations are simple object updates.

### `StorageData`

The top-level storage shape contains:

- `schedules: Schedule[]`
- `activeScheduleIndex: number`
- `themePreference: "system" | "light" | "dark"`

## Storage Layer

The storage logic lives in [src/shared/storage.ts](/Users/as/DesignBuildShip/FinalProject/src/shared/storage.ts).

### Storage key

All extension data is stored under one key:

- `uchischedule_data`

### Main responsibilities

- initialize default data on first run
- normalize stored data on read
- ensure at least one schedule always exists
- expose CRUD helpers for courses and schedules
- expose theme preference persistence
- provide a storage-change subscription API for React and content-script re-renders

### Important functions

- `getData()`: loads and normalizes the persisted data
- `getActiveSchedule()`: returns the currently selected schedule
- `addCourse()` / `removeCourse()`: mutate the active schedule
- `clearActiveScheduleCourses()`: clears only the active schedule's courses
- `setCourseWaitlisted()`: toggles waitlist state for a saved course
- `createSchedule()` / `switchSchedule()` / `deleteSchedule()`
- `renameSchedule()` / `duplicateSchedule()`
- `setThemePreference()`
- `onStorageChange()`: wraps `chrome.storage.onChanged`

### Normalization behavior

The storage layer is defensive. When reading from storage it repairs:

- invalid or missing schedule arrays
- missing schedule IDs
- invalid `activeScheduleIndex`
- invalid `themePreference`
- empty or malformed schedule names

This keeps older or partially corrupted saved data from breaking the UI.

## Shared Utility Layer

The main utility module is [src/shared/utils.ts](/Users/as/DesignBuildShip/FinalProject/src/shared/utils.ts).

### Time and meeting parsing

- `parseMeetingTime()` converts strings like `Monday 5:30pm - 8:30pm` into structured `CourseMeeting[]`
- `timeToHours()` and `hoursToMinutes()` convert user-facing time strings into numeric values
- `formatHour()` and `formatTimeLabel()` handle calendar/time display

### Conflict detection

- `meetingsOverlap()` compares two meeting blocks
- `getOverlapWindow()` computes the exact overlapping time span
- `findConflicts()` computes all pairwise conflicts in a schedule
- `courseConflictsWithSaved()` checks whether one course conflicts with the active saved set

These functions drive:

- red conflict warnings in the popup
- conflict badges and highlighting in the calendar page
- row highlighting in the injected catalog table

### Schedule naming helpers

- `inferScheduleQuarterLabel()`
- `deriveScheduleName()`
- `recomputeAutoScheduleName()`

If a schedule name is still considered "automatic", the app will rename it to the quarter label when all courses clearly belong to one quarter, for example `Autumn 2026`.

### External link helpers

- `getCourseFeedbackUrl()`: builds a Course Feedback URL from the course code
- `parseCourseCodeParts()`: splits values like `MPCS 51100-1` into subject, catalog number, and section
- `openRegistrationPage()`: opens the UChicago registration page
- `runRegistrationHandoff()`: copies one or more course codes to the clipboard, then opens registration

### `.ics` export

- `generateICS()` converts saved courses into calendar events
- `quarterDates.ts` provides quarter start/end dates used to generate weekly recurrences
- if quarter metadata is missing, the export falls back to a single upcoming week window

## Theming

Theme helpers live in [src/shared/theme.ts](/Users/as/DesignBuildShip/FinalProject/src/shared/theme.ts).

The project supports three preference states:

- `system`
- `dark`
- `light`

Key behavior:

- `resolveThemePreference()` maps `system` to the current OS/browser preference
- `applyThemePreference()` toggles the `dark` class on `document.documentElement`
- `getNextThemePreference()` rotates the theme in the order `system -> dark -> light -> system`

Both the popup and calendar page call `applyThemePreference()` whenever persisted data changes.

## Content Script Flow

The main content script is [src/content/index.tsx](/Users/as/DesignBuildShip/FinalProject/src/content/index.tsx).

### Responsibilities

- inject a `See My Calendar` button near semester headings
- detect the catalog table and append a custom `UChiSchedule` column
- render React action controls into each course row
- detect course detail pages and inject the same action controls below the page heading
- re-render injected controls whenever `chrome.storage.local` changes

### Main functions

#### `injectCalendarButtons()`

Searches the page for headings that match quarter names like `Spring 2026` and inserts a button that sends an `OPEN_CALENDAR` runtime message.

#### `mountCatalogActions(table)`

- appends a new header column
- scrapes each catalog row into a `Course`
- creates a React root per row
- renders `CourseActions` into the injected cell
- marks conflicting rows with a CSS class when the course overlaps with a saved course

#### `mountDetailPageActions()`

- scrapes the currently open course detail page
- inserts a React mount point below the page heading
- renders the same `CourseActions` component used in the table

### Scraping logic

Scraping lives in [src/content/scraper.ts](/Users/as/DesignBuildShip/FinalProject/src/content/scraper.ts).

Important functions:

- `inferCurrentTermFromPage()`: extracts quarter and year from visible page headings
- `getCourseRows()`: finds catalog table rows
- `scrapeCourseRow()`: extracts a `Course` from a table row
- `scrapeCourseDetailPage()`: extracts a `Course` from the detail page layout

The scraper uses several fallback strategies for detail pages:

- table rows with `th/td`
- `dt/dd` definition lists
- plain text line scanning

That makes it more tolerant of minor catalog markup variations.

## Injected Course Actions

The injected actions UI lives in [src/content/components/CourseActions.tsx](/Users/as/DesignBuildShip/FinalProject/src/content/components/CourseActions.tsx).

It provides:

- add/remove course from the active schedule
- open course feedback
- open registration after copying the course code
- open the full course description page
- open a lightweight details popup
- show immediate conflict warnings against already saved courses

This component is intentionally local and self-contained because it runs inside the host catalog page rather than the extension popup/calendar shell.

## Popup UI

The popup entry point is [src/popup/main.tsx](/Users/as/DesignBuildShip/FinalProject/src/popup/main.tsx), which mounts [src/popup/PopupApp.tsx](/Users/as/DesignBuildShip/FinalProject/src/popup/PopupApp.tsx).

### Responsibilities

- load current storage data
- react to storage updates
- render the active schedule's saved courses
- manage schedules
- surface conflicts in a compact view
- provide theme toggling
- open the full calendar page

### Main user actions

- `Open Calendar`: sends `OPEN_CALENDAR` to the background worker
- `New`, `Rename`, `Duplicate`, `Delete`, `Clear`
- per-course `Feedback`, `Register`, `Description`
- per-course copy helpers: full code, number, and section

### Notes

- register actions temporarily replace the button label with feedback like `Copied Course`
- schedule conflicts are displayed as a simple warning block above the course list
- when no courses are saved, the popup offers direct links to the catalog and registration

## Calendar Page

The calendar page entry point is [src/calendar/main.tsx](/Users/as/DesignBuildShip/FinalProject/src/calendar/main.tsx), which mounts [src/calendar/CalendarApp.tsx](/Users/as/DesignBuildShip/FinalProject/src/calendar/CalendarApp.tsx).

### Responsibilities

- render the full weekly planner
- manage schedules
- show conflict counts and conflict details
- toggle waitlist status
- export the active schedule as `.ics`
- provide registration handoff for all saved courses at once

### `CalendarApp.tsx`

This is the top-level page container. It:

- loads storage data and listens for updates
- computes conflicts via `findConflicts()`
- builds a color map for saved courses
- manages selected-conflict highlighting
- wires actions into the grid and the sidebar list

### `CalendarGrid.tsx`

This component renders the weekly timetable.

Key behavior:

- days shown: `Monday` through `Saturday`
- hour range shown: `8 AM` through `10 PM`
- overlapping meetings are laid out side-by-side using per-day column assignment
- conflicting courses get striped styling
- selected conflicts get stronger highlighting
- clicking a course block opens the course detail page when available

### `CourseList.tsx`

This sidebar component shows:

- all saved courses
- per-course feedback/register/description actions
- waitlist toggles
- copy helpers
- a conflict list generated from `findConflicts()`

Selecting a conflict in the list highlights the two involved courses in both the sidebar and the calendar grid.

## Background Worker

The background service worker is [src/background/index.ts](/Users/as/DesignBuildShip/FinalProject/src/background/index.ts).

Current responsibility:

- listen for `OPEN_CALENDAR`
- open `src/calendar/index.html` in a new tab

The `chrome.action.onClicked` listener exists only as a placeholder because the popup is already defined in the manifest.

## Main User Flows

### 1. Add a course from the catalog

1. The content script scrapes a catalog row into a `Course`.
2. `CourseActions` calls `addCourse(course)`.
3. `storage.ts` updates the active schedule in `chrome.storage.local`.
4. All open UIs subscribed via `onStorageChange()` re-render automatically.

### 2. Detect a conflict

1. Meetings are parsed by `parseMeetingTime()`.
2. `findConflicts()` or `courseConflictsWithSaved()` compares meeting windows.
3. The result is reflected in the popup, calendar, and content-script row state.

### 3. Open registration

1. `runRegistrationHandoff()` builds text from one or more selected courses.
2. It tries to copy the text to the clipboard.
3. It opens the UChicago registration page in a new tab.
4. The UI shows short-lived feedback indicating whether the copy succeeded.

### 4. Export `.ics`

1. `generateICS()` converts each saved meeting into a recurring calendar event.
2. Quarter date ranges from `quarterDates.ts` determine the recurrence end date.
3. `CalendarApp` creates a blob and downloads `<schedule-name>.ics`.

## Assumptions and Constraints

- The extension is currently specialized for the MPCS catalog structure.
- Scraping depends on the current DOM shape of the catalog and detail pages.
- Conflict detection relies on meeting strings matching expected day/time formats.
- The calendar grid only renders `Monday` through `Saturday`; Sunday meetings are supported by parsing and ICS generation but are not displayed in the main grid.
- `.ics` quarter ranges are hardcoded and need periodic maintenance as future academic terms are added.

## Maintenance Notes

When extending the project, the most common update points are:

- `src/content/scraper.ts` if the MPCS site markup changes
- `src/shared/utils.ts` if meeting formats, conflict rules, or registration behavior change
- `src/shared/storage.ts` if the persisted data model changes
- `src/shared/quarterDates.ts` when new quarter date ranges must be supported for export
- `src/calendar/components/*` and `src/popup/PopupApp.tsx` for UI changes

If the storage schema changes, update the normalization logic in `storage.ts` so existing users can migrate cleanly without clearing extension data.
