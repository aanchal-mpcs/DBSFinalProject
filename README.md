# UChiSchedule

UChiSchedule is a Chrome extension that helps University of Chicago students plan class schedules from the MPCS course catalog. It lets you save courses, view them on a weekly calendar, detect conflicts, and export your schedule as an `.ics` file.

## Features

- Add courses from the MPCS catalog directly into the extension
- View saved courses in the extension popup
- Open a full weekly calendar view
- Detect overlapping course times
- Create and switch between multiple schedules
- Remove courses from any saved schedule
- Export a schedule as an `.ics` calendar file
- Open quick links to RateMyProfessor, Course Feedback, and my.UChicago

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

4. Use the `Details` button to view the course info and open quick links:
   - `RateMyProfessor`
   - `Course Feedback`
   - `Description`

5. Click the extension icon in Chrome to open the popup. In the popup, you can:
   - see saved courses
   - remove a course
   - switch schedules
   - create a new schedule
   - open the calendar page
   - go to `my.UChicago`

6. Click `Open Calendar` or `View Calendar` to see your weekly schedule.

7. In the calendar page, you can:
   - see courses laid out by day and time
   - spot conflicts highlighted visually
   - remove saved courses
   - switch or delete schedules
   - export your current schedule as an `.ics` file

## Notes

- The current extension supports the `MPCS` course catalog.
- Schedule data is stored locally in Chrome using `chrome.storage.local`.
- No backend is required for the current version.
- `PROJECT_PROPOSAL.md` describes the broader project direction, but the shipped implementation is the extension code in this repository.

## Development

Run the production build:

```bash
npm run build
```

## Repository

GitHub: `https://github.com/aanchal-mpcs/DBSFinalProject`
