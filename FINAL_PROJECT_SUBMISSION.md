# Final Project Submission: UChiSchedule

## Project Overview

UChiSchedule is a Chrome extension designed to help University of Chicago students plan class schedules more effectively while browsing the MPCS course catalog. The final product focuses on a narrower but more polished scope than the original proposal. Rather than trying to solve every part of the broader UChicago registration ecosystem, the project was refined into a focused schedule-planning tool for MPCS catalog users.

The final extension allows users to save courses from the MPCS catalog, view them in a weekly calendar, detect schedule conflicts, manage multiple schedule drafts, access course feedback and registration links quickly, export schedules as `.ics` files, and use dark mode. Additional refinements were made to improve conflict handling and general usability.

## What the Final Product Does

The final product includes the following core functionality:

- Injects actions directly into the MPCS course catalog page
- Lets users add and remove courses from saved schedules
- Opens a dedicated extension calendar page showing courses in a weekly layout
- Detects overlapping courses and visually marks conflicts
- Provides quick-access buttons for:
  - course feedback
  - registration
  - course descriptions
- Supports multiple saved schedules with switching, renaming, duplication, and deletion
- Allows users to clear all courses from the active schedule
- Exports schedules as `.ics` calendar files
- Supports manual theme selection with `System`, `Dark`, and `Light` modes
- Allows courses to be marked as waitlisted
- Improves conflict UX through clearer conflict summaries and highlighted selections

## Comparison to the Original Proposal

The original proposal described a broader vision for a Chrome extension that would support UChicago course planning more generally, starting with MPCS and eventually expanding university-wide. The submitted project keeps the core planning workflow from the proposal, but narrows the scope to the MPCS catalog and emphasizes a stable, usable scheduling experience.

### Goals from the proposal that were achieved

- A Chrome extension for planning schedules from the course catalog
- Content-script actions injected directly into course pages
- Add-to-calendar behavior using `chrome.storage.local`
- A full visual weekly calendar view
- Conflict detection and conflict highlighting
- Direct registration access
- Course removal
- Course feedback access

### Goals that were refined or changed

- The proposal described a `new tab page` calendar view. In the final product, this became a dedicated extension calendar page rather than a true browser new-tab override.
- The proposal mentioned conflict detection at a high level. In the final product, this became one of the strongest parts of the extension, with clearer conflict summaries, clickable conflict entries, and synchronized highlighting between the sidebar and the schedule grid.
- The proposal did not emphasize theme support or schedule export as heavily as the final implementation. In practice, both dark mode and `.ics` export became meaningful parts of the completed product.

## Goals That Were Not Met or Were Intentionally Narrowed

### 1. RateMyProfessor integration

This goal was consciously dropped. In practice, UChicago instructors were not meaningfully represented on RateMyProfessor in a way that would make the feature useful. Because of that, building and maintaining a RateMyProfessor integration did not make sense for the final version of the project.

### 2. University-wide support

This goal was not completed because the final product did not have access to the broader university-wide course-search or course-planning environment needed to build and validate that functionality reliably. The final implementation therefore remains focused on the MPCS catalog, where the data structure was accessible and stable enough to support a working product.

### 3. Inline review previews

This goal was consciously dropped. During development, it became clear that the more valuable experience was quick access to useful external actions rather than embedding additional preview UI into the catalog page. Linking directly to feedback was sufficient for the final product and kept the extension simpler and more reliable.

### 4. Side-by-side schedule comparison

This goal was consciously dropped. As the project evolved, the UX for comparing multiple schedules side by side became more complicated than originally expected. Instead of forcing a more complex interface, the project shifted to supporting multiple schedules with schedule switching, renaming, and duplication. This kept the workflow useful without making the interface harder to use.

### 5. Seat availability indicators

This goal was not completed because of access limitations during development. The final product did not have a reliable source of seat-availability information available within the product-building context, so this feature was not completed.

## Why the Project Was Narrowed

The final submission should be understood as a proposal refined into a narrower product rather than a failed attempt to match every stretch goal. The narrowing was intentional in some areas and constrained in others.

The main priorities became:

- making the MPCS scheduling workflow actually work well
- strengthening conflict handling
- keeping registration and feedback actions easy to access
- improving usability through schedule management, dark mode, and export

This led to a product that is narrower than the original proposal, but more coherent and more realistic as a usable extension.

## Strongest Final Features

Three parts of the final product stand out most clearly.

### Conflict handling

Conflict handling became one of the strongest parts of the final submission. The extension not only detects overlapping courses, but also surfaces them in the calendar view, the saved-course sidebar, and the conflict summary panel. Users can see conflicts more clearly and identify which courses are causing them.

### Feedback and registration actions

The final product makes course feedback and registration more accessible from the main extension surfaces. These actions are available where users actually need them, which reduces friction during schedule planning.

### Dark mode and `.ics` export

Dark mode improved the usability and polish of the extension, especially for users who prefer darker interfaces. `.ics` export also extended the utility of the product beyond planning, since schedules can be moved into standard calendar tools after a user finalizes a plan.

## Final Reflection

The final version of UChiSchedule does not implement every part of the original proposal. However, it successfully delivers the most important planning workflow in a focused and usable form. The project began as a broader vision for UChicago-wide schedule planning, but the submitted result is a refined MPCS-centered extension with stronger execution in the areas that mattered most: schedule visualization, conflict handling, feedback access, and registration support.

In that sense, the project is best described as a narrowed but more polished implementation of the proposal rather than a direct one-to-one execution of every planned feature.
