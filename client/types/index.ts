export interface Student {
  id: string;
  listId?: string;
  registrationNumber: string;
  name: string;
  branch: string;
  batch: string;
  createdAt: string;
}

export interface AttendanceList {
  id: string;
  branch: string;
  batch: string;
  subject?: string;
  semester?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  attendanceListId: string;
  studentId: string;
  date: string;
  status: "Present" | "Absent";
}

export type Branch =  "CSE"| "AIML" | "IOT" | "EE" | "ME" | "CE";
export type AttendanceStatus = "Present" | "Absent";

export const BRANCHES: Branch[] = ["CSE","AIML","IOT","EE", "ME", "CE"];

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Dynamic batch generator
 * Generates 5 batches based on current year
 * Example (2026):
 * 2022-2026, 2023-2027, 2024-2028, 2025-2029, 2026-2030
 */
export const getBatches = (): string[] => {
  const currentYear = new Date().getFullYear();
  const batches: string[] = [];

  const startBase = currentYear - 4; 

  for (let i = 0; i < 5; i++) {
    const startYear = startBase + i;
    const endYear = startYear + 4;
    batches.push(`${startYear}-${endYear}`);
  }

  return batches;
};


export const BATCHES = getBatches();

export const SEMESTERS = [
  "Semester 1", "Semester 2", "Semester 3", "Semester 4",
  "Semester 5", "Semester 6", "Semester 7", "Semester 8"
];