import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AttendanceList, AttendanceRecord, Student } from "../types";
import {
  getAllLists,
  createAttendanceList,
  addStudentsToList,
  updateList,
  deleteList,
  markAttendance,
  updateStudent as apiUpdateStudent,
  deleteStudent as apiDeleteStudent
} from "../services/operations/attendance";

interface AppContextType {
  students: Student[];
  attendanceLists: AttendanceList[];
  attendanceRecords: AttendanceRecord[];
  addStudent: (listId: string, student: any) => Promise<void>;
  addMultipleStudents: (listId: string, students: any[]) => Promise<void>;
  updateStudent: (listId: string, regNumber: string, data: any) => Promise<void>;
  deleteStudent: (listId: string, regNumber: string) => Promise<void>;
  addAttendanceList: (list: any) => Promise<AttendanceList | undefined>;
  updateAttendanceList: (id: string, list: any) => Promise<AttendanceList | undefined>;
  deleteAttendanceList: (id: string) => Promise<void>;
  saveAttendanceRecords: (listId: string, records: AttendanceRecord[]) => Promise<void>;
  getAttendanceForList: (listId: string, date: string) => AttendanceRecord[];
  getListDetails: (listId: string) => Promise<any>;
  isLoading: boolean;
  loadData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceLists, setAttendanceLists] = useState<AttendanceList[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Define getListDetails first (before other callbacks that depend on it)
  const getListDetails = useCallback(async (listId: string) => {
    const { getListById } = require("../services/operations/attendance");
    const res = await getListById(listId);
    if (res.success && res.data) {
      const list = res.data;
      const newStudents: Student[] = [];
      const newRecords: AttendanceRecord[] = [];

      if (list.students && Array.isArray(list.students)) {
        list.students.forEach((student: any) => {
          const sId = student._id || student.registrationNumber;
          newStudents.push({
            id: sId,
            listId: list._id,
            name: student.name,
            registrationNumber: student.registrationNumber,
            branch: list.branch,
            batch: list.batch,
            createdAt: list.createdAt
          });

          if (student.attendance && Array.isArray(student.attendance)) {
            student.attendance.forEach((att: any) => {
              newRecords.push({
                id: att._id || Math.random().toString(),
                attendanceListId: list._id,
                studentId: sId,
                date: att.date,
                status: att.status
              });
            });
          }
        });
      }

      setStudents(prev => {
        const filtered = prev.filter(s => s.listId !== listId);
        return [...filtered, ...newStudents];
      });
      setAttendanceRecords(prev => {
        const filtered = prev.filter(r => r.attendanceListId !== listId);
        return [...filtered, ...newRecords];
      });

      return res.data;
    }
    return null;
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAllLists();
      if (res.success && res.data) {
        const flattenedLists: AttendanceList[] = [];
        const flattenedStudents: Student[] = [];
        const flattenedRecords: AttendanceRecord[] = [];

        res.data.forEach((list: any) => {
          flattenedLists.push({
            id: list._id,
            subject: list.subject,
            branch: list.branch,
            batch: list.batch,
            semester: list.semester,
            createdAt: list.createdAt || new Date().toISOString()
          });

          if (list.students && Array.isArray(list.students)) {
            list.students.forEach((student: any) => {
              const sId = student._id || student.registrationNumber;
              flattenedStudents.push({
                id: sId,
                listId: list._id,
                name: student.name,
                registrationNumber: student.registrationNumber,
                branch: list.branch,
                batch: list.batch,
                createdAt: list.createdAt
              });

              if (student.attendance && Array.isArray(student.attendance)) {
                student.attendance.forEach((att: any) => {
                  flattenedRecords.push({
                    id: att._id || Math.random().toString(),
                    attendanceListId: list._id,
                    studentId: sId,
                    date: att.date,
                    status: att.status
                  });
                });
              }
            });
          }
        });

        setAttendanceLists(flattenedLists);
        setStudents(flattenedStudents);
        setAttendanceRecords(flattenedRecords);
      }
    } catch (e) {
      console.error("Failed to load data from API", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Now define other callbacks that depend on getListDetails
  const addStudent = useCallback(async (listId: string, data: any) => {
    const res = await addStudentsToList(listId, [data]);
    if (res.success) {
      await loadData();
      await getListDetails(listId);
    }
  }, [loadData, getListDetails]);

  const addMultipleStudents = useCallback(async (listId: string, newStudentsData: any[]) => {
    const res = await addStudentsToList(listId, newStudentsData);
    if (res.success) {
      await loadData();
      await getListDetails(listId);
    }
  }, [loadData, getListDetails]);

  const updateStudent = useCallback(async (listId: string, regNumber: string, data: any) => {
    const res = await apiUpdateStudent(listId, regNumber, data);
    if (res.success) {
      await loadData();
      await getListDetails(listId);
    }
  }, [loadData, getListDetails]);

  const deleteStudent = useCallback(async (listId: string, regNumber: string) => {
    const res = await apiDeleteStudent(listId, regNumber);
    if (res.success) {
      await loadData();
      await getListDetails(listId);
    }
  }, [loadData, getListDetails]);

  const addAttendanceList = useCallback(async (data: any): Promise<AttendanceList | undefined> => {
    const res = await createAttendanceList(data);
    if (res.success) {
      await loadData();
      return res.data;
    }
    return undefined;
  }, [loadData]);

  const updateAttendanceList = useCallback(async (id: string, data: any): Promise<AttendanceList | undefined> => {
    const res = await updateList(id, data);
    if (res.success) {
      await loadData();
      return res.data;
    }
    return undefined;
  }, [loadData]);

  const deleteAttendanceList = useCallback(async (id: string) => {
    const res = await deleteList(id);
    if (res.success) await loadData();
  }, [loadData]);

  const saveAttendanceRecords = useCallback(async (listId: string, newRecords: AttendanceRecord[]) => {
    if (newRecords.length === 0) return;
    const date = newRecords[0].date;
    
    const backendRecords = newRecords.map(r => {
      const student = students.find(s => s.id === r.studentId);
      return {
        registrationNumber: student?.registrationNumber || "",
        status: r.status
      };
    }).filter(r => r.registrationNumber !== "");

    const res = await markAttendance(listId, { date, records: backendRecords });
    if (res.success) {
      await loadData();
      await getListDetails(listId);
    }
  }, [loadData, getListDetails, students]);

  const getAttendanceForList = useCallback((listId: string, date: string): AttendanceRecord[] => {
    return attendanceRecords.filter(r => r.attendanceListId === listId && r.date === date);
  }, [attendanceRecords]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <AppContext.Provider value={{
      students,
      attendanceLists,
      attendanceRecords,
      addStudent,
      addMultipleStudents,
      updateStudent,
      deleteStudent,
      addAttendanceList,
      updateAttendanceList,
      deleteAttendanceList,
      saveAttendanceRecords,
      getAttendanceForList,
      getListDetails,
      isLoading,
      loadData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}