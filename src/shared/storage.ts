import type { Course, Schedule, StorageData } from "./types";
import {
  deriveScheduleName,
  recomputeAutoScheduleName,
} from "./utils";

const STORAGE_KEY = "uchischedule_data";

function createDefaultSchedule(): Schedule {
  return {
    id: crypto.randomUUID(),
    name: "Schedule 1",
    courses: {},
  };
}

function getDefaultData(): StorageData {
  return {
    schedules: [createDefaultSchedule()],
    activeScheduleIndex: 0,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function createFallbackSchedule(index: number): Schedule {
  return {
    id: crypto.randomUUID(),
    name: `Schedule ${index + 1}`,
    courses: {},
  };
}

function normalizeSchedule(
  value: unknown,
  index: number
): { schedule: Schedule; changed: boolean } {
  const fallback = createFallbackSchedule(index);
  if (!isRecord(value)) {
    return { schedule: fallback, changed: true };
  }

  let changed = false;

  const id = typeof value.id === "string" && value.id.trim()
    ? value.id
    : (() => {
        changed = true;
        return fallback.id;
      })();

  const courses = isRecord(value.courses)
    ? (value.courses as Record<string, Course>)
    : (() => {
        changed = true;
        return {};
      })();

  const fallbackName = `Schedule ${index + 1}`;
  const storedName = typeof value.name === "string" && value.name.trim()
    ? value.name.trim()
    : (() => {
        changed = true;
        return fallbackName;
      })();

  const name = recomputeAutoScheduleName(storedName, courses, fallbackName);
  if (name !== storedName) {
    changed = true;
  }

  return {
    schedule: {
      id,
      name,
      courses,
    },
    changed,
  };
}

function normalizeData(value: unknown): { data: StorageData; changed: boolean } {
  if (!isRecord(value) || !Array.isArray(value.schedules)) {
    return { data: getDefaultData(), changed: true };
  }

  let changed = false;
  const schedules = value.schedules.map((schedule, index) => {
    const normalized = normalizeSchedule(schedule, index);
    changed ||= normalized.changed;
    return normalized.schedule;
  });

  if (schedules.length === 0) {
    return { data: getDefaultData(), changed: true };
  }

  const rawIndex = value.activeScheduleIndex;
  const nextIndex =
    typeof rawIndex === "number" && Number.isInteger(rawIndex) ? rawIndex : 0;
  const activeScheduleIndex = Math.min(
    Math.max(nextIndex, 0),
    schedules.length - 1
  );

  if (activeScheduleIndex !== rawIndex) {
    changed = true;
  }

  return {
    data: {
      schedules,
      activeScheduleIndex,
    },
    changed,
  };
}

export async function getData(): Promise<StorageData> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const { data, changed } = normalizeData(result[STORAGE_KEY]);
  if (changed) {
    await chrome.storage.local.set({ [STORAGE_KEY]: data });
  }
  return data;
}

async function setData(data: StorageData): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: data });
}

export async function getActiveSchedule(): Promise<Schedule> {
  const data = await getData();
  return data.schedules[data.activeScheduleIndex];
}

export async function addCourse(course: Course): Promise<void> {
  const data = await getData();
  const scheduleIndex = data.activeScheduleIndex;
  const schedule = data.schedules[scheduleIndex];
  schedule.courses[course.id] = course;
  schedule.name = recomputeAutoScheduleName(
    schedule.name,
    schedule.courses,
    `Schedule ${scheduleIndex + 1}`
  );

  await setData(data);
}

export async function removeCourse(courseId: string): Promise<void> {
  const data = await getData();
  const scheduleIndex = data.activeScheduleIndex;
  const schedule = data.schedules[scheduleIndex];
  delete schedule.courses[courseId];
  schedule.name = recomputeAutoScheduleName(
    schedule.name,
    schedule.courses,
    `Schedule ${scheduleIndex + 1}`
  );
  await setData(data);
}

export async function isCourseAdded(courseId: string): Promise<boolean> {
  const schedule = await getActiveSchedule();
  return courseId in schedule.courses;
}

export async function createSchedule(name: string): Promise<void> {
  const data = await getData();
  data.schedules.push({
    id: crypto.randomUUID(),
    name,
    courses: {},
  });
  data.activeScheduleIndex = data.schedules.length - 1;
  await setData(data);
}

export async function switchSchedule(index: number): Promise<void> {
  const data = await getData();
  if (index >= 0 && index < data.schedules.length) {
    data.activeScheduleIndex = index;
    await setData(data);
  }
}

export async function deleteSchedule(index: number): Promise<void> {
  const data = await getData();
  if (data.schedules.length <= 1) return; // keep at least one
  data.schedules.splice(index, 1);
  if (data.activeScheduleIndex >= data.schedules.length) {
    data.activeScheduleIndex = data.schedules.length - 1;
  }
  await setData(data);
}

export async function renameSchedule(
  index: number,
  name: string
): Promise<void> {
  const data = await getData();
  if (index >= 0 && index < data.schedules.length) {
    data.schedules[index].name = name;
    await setData(data);
  }
}

export async function duplicateSchedule(index: number): Promise<void> {
  const data = await getData();
  if (index < 0 || index >= data.schedules.length) return;

  const source = data.schedules[index];
  const sourceBaseName = deriveScheduleName(
    source.courses,
    `Schedule ${index + 1}`
  );
  const duplicatedBaseName = `${sourceBaseName} Copy`;
  const duplicated: Schedule = {
    id: crypto.randomUUID(),
    name: recomputeAutoScheduleName(
      `${source.name} Copy`,
      source.courses,
      duplicatedBaseName
    ),
    courses: { ...source.courses },
  };

  data.schedules.splice(index + 1, 0, duplicated);
  data.activeScheduleIndex = index + 1;
  await setData(data);
}

export function onStorageChange(
  callback: (data: StorageData) => void
): () => void {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes[STORAGE_KEY]) {
      callback(changes[STORAGE_KEY].newValue as StorageData);
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
