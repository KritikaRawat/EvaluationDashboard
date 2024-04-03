const express = require("express");
const router = express.Router();
const { default: mongoose } = require("mongoose");
const Students = require("../Models/Student");
const bodyParser = require("body-parser");
router.use(bodyParser.json());

router.get("/get", async (req, res) => {
  try {
    const student = await Students.find();
    res.status(200).json(student);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

router.post("/assign", async (req, res) => {
  const { mentor, students } = req.body;
  try {
    // Update students' assignedTo field in the database
    await Students.updateMany(
      { name: { $in: students } },
      { $set: { assignedTo: mentor } }
    );

    // Fetch mentor and assigned students' data from the database
    const assignedStudents = await Students.find({ assignedTo: mentor });

    res.json({ mentor, assignedStudents });
  } catch (error) {
    console.error("Error assigning students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/assignedTo/:mentorName", async (req, res) => {
  const { mentorName } = req.params;
  try {
    const assignedStudents = await Students.find({ assignedTo: mentorName });
    res.status(200).json(assignedStudents);
  } catch (err) {
    console.error("Error fetching assigned students:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/addMarks", (req, res) => {
  const { studentName, ideationMarks, executionMarks, vivaPitchMarks } = req.body;

  Students.findOneAndUpdate(
    { name: studentName },
    { ideation: ideationMarks, execution: executionMarks, vivaPitch: vivaPitchMarks },
    { new: true },
    (err, updatedStudent) => {
      if (err) {
        res.status(500).send("Error updating ideation marks");
      } else {
        res.json(updatedStudent);
      }
    }
  );
});

router.post("/add", async (req, res) => {
  const { name, assignedTo } = req.body;
  const student = await Students.findOne({ name });

  if (student) {
    if (student.assignedTo === "NULL" || student.assignedTo === assignedTo) {
       const assignedStudents = await Students.find({ assignedTo }).select('name -_id');
       if (assignedStudents.length < 4) {
        await Students.findOneAndUpdate({ name }, { $set: { assignedTo } });
        res.status(201).json({ message: 'Student added successfully' });
      } else {
        res.status(301).json({ error: 'Mentor already has 4 students assigned' });
      }
    } else {
      res.status(409).json({ error: 'Student is already assigned to another mentor' });
    }
  } else {
    // console.log("Student not found");
    res.status(404).json({ error: 'Student not found' });
  }
});


router.delete("/delete", async(req, res) => {
  const { studentName } = req.body;
  const student = await Students.findOne({ name: studentName });
  if (student) {
    if (student.assignedTo === req.body.name) {
      await Students.findOneAndUpdate({ name: studentName }, { $set: { assignedTo: "NULL" } });
      res.status(201).json({ message: 'Student deleted successfully' });
    } else {
      res.status(403).json({ error: 'Student is not assigned to you' });
    }
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

router.post("/submitMarks", (req, res) => {
  const { studentName } = req.body;

  if (!studentName) {
    return res.status(400).json({ error: "Student name is required" });
  }

  Students.findOneAndUpdate(
    { name: studentName },
    { marksSubmitted: "Submitted" },
    { new: true },
    (err, updatedStudent) => {
      if (err) {
        console.error("Error updating marks submission status:", err);
        return res.status(500).json({ error: "Error updating marks submission status" });
      } else {
        res.json(updatedStudent);
      }
    }
  );
});

module.exports = router;
