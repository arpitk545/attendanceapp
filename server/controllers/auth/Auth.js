const OTP = require('../../models/Otp');
const otpGenerator = require('otp-generator');
const User = require('../../models/User');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const mailSender = require("../../utils/mailSender");
const forgotPasswordTemplate = require("../../mailTemplate/forgotpasswordtemplate");
const AttendanceList = require("../../models/attendancelist");

//send OTP to the user
exports.sendOTP = async (req, res) => {
    try {
      const { email } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login instead.",
      });
    }

      // Generate OTP
      const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      });

      // Check for unique OTP
      let result = await OTP.findOne({ otp });
      while (result) {
        otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, digits: true, alphabets: false });
        result = await OTP.findOne({ otp });
      }
  
      // Save OTP in database
      const otpPayload = { email, otp };
      const otpBody = await OTP.create(otpPayload);
   
      // Return response
      res.status(200).json({ success: true, message: "OTP sent successfully" });
  
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  //singup
  exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, otp } = req.body;

    const image = req.body.image || null;

    // 1. Validate fields
    if (!fullName || !email || !password || !confirmPassword || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2. Password match check
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // 3. Password strength check
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // 4. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }

    // 5. Verify OTP (latest OTP)
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      image,
    });

    // 8. Delete OTP after successful verification
    await OTP.deleteMany({ email });

    // 9. Response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        image: user.image,
      },
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "User registration failed",
    });
  }
};

//login controller for the user
exports.login = async (req, res) => {
    try {
      
      const { email, password } = req.body;
      // Check if email and password are provided
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }
  
      // Find user by email
      const user = await User.findOne({ email });
  
      // If user does not exist
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Account not found. Sign up to unlock access.",
        });
      }
  
      // Compare password
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password",
        });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        {
          email: user.email,
          id: user._id,
          accountType: user.accountType,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
  
      // Attach token to user and remove password from response
      user.token = token;
      user.password = undefined;
  
      // Set cookie
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        httpOnly: true,
      };
  
      // Send response
      res.cookie("token", token, options).status(200).json({
        success: true,
        message: "User logged in successfully",
        user,
        token,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "Email not registered" });
    }
    
    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();
    
    // Construct local resetting link
    const resetLink = `http://localhost:8081/auth/reset-password?token=${token}`;
    await mailSender(email, "Password Reset - Mark Attendance App", forgotPasswordTemplate(resetLink));
    
    return res.status(200).json({ success: true, message: "Reset link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing token or new password" });
    }
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // Check if token is not expired
    });
    
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect old password" });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete all attendance lists for this user
    await AttendanceList.deleteMany({ user: userId });
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    return res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const options = {
      expires: new Date(Date.now()),
      httpOnly: true,
    };
    return res.cookie("token", "", options).status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};