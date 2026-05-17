# UChiSchedule

UChiSchedule is a Chrome extension for MPCS students at the University of Chicago. It helps users save courses from the MPCS catalog, organize multiple schedule drafts, view them on a weekly calendar, detect conflicts, mark waitlisted courses, switch between light/dark/system themes, and export schedules as `.ics` files.

## Features

- Add courses from the MPCS catalog directly into the extension
- View saved courses in the popup and full calendar page
- Open a dedicated weekly calendar view
- Detect overlapping course times and highlight conflicts clearly
- Create, rename, duplicate, switch, clear, and delete schedules
- Mark courses as waitlisted
- Switch between `System`, `Dark`, and `Light` themes
- Export a schedule as an `.ics` calendar file
- Open quick links to Course Feedback, course descriptions, and the UChicago registration page
- Copy course code, course number, and section values from saved course cards

## Tech Stack

- Chrome Extension `Manifest V3`
- `TypeScript`
- `React`
- `Vite`
- `Tailwind CSS`
- `chrome.storage.local`

## Requirements

- `Google Chrome`
- `Node.js` and `npm`

## Download and Run Locally

1. Clone the repository:

```bash
git clone https://github.com/aanchal-mpcs/DBSFinalProject.git
cd DBSFinalProject
```

2. Install dependencies:

```bash
npm install
```

3. Build the extension:

```bash
npm run build
```

4. Open Chrome and go to `chrome://extensions`

5. Turn on `Developer mode`

6. Click `Load unpacked`

7. Select the `dist` folder inside this project

Chrome will load the extension and make it available from the extensions toolbar.

## How To Use

1. Open the MPCS course catalog:
   `https://mpcs-courses.cs.uchicago.edu/`

2. Find a course row in the catalog table.

3. Use the `+ Calendar` button to save that course into your active schedule.

4. Use the course action buttons to:
   - add or remove the course from your saved schedule
   - open `Course Feedback`
   - open the `Register` page
   - open the course `Description`
   - open the `Details` popup for course info

5. Click the extension icon in Chrome to open the popup. In the popup, you can:
   - see saved courses
   - open `Feedback`, `Register`, and `Description` links for each saved course
   - copy full course code, subject/number, or section from each saved course
   - remove a course
   - switch schedules
   - create a new schedule
   - rename schedules
   - duplicate schedules
   - mark a course as waitlisted
   - change the theme
   - open the calendar page
   - go to the UChicago registration page
   - clear the active schedule

6. Click `Open Calendar` or `View Calendar` to see your weekly schedule.

7. In the calendar page, you can:
   - see courses laid out by day and time
   - spot conflicts highlighted in red and click conflict entries to focus them
   - remove saved courses
   - use `Feedback`, `Register`, `Description`, and waitlist actions for each saved course
   - copy course code, number, and section values
   - create, rename, duplicate, switch, or delete schedules
   - clear the active schedule
   - export your current schedule as an `.ics` file
   - open course descriptions in a new tab from the calendar blocks

## Notes

- The current extension supports the `MPCS` course catalog.
- Schedule data is stored locally in Chrome using `chrome.storage.local`.
- No backend is required for the current version.
- `PROJECT_PROPOSAL.md` describes the broader original project direction, while `FINAL_PROJECT_SUBMISSION.md` explains how the final product narrowed that scope.
- The final product intentionally focuses on MPCS instead of university-wide course search support.

## Development

Run the production build:

```bash
npm run build
```

## Repository

GitHub: `https://github.com/aanchal-mpcs/DBSFinalProject`
