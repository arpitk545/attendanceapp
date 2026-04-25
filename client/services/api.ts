export const BASE_URL =process.env.EXPO_PUBLIC_BASE_URL ||"https://attendanceapp-7xny.onrender.com";

//auth api

export const SEND_OTP_API = `${BASE_URL}/api/v1/auth/sendotp`;
export const SIGNUP_API = `${BASE_URL}/api/v1/auth/register`;
export const LOGIN_API = `${BASE_URL}/api/v1/auth/login-user`;
export const FORGOT_PASSWORD_API = `${BASE_URL}/api/v1/auth/forgot-password`;
export const RESET_PASSWORD_API = `${BASE_URL}/api/v1/auth/reset-password`;
export const CHANGE_PASSWORD_API = `${BASE_URL}/api/v1/auth/change-password`;
export const DELETE_ACCOUNT_API = `${BASE_URL}/api/v1/auth/delete-account`;
export const LOGOUT_API = `${BASE_URL}/api/v1/auth/logout`;

//attendance api

export const CREATE_ATTENDANCE_LIST = `${BASE_URL}/api/v1/attendance/create-attendance`;
export const ADD_STUDENTS = (listId: string) => `${BASE_URL}/api/v1/attendance/add-students/${listId}`;
export const MARK_ATTENDANCE = (listId: string) => `${BASE_URL}/api/v1/attendance/mark/${listId}`;
export const GET_ALL_LISTS = `${BASE_URL}/api/v1/attendance/all`;
export const GET_LIST_BY_ID = (listId: string) => `${BASE_URL}/api/v1/attendance/${listId}`;
export const UPDATE_LIST = (listId: string) => `${BASE_URL}/api/v1/attendance/update/${listId}`;
export const DELETE_LIST = (listId: string) => `${BASE_URL}/api/v1/attendance/delete/${listId}`;
export const UPDATE_STUDENT = (listId: string, regNumber: string) => `${BASE_URL}/api/v1/attendance/student/${listId}/${regNumber}`;
export const DELETE_STUDENT = (listId: string, regNumber: string) => `${BASE_URL}/api/v1/attendance/student/${listId}/${regNumber}`;