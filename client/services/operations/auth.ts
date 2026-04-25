import { apiConnector } from "../apiConnector";
import{SEND_OTP_API,SIGNUP_API,LOGIN_API,FORGOT_PASSWORD_API,RESET_PASSWORD_API,CHANGE_PASSWORD_API,DELETE_ACCOUNT_API,LOGOUT_API} from "../api";

export const sendOtp = async (email: string) => {
  try {
    const res = await apiConnector("POST", SEND_OTP_API, { email });
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to send OTP",
    };
  }
};

export const signup = async (data: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp: string;
  image?: string;
}) => {
  try {
    const res = await apiConnector("POST", SIGNUP_API, data);
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Signup failed",
    };
  }
};

export const login = async (email: string, password: string) => {
  try {
    const res = await apiConnector("POST", LOGIN_API, {
      email,
      password,
    });
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const res = await apiConnector("POST", FORGOT_PASSWORD_API, { email });
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to send reset email",
    };
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const res = await apiConnector("POST", RESET_PASSWORD_API, { token, newPassword });
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Password reset failed",
    };
  }
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  try {
    const res = await apiConnector("POST", CHANGE_PASSWORD_API, { oldPassword, newPassword });
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Change password failed",
    };
  }
};

export const deleteAccount = async () => {
  try {
    const res = await apiConnector("DELETE", DELETE_ACCOUNT_API);
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete account",
    };
  }
};

export const logout = async () => {
  try {
    const res = await apiConnector("POST", LOGOUT_API);
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Logout failed",
    };
  }
};