const AttendanceList = require("../models/attendancelist");

exports.createAttendanceList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, branch, batch, semester } = req.body;

    if (!subject || !branch || !batch || !semester) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const list = await AttendanceList.create({
      subject,
      branch,
      batch,
      semester,
      user: userId,
      students: []
    });

    return res.status(201).json({
      success: true,
      message: "Attendance list created successfully",
      data: list,
    });

  } catch (error) {
    console.log("CREATE LIST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create attendance list",
    });
  }
};

exports.addStudentsToList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;
    const { students } = req.body;

    if (!students || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Students data is required",
      });
    }

    const list = await AttendanceList.findById(listId);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: "Attendance list not found",
      });
    }

    if (list.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const existingRegs = list.students.map(s => s.registrationNumber);

    const newStudents = students.filter(
      s => !existingRegs.includes(s.registrationNumber)
    );

    await AttendanceList.findByIdAndUpdate(listId, {
      $push: {
        students: newStudents.map(s => ({
          name: s.name,
          registrationNumber: s.registrationNumber,
          attendance: []
        }))
      }
    });

    return res.status(200).json({
      success: true,
      message: "Students added successfully",
    });

  } catch (error) {
    console.log("ADD STUDENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add students",
    });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;
    const { date, records } = req.body;

    if (!date || !records || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Date and records are required",
      });
    }

    const list = await AttendanceList.findById(listId);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: "Attendance list not found",
      });
    }

    if (list.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const operations = records.map(r => ({
      updateOne: {
        filter: {
          _id: listId,
          "students.registrationNumber": r.registrationNumber,
        },
        update: {
          $pull: {
            "students.$.attendance": { date: date }
          }
        }
      }
    }));

    await AttendanceList.bulkWrite(operations);

    const pushOps = records.map(r => ({
      updateOne: {
        filter: {
          _id: listId,
          "students.registrationNumber": r.registrationNumber,
        },
        update: {
          $push: {
            "students.$.attendance": {
              date: date,
              status: r.status
            }
          }
        }
      }
    }));

    await AttendanceList.bulkWrite(pushOps);

    return res.status(200).json({
      success: true,
      message: "Attendance saved successfully",
    });

  } catch (error) {
    console.log("MARK ATTENDANCE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
    });
  }
};

/* ================= GET ALL LISTS ================= */
exports.getAllLists = async (req, res) => {
  try {
    const userId = req.user.id;

    const lists = await AttendanceList.find({ user: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: lists,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch lists",
    });
  }
};

/* ================= GET LIST BY ID ================= */
exports.getListById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;

    const list = await AttendanceList.findById(listId);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: "List not found",
      });
    }

    if (list.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      data: list,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch list",
    });
  }
};

/* ================= UPDATE LIST ================= */
exports.updateList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;
    const updates = req.body;

    const list = await AttendanceList.findById(listId);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: "List not found",
      });
    }

    if (list.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updated = await AttendanceList.findByIdAndUpdate(
      listId,
      updates,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "List updated successfully",
      data: updated,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update list",
    });
  }
};

/* ================= DELETE LIST ================= */
exports.deleteList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;

    const list = await AttendanceList.findById(listId);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: "List not found",
      });
    }

    if (list.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await AttendanceList.findByIdAndDelete(listId);

    return res.status(200).json({
      success: true,
      message: "List deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete list",
    });
  }
};

/* ================= UPDATE STUDENT ================= */
exports.updateStudent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId, regNumber } = req.params;
    const { name, newRegistrationNumber } = req.body;

    const list = await AttendanceList.findById(listId);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: "List not found",
      });
    }

    if (list.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const student = list.students.find(
      s => s.registrationNumber === regNumber
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // 🔥 Duplicate check (important)
    if (newRegistrationNumber) {
      const alreadyExists = list.students.find(
        s => s.registrationNumber === newRegistrationNumber
      );

      if (alreadyExists) {
        return res.status(400).json({
          success: false,
          message: "Registration number already exists",
        });
      }

      student.registrationNumber = newRegistrationNumber;
    }

    if (name) {
      student.name = name;
    }

    await list.save();

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });

  } catch (error) {
    console.log("UPDATE STUDENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update student",
    });
  }
};
/* ================= DELETE STUDENT ================= */
exports.deleteStudent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId, regNumber } = req.params;

    const list = await AttendanceList.findById(listId);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: "List not found",
      });
    }

    if (list.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    list.students = list.students.filter(
      s => s.registrationNumber !== regNumber
    );

    await list.save();

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete student",
    });
  }
};