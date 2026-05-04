import type { Course, Schedule, StorageData } from "./types";
import { inferScheduleQuarterLabel } from "./utils";

const STORAGE_KEY = "uchischedule_data";

function isGenericScheduleName(name: string): boolean {
  return /^Schedule \d+(?: Copy)?$/.test(name.trim());
}

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

export async function getData(): Promise<StorageData> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const data = result[STORAGE_KEY] as StorageData | undefined;
  if (!data || !data.schedules || data.schedules.length === 0) {
    const defaults = getDefaultData();
    await chrome.storage.local.set({ [STORAGE_KEY]: defaults });
    return defaults;
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
  const schedule = data.schedules[data.activeScheduleIndex];
  schedule.courses[course.id] = course;

  const quarterLabel = inferScheduleQuarterLabel(schedule.courses);
  if (quarterLabel && isGenericScheduleName(schedule.name)) {
    schedule.name = quarterLabel;
  }

  await setData(data);
}

export async function removeCourse(courseId: string): Promise<void> {
  const data = await getData();
  const schedule = data.schedules[data.activeScheduleIndex];
  delete schedule.courses[courseId];
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
  const duplicated: Schedule = {
    id: crypto.randomUUID(),
    name: `${source.name} Copy`,
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
