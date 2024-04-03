#Evaluation Dashboard

This project is a Mentor Evaluation System built using the MERN (MongoDB, Express.js, React.js, Node.js) stack. It allows mentors to assign students for evaluation, assign marks to them based on various parameters, edit/remove assigned students and marks, and finally submit the marks which will be locked thereafter. Additionally, mentors can view all the students and marks assigned to them with filters for ease of navigation.

#Setup Instructions
Prerequisites
- Node.js and npm should be installed on your system. You can download and install them from here.
- MongoDB should be installed and running. You can download and install it from here.
- Vite should be installed
- Nodemon packages should be installed



#More Details About the Evaluation Dashboard

Assigning Marks: Mentors can assign marks to each student based on various parameters such as ideation, execution, viva/pitch, etc. Total marks will be visible to the mentor.

Editing/Removing Students and Marks: Mentors can edit/remove assigned students and their marks while satisfying the same conditions as adding new students.

Final Submit: There is a final submit functionality available. Marks of all students will be locked after submission by the mentor and cannot be edited afterward. If some students have unassigned marks, mentors will not be able to submit/lock the marks.

Viewing Students and Marks: Mentors can view all the students and marks assigned to them with filters:

Filter by students whose marks are yet to be assigned.
Filter by students whose marks are already assigned.
Note
This application assumes that only mentors will be accessing it. Therefore, there are no login/signup pages included. Mentors and student accounts are created directly in the database for simplicity.

Credits
This project is developed by [Your Name]. If you have any questions or suggestions, feel free to contact me at [your-email@example.com].

Thank you for using the Mentor Evaluation System! 🚀
