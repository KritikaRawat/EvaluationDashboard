const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const Mentor = require('../Models/Mentor');
// const Student = require('../Models/Student');

router.post("/createMentor", [
  body("name").isLength({ min: 5 })
], async (req, res) => {
  try {
    await Mentor.create({
      name: req.body.name,
    }).then(() => res.json({ success: true }));
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
});


router.post("/loginMentor", async (req, res) => {
  try {
    let name = req.body.name;

    let MentorInfo = await Mentor.findOne({ name });

    if (!MentorInfo) {
      return res.status(400).json({ errors: "Invalid Mentor" });
    }

    if (req.body.name !== MentorInfo.name) {
      return res.status(400).json({ errors: "Try Logging with registered credentials" });
    }

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
});

// for updating student count in mentor table
router.post('/updateCount', async (req, res) => {
  try {
    const { mentorName, count } = req.body;

    // Find the mentor by name
    const Mentor = await mentor.findOneAndUpdate(
      { name: mentorName },
      { $inc: { noAssignedStudents: count }},
      { new: true }
    );

    if (Mentor) {
      res.json({ message: 'Mentor count updated successfully' });
    } else {
      res.status(404).json({ error: 'Mentor not found' });
    }
  } catch (error) {
    console.error('Error updating mentor count:', error);
    res.status(500).json({ error: 'An error occurred while updating the mentor count' });
  }
});

module.exports= router;