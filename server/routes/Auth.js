const express =require('express');
const router =express.Router();
const{sendOTP,signup,login,forgotPassword,resetPassword,changePassword,deleteAccount,logout} =require('../controllers/auth/Auth');
const { auth } = require('../middleware/authMiddleware');


router.post("/sendotp",sendOTP);
router.post("/register",signup);
router.post('/login-user',login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', auth, changePassword);
router.delete('/delete-account', auth, deleteAccount);
router.post('/logout', auth, logout);

module.exports =router;