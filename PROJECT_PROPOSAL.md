# Project Proposal: UChiSchedule

## One-Line Description
A Chrome extension that helps UChicago students visually plan their class schedule, detect conflicts, and access course reviews — all without leaving the course search page.

## The Problem
UChicago's course registration experience has no schedule visualization. Students browse courses on coursesearch.uchicago.edu as a flat list with no way to see how classes fit together in their week. Course reviews (coursefeedback.uchicago.edu) and professor ratings (RateMyProfessor) live on entirely separate sites, requiring constant tab-switching. The result: students accidentally pre-register or waitlist for classes with overlapping times and don't realize it until it's too late — losing spots in their preferred courses. This matters because registration is stressful and high-stakes, and the tools students have today make it worse, not better.

## Target User
University of Chicago students registering for classes each quarter — undergrads, masters students (including MPCS), and anyone navigating the course catalog. Starting with MPCS students as the initial test group, then expanding university-wide.

## Core Features (v1)
1. **Content script on coursesearch.uchicago.edu** — injects buttons next to each course in the search results:
   - "Add to Calendar" — saves the course (name, time, days, instructor, location) to the extension's built-in calendar
   - "RateMyProfessor" — links directly to the instructor's RateMyProfessor page
   - "Course Feedback" — links to the course's page on coursefeedback.uchicago.edu
   - "Course Description" — links to the full course detail page
2. **Weekly calendar view (new tab page)** — a full-page visual calendar showing all added courses as time blocks, organized by day and time. Allows overlapping/conflicting courses to be added, but visually highlights conflicts so students can see them clearly.
3. **Conflict detection** — when two or more courses overlap in time, they are visually flagged (e.g., red highlight, warning badge) so students know before they register.
4. **"Register" link** — a button on the calendar page that takes students directly to my.uchicago.edu to complete actual registration.
5. **Course removal** — ability to remove courses from the calendar to try different schedule combinations.

## Tech Stack
- **Frontend**: HTML/CSS/JavaScript for the content script; React for the new tab calendar page (bundled with the extension)
- **Styling**: Tailwind CSS for the new tab page; inline styles for injected content script elements (to avoid conflicts with UChicago's site styles)
- **Database**: None — Chrome's built-in `chrome.storage.local` for persisting saved courses. No backend needed.
- **Auth**: None for the extension itself. Leverages the student's existing authenticated session on coursefeedback.uchicago.edu to pull review data.
- **APIs**:
  - RateMyProfessor GraphQL API — to link to (and potentially preview) professor ratings
  - coursefeedback.uchicago.edu — accessed via the student's existing browser session for review data
  - coursesearch.uchicago.edu — DOM parsing via content script to extract course data
- **Deployment**: Chrome Web Store (published as a public extension any UChicago student can install)
- **MCP Servers**:
  - Playwright MCP — for testing the extension against live UChicago pages and automating interaction flows during development

## Stretch Goals
- **University-wide support** — expand content script to work on the general coursesearch.uchicago.edu results (not just MPCS), handling all departments and course formats
- **Inline review previews** — show a snippet of RateMyProfessor ratings and coursefeedback data directly in the content script tooltip/popover, so students don't even have to leave the page
- **Calendar export** — after finalizing a schedule (post-registration), export to Google Calendar, Apple Calendar, or Outlook via .ics file
- **Multiple schedule drafts** — save and compare 2-3 different schedule options side by side
- **Seat availability indicators** — show open/closed/waitlist status next to courses on the calendar
- **Dark mode** — match the calendar view to the student's system theme preference

## Biggest Risk
**Scaling from MPCS to university-wide.** The MPCS course catalog (mpcs-courses.cs.uchicago.edu) has a clean, predictable HTML table structure that's easy to parse. The university-wide coursesearch.uchicago.edu is a PeopleSoft system with a very different (and likely messier) DOM structure. Making the content script work reliably across both — and handling edge cases like cross-listed courses, TBA times, and varied schedule formats — is the hardest technical challenge. Additionally, pulling data from coursefeedback.uchicago.edu depends on the student's active Okta session, which can expire unpredictably.

## Week 5 Goal
A working Chrome extension with a content script that successfully injects "Add to Calendar" buttons next to each course on the MPCS course catalog page (mpcs-courses.cs.uchicago.edu). Clicking the button saves the course data (name, time, days, instructor) to chrome.storage.local. This proves the core content script injection and data extraction pipeline works — the foundation everything else builds on.
