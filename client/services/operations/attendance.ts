import { apiConnector } from "../apiConnector";
import {
  CREATE_ATTENDANCE_LIST,
  ADD_STUDENTS,
  MARK_ATTENDANCE,
  GET_ALL_LISTS,
  GET_LIST_BY_ID,
  UPDATE_LIST,
  DELETE_LIST,
  UPDATE_STUDENT,
  DELETE_STUDENT,
} from "../api";

export const createAttendanceList = async (data: any) => {
  try {
    const res = await apiConnector("POST", CREATE_ATTENDANCE_LIST, data);
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create attendance list",
    };
  }
};

export const addStudentsToList = async (listId: string, students: any[]) => {
  try {
    const res = await apiConnector("POST", ADD_STUDENTS(listId), { students });
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to add students",
    };
  }
};

export const markAttendance = async (listId: string, data: any) => {
  try {
    const res = await apiConnector("POST", MARK_ATTENDANCE(listId), data);
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to mark attendance",
    };
  }
};

export const getAllLists = async () => {
  try {
    const res = await apiConnector("GET", GET_ALL_LISTS);
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch lists",
    };
  }
};

export const getListById = async (listId: string) => {
  try {
    const res = await apiConnector("GET", GET_LIST_BY_ID(listId));
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch list",
    };
  }
};

export const updateList = async (listId: string, data: any) => {
  try {
    const res = await apiConnector("PUT", UPDATE_LIST(listId), data);
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update list",
    };
  }
};

export const deleteList = async (listId: string) => {
  try {
    const res = await apiConnector("DELETE", DELETE_LIST(listId));
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete list",
    };
  }
};

export const updateStudent = async (
  listId: string,
  regNumber: string,
  data: any
) => {
  try {
    const res = await apiConnector(
      "PUT",
      UPDATE_STUDENT(listId, regNumber),
      data
    );
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update student",
    };
  }
};
export const deleteStudent = async (listId: string, regNumber: string) => {
  try {
    const res = await apiConnector(
      "DELETE",
      DELETE_STUDENT(listId, regNumber)
    );
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete student",
    };
  }
};



