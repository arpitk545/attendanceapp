const express = require("express");
const router = express.Router();

const { createAttendanceList,addStudentsToList,markAttendance,
    getAllLists,getListById,updateList,deleteList,updateStudent,deleteStudent
} = require("../controllers/attendance");
const { auth } = require("../middleware/authMiddleware");

router.post("/create-attendance", auth, createAttendanceList);
router.post("/add-students/:listId", auth, addStudentsToList);
router.post("/mark/:listId", auth, markAttendance);

router.get("/all", auth, getAllLists);
router.get("/:listId", auth, getListById);

router.put("/update/:listId", auth, updateList);
router.delete("/delete/:listId", auth, deleteList);

router.put("/student/:listId/:regNumber", auth, updateStudent);
router.delete("/student/:listId/:regNumber", auth, deleteStudent);

module.exports = router;