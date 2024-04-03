
import React, {useRef, useState, useEffect } from "react";
import { TypeAnimation } from "react-type-animation";
import "../assets/Modal.css";
function index() {
  const [mentorName, setMentorName] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [redirectToEvaluation, setRedirectToEvaluation] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [evaluationStarted, setEvaluationStarted] = useState(false); //Track if evaluation has started
  const [editMode, setEditMode] = useState(false); // Track if edit mode is active
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [allStudentData, setAllStudentData] = useState([]);
  const [redirectToAllStudents, setRedirectToAllStudents] = useState(false);
  const [deleteInput, setDeleteInput] = useState(""); //State to store input value for student deletion
  const [assignedStudentData, setAssignedStudentData] = useState(null);
  const [oldStudentCheck, setOldStudentCheck] = useState(false);
  const [newStudentCheck, setNewStudentCheck] = useState(false);
  const [filterOption, setFilterOption] = useState("evaluated");
  const [studentName, setStudentName] = useState("");
  const [ideationMarks, setIdeationMarks] = useState("");
  const [executionMarks, setExecutionMarks] = useState("");
  const [vivaPitchMarks, setvivaPitchMarks] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (redirectToEvaluation) {
      fetchStudentData();
    }
  }, [redirectToEvaluation]);

  
  

  //To get the Student data based on filter
  const fetchStudentData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/students/get`);
      const data = await response.json();
      // Filter out students with NULL assignedTo
      const filteredData = data.filter((student) => {
        return student.assignedTo == "NULL";
      });

      setStudentData(filteredData);
      setRedirectToEvaluation(true); //Redirect to evaluation page
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  //To fetch all the students in the Database
  const fetchAllStudentData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/students/get`);
      const data = await response.json();
      setAllStudentData(data);
      toggleRedirectToAllStudents();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //To fetch Assigned students for a mentor
  const fetchAssignedStudents = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/students/assignedTo/${mentorName}`
      );
      const data = await response.json();
      console.log(data);
      setAssignedStudentData(data);
    } catch (error) {
      alert("Error occurred while fetching assigned students");
      console.error("Error:", error);
    }
  };


  //To login mentor
  const handleSubmit = async (e) => {
    setSelectedStudents([]);
    setEvaluationStarted(false);
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:3000/api/mentors/loginMentor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: mentorName }),
        }
      );
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        alert(data.errors || "Error occurred");
      } else {
        setLoginSuccess(true);
        setRedirectToEvaluation(true);
        alert("Login successful");
      }
      fetchStudentData();
      fetchAssignedStudents();
    } catch (error) {
      console.error("Error:", error);
    }
  };


  const handleChange = (event) => {
    setMentorName(event.target.value);
  };

  //Handles checkbox change
  const handleCheckboxChange = (studentName) => {
    const index = selectedStudents.indexOf(studentName);
    if (index === -1) {
      if (selectedStudents.length + assignedStudentData.length + 1 > 4) {
        if (assignedStudentData.length === 1) {
          setErrorMessage(
            `You are already assigned to ${
              assignedStudentData.length
            } students. You can only add ${4 - assignedStudentData.length} more`
          );
        } else {
          setErrorMessage(
            `You are already assigned to ${
              assignedStudentData.length
            } students. To add ${
              4 - assignedStudentData.length
            } more, click on EDIT STUDENTS button!`
          );
        }
      } else if (selectedStudents.length < 4) {
        setSelectedStudents([...selectedStudents, studentName]);
      }
    } else if (index !== -1) {
      setSelectedStudents(
        selectedStudents.filter((name) => name !== studentName)
      );
    }
  };
  //Handles Assignment of student
  const handleAssignment = async () => {
    setSelectedStudents([]);
    setEvaluationStarted(false);
    try {
      if (selectedStudents.length < 3) {
        alert("Please select at least 3 students for assignment");
        return; //Stop further execution if less than 3 students are selected
      }
      const response = await fetch(
        "http://localhost:3000/api/students/assign",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mentor: mentorName,
            students: selectedStudents,
          }),
        }
      );
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        fetchAssignedStudents();
        // Update assignedTo value of selected students
        const updatedStudentData = studentData.map((student) => {
          if (selectedStudents.includes(student.name)) {
            return { ...student, assignedTo: mentorName };
          }
          return student;
        });
        setStudentData(updatedStudentData);
        // Update noAssignedStudents count in the mentor table
        const mentorResponse = await fetch(
          "http://localhost:3000/api/mentors/updateCount",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              mentorName: mentorName,
              count: selectedStudents.length,
            }),
          }
        );
        const mentorData = await mentorResponse.json();
        console.log(mentorData);
        alert("Students assigned successfully");
      } else {
        alert(data.errors || "Error occurred while assigning students");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //Handles Edit button
  const handleEditClick = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/students/assignedTo/${mentorName}`
      );
      const data = await response.json();
      setAssignedStudents(data);
      setEditMode(true);
      // alert(`These are the already assigned student`);
    } catch (error) {
      console.error("Error fetching assigned students:", error);
      alert("Error occurred while fetching assigned students");
    }
  };

  const handleAddStudent = async () => {
    fetchAllStudentData();
  };

  //Add student
  const handleAddStud = async (name, assignedTo) => {
    try {
      const response = await fetch("http://localhost:3000/api/students/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, assignedTo }),
      });
      if (response.status === 201) {
        alert("Student added successfully");
        fetchAssignedStudents();
      } else if (response.status === 409) {
        const data = await response.json();
        alert(`Already assigned to other mentor`);
      } else if (response.status === 404) {
        const data = await response.json();
        alert(`Student not found: ${data.message}`);
      } else if (response.status === 301) {
        const data = await response.json();
        alert(
          `Error: Mentor already has 4 students assigned......Cannot Assign more!`
        );
      } else {
        alert("An error occurred while adding the student");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the student");
    }
  };

  //Plus Button Functionality
  const handlePlusButtonClick = (studentName) => {
    handleAddStud(studentName, mentorName);
  };
  const refreshData = () => {
    fetchAssignedStudents();
  };

  //Delete Student
  const handleDeleteStudent = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/students/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentName: deleteInput,
            name: mentorName,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        // alert(data.message);
        fetchAssignedStudents();

        setDeleteInput(""); 
      } else {
        alert(data.error || "Error occurred while deleting student");
      }
      fetchAssignedStudents();
    } catch (error) {
      console.error("Error:", error);
      alert("Error occurred while deleting student");
    }
  };


  const oldStudent = () => {
    setOldStudentCheck(true);
    setNewStudentCheck(false); // Ensure newStudentCheck is false
  };
  const newStudent = () => {
    setNewStudentCheck(true);
    setOldStudentCheck(false); // Ensure oldStudentCheck is false
  };


  const updateIdeation = () => {
    if (!studentName || !ideationMarks || !executionMarks || !vivaPitchMarks) {
      setErrorMessage("All fields are required");
      return;
    }
    setErrorMessage("");
    fetch("http://localhost:3000/api/students/addMarks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentName,
        ideationMarks,
        executionMarks,
        vivaPitchMarks,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Marks updated successfully:", data);
        alert("Marks are added successfully!");
        setStudentName("");
        setIdeationMarks("");
        setExecutionMarks("");
        setvivaPitchMarks("");
        fetchAssignedStudents(); // Refresh the data
      })
      .catch((error) => {
        console.error("There was a problem updating ideation marks:", error);
        alert("Failed to update ideation marks. Please try again later.");
      });
  };

  //submit marks
  const submitStudentMarks = async (studentName) => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/students/submitMarks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studentName }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        fetchAssignedStudents();
        console.log("Marks submitted successfully:", data);
      } else {
        console.error("Error submitting marks:", data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error submitting marks:", error);
    }
  };
  const [isOpen, setIsOpen] = useState(false);
  const [evalBtn, setEvalBtn] = useState(false);

  const toggleEvalBtn = () => {
    fetchAssignedStudents();
    setEvalBtn(!evalBtn);
  };
  const toggleRedirectToAllStudents = () => {
    setRedirectToAllStudents(!redirectToAllStudents);
  };
  const startEval = () => {
    fetchAllStudentData();
    fetchAssignedStudents();
    setEvaluationStarted(!evaluationStarted);
  };
  const toggleModal = () => {
    fetchAllStudentData();
    fetchAssignedStudents();
    setIsOpen(!isOpen);
  };

  const targetRefOld = useRef(null);
  const targetRefNew = useRef(null);

  const handleScrollNew = () => {
    setTimeout(() => {
      targetRefNew.current.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };
  const handleScrollOld = () => {
    setTimeout(() => {
      targetRefOld.current.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  return (
    <div className="w-full min-h-screen bg-zinc-900" style={{ backgroundImage: `url("../../public/Images/Bg.png")` }}>
      <div class="text-6xl font-extrabold ... text-center pt-20">
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-500">
          Evaluation Dashboard: <span className="text-white">Hi Mentor!</span>
        </span>
      </div>

      <p className="text-white text-2xl text-center mt-4 mb-20">
        Welcome to online evaluation{" "}
        <TypeAnimation
          sequence={["Dashboard", 2000, "App", 2000, "Website", 2000]}
          speed={50}
          className="font-bold text-amber-500"
          wrapper="span"
          repeat={Infinity}
        />
      </p>

      <div
        className="bg-white w-full min-h-screen"
        style={{ backgroundImage: `url("../../public/Images/FrontBg.png")` }}>
        <div className="flex justify-center gap-x-6 ">
          <div className="mt-10">
            <br />
            <img
              className="w-24 h-25"
              src="../../public/Images/profile.png"
              alt="profiledummy"
            />
          </div>
          <div className="mt-35">
            <form onSubmit={handleSubmit}>
              <div className="mt-10 flex-col justify-center items-center">
                <label htmlFor="mentorname" className="block w-100 text-black text-xl text-center font-jost font-semibold pt-5">
                  Mentor Name
                </label>
                <div className="mt-2 flex items-center gap-x-6">
                  <div className="flex rounded-lg shadow-lg ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                    <input
                      type="text"
                      value={mentorName}
                      onChange={handleChange}
                      placeholder="Enter Mentor's name"
                      autoComplete="mentorname"
                      className="block flex-1 border-0 bg-transparent py-2.5 pl-3 text-indigo-300 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 "
                    >
                      Login
                    </button>
                  </div>
                  <br/>
                </div>
              </div>
            </form>
            
          </div>
        </div>
          <div>
                    <p className = "italic text-right mr-60">- (Enter any of these mentors: Kritika, Rupal, Tej, Ram)</p>
                  </div>
        {loginSuccess && redirectToEvaluation && studentData && (
          <div className="mt-16">
            <h2 class="text-black text-center font-jost font-bold text-4xl">
              Select Students for Evaluation
            </h2>
            <div
              className="border-2"
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                margin: "2% 20%",
              }}>
              <ul className="text-black" style={{ padding: "10px" }}>
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
                {studentData.map((student, index) => (
                  <div style={{ height: 50 }}>
                    <li key={index} style={{ alignItems: "center" }}>
                      <div>
                        <input
                          type="checkbox"
                          id={`student-${index}`}
                          value={student.name}
                          checked={selectedStudents.includes(student.name)}
                          onChange={() => handleCheckboxChange(student.name)}
                          className="mr-2"
                          style={{ height: 20, width: 20 }}/>
                        <label htmlFor={`student-${index}`}>
                          {student.name}
                        </label>
                        <hr style={{ marginTop: "10px" }} />
                      </div>
                    </li>
                  </div>
                ))}
              </ul>
            </div>
            <div className="flex justify-center mt-4">
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                onClick={() => {
                  handleAssignment();
                  setErrorMessage("");
                  refreshData();
                }}>
                Assign Students
              </button>
              <div>
                <p className = "italic mt-2 ml-2">
                  Cannot find Assigned Students? Please refresh!
                </p>
                </div>
            </div>

            <button
            onClick={toggleEvalBtn}
            className="transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            style= {{margin: "2% 25%"}}
          >
            Students and Evaluations
          </button>
          {evalBtn && (
            <div className="overlay">
              <div className="modal" style={{ width: "70%" }}>
                <div>
                  <div>
                    <select
                      value={filterOption}
                      onChange={(e) => {
                        setFilterOption(e.target.value);
                      }}
                      style={{
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #ccc",
                        padding: "8px",
                        fontSize: "14px",
                        color: "#333",
                        // float: "right",
                      }}
                    >
                      <option value="unevaluated">
                        Show unevaluated Students
                      </option>
                      <option value="evaluated">Show Evaluated Students</option>
                    </select>
                  </div>
                  <div>
                    {filterOption === "evaluated" && (
                      <div>
                        {assignedStudentData.filter(
                          (student) =>
                            student.ideation !== null &&
                            student.execution !== null &&
                            student.vivaPitch !== null

                        ).length === 0 ? (
                          <h3>No Student is Assigned Marks Yet!</h3>
                        ) : (
                      <div>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Ideation Marks</th>
                              <th>Execution Marks</th>
                              <th>VivaPitch Marks</th>
                              <th>Total Marks</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assignedStudentData.map(
                              (student) =>
                                student.ideation !== null &&
                                student.execution !== null &&
                                student.vivaPitch !== null && (
                                  <tr key={student._id}>
                                    <td>{student.name}</td>
                                    <td>{student.ideation}</td>
                                    <td>{student.execution}</td>
                                    <td>{student.vivaPitch}</td>
                                    <td>
                                      {student.ideation +
                                        student.execution +
                                        student.vivaPitch}
                                    </td>
                                    <td>
                                      {student.marksSubmitted !==
                                      "Submitted" ? (
                                        <button
                                          onClick={() => {
                                            if (
                                              window.confirm(
                                                "Once submitted, marks cannot be edited. Proceed?"
                                              )
                                            ) {
                                              submitStudentMarks(student.name);
                                            }
                                          }}
                                          className="btn-submit"
                                        >
                                          Submit Marks
                                        </button>
                                      ) : (
                                        <p>Marks Submitted</p>
                                      )}
                                    </td>
                                  </tr>
                                )
                            )}
                          </tbody>
                        </table>
                      </div>
                        )}
                      </div>
                    )}

                    {filterOption === "unevaluated" && (
                      <div>
                        {assignedStudentData.filter(
                          (student) =>
                            student.ideation === null &&
                            student.execution === null &&
                            student.vivaPitch === null

                        ).length === 0 ? (
                          <h3>No New Student to Evaluate</h3>
                        ) : (
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Ideation Marks</th>
                                <th>Execution Marks</th>
                                <th>VivaPitch Marks</th>
                                <th>Total Marks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {assignedStudentData.map(
                                (student) =>
                                  student.ideation === null &&
                                  student.execution === null &&
                                  student.vivaPitch === null && (
                                    <tr key={student._id}>
                                      <td>{student.name}</td>
                                      <td>{student.ideation}</td>
                                      <td>{student.execution}</td>
                                      <td>{student.vivaPitch}</td>
                                      <td>
                                        {student.ideation +
                                          student.execution +
                                          student.vivaPitch}
                                      </td>
                                    </tr>
                                  )
                              )}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center mt-4">
                  {/* Start Evaluation Button */}
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                    onClick={() => {
                      fetchAssignedStudents();
                      setErrorMessage("");
                      startEval();
                    }}
                    // disabled={evaluationStarted} // Disable the button if evaluation has already started
                  >
                    Start Evaluation
                  </button>
                </div>
                <div>
                  {evaluationStarted && (
                    <div>
                      <div>
                        <div className="flex justify-center mt-4">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded ml-3"
                            onClick={() => {
                              newStudent();
                            }}
                          >
                            Evaluate New Student?
                          </button>
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded ml-3"
                            onClick={oldStudent}
                          >
                            Edit Marks of Existing Student?
                          </button>
                        </div>

                        {newStudentCheck && (
                          <div className="max-w-md mx-auto p-4 bg-gray-100 rounded-lg shadow-md mt-4">
                            <div>
                              <select
                                id="studentName"
                                value={studentName}
                                onChange={(e) => {
                                  const selectedName = e.target.value;
                                  setStudentName(selectedName);
                                }}
                                className="block w-full mt-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select new student</option>
                                {assignedStudentData
                                  .filter(
                                    (student) =>
                                      student.ideation === null &&
                                      student.execution === null &&
                                      student.vivaPitch === null
                                  )
                                  .map((student) => (
                                    <option
                                      key={student.name}
                                      value={student.name}
                                    >
                                      {student.name}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div className="mt-4">
                              <label htmlFor="ideation" className="block">
                                Ideation Marks:
                              </label>
                              <input
                                type="number"
                                id="ideation"
                                value={ideationMarks}
                                onChange={(e) =>
                                  setIdeationMarks(e.target.value)
                                }
                                placeholder="Enter marks out of 10"
                                min={0}
                                max={10}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="mt-4">
                              <label htmlFor="execution" className="block">
                                Execution Marks:
                              </label>
                              <input
                                type="number"
                                id="execution"
                                value={executionMarks}
                                onChange={(e) =>
                                  setExecutionMarks(e.target.value)
                                }
                                placeholder="Enter marks out of 10"
                                min={0}
                                max={10}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="mt-4">
                              <label htmlFor="vivaPitch" className="block">
                                VivaPitch Marks:
                              </label>
                              <input
                                type="number"
                                id="vivaPitch"
                                value={vivaPitchMarks}
                                onChange={(e) =>
                                  setvivaPitchMarks(e.target.value)
                                }
                                placeholder="Enter marks out of 10"
                                min={0}
                                max={10}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errorMessage && (
                                <p style={{ color: "red" }} className="mt-1">
                                  {errorMessage}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={updateIdeation}
                              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md"
                              ref={targetRefNew}
                            >
                              Evaluate
                            </button>
                          </div>
                        )}
                        {oldStudentCheck && (
                          <div className="max-w-md mx-auto p-4 bg-gray-100 rounded-lg shadow-md mt-4">
                            <select
                              id="studentName"
                              value={studentName}
                              onChange={(e) => {
                                const selectedName = e.target.value;
                                setStudentName(selectedName);
                              }}
                              className="block w-full mt-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">
                                Select an existing student
                              </option>
                              {assignedStudentData
                                .filter(
                                  (student) =>
                                    student.ideation !== null &&
                                    student.execution !== null &&
                                    student.vivaPitch !== null &&
                                    student.marksSubmitted === ""
                                )
                                .map((student) => (
                                  <option
                                    key={student.name}
                                    value={student.name}
                                  >
                                    {student.name}
                                  </option>
                                ))}
                            </select>
                            <div className="mt-4">
                              <label htmlFor="ideation" className="block">
                                Ideation Marks:
                              </label>
                              <input
                                type="number"
                                id="ideation"
                                value={ideationMarks}
                                onChange={(e) =>
                                  setIdeationMarks(e.target.value)
                                }
                                placeholder="Enter marks out of 10"
                                min={0}
                                max={10}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="mt-4">
                              <label htmlFor="execution" className="block">
                                Execution Marks:
                              </label>
                              <input
                                type="number"
                                id="execution"
                                value={executionMarks}
                                onChange={(e) =>
                                  setExecutionMarks(e.target.value)
                                }
                                placeholder="Enter marks out of 10"
                                min={0}
                                max={10}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="mt-4">
                              <label htmlFor="vivaPitch" className="block">
                                VivaPitch Marks:
                              </label>
                              <input
                                type="number"
                                id="vivaPitch"
                                value={vivaPitchMarks}
                                onChange={(e) =>
                                  setvivaPitchMarks(e.target.value)
                                }
                                placeholder="Enter marks out of 10"
                                min={0}
                                max={10}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              />
                              {errorMessage && (
                                <p style={{ color: "red" }} className="mt-1">
                                  {errorMessage}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={updateIdeation}
                              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md"
                              ref={targetRefOld}
                            >
                              Evaluate
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <span className="close" onClick={toggleEvalBtn}>
                  &times;
                </span>
              </div>
            </div>
          )}
          <button
            className="transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 "
            onClick={toggleModal}
          >
            Edit Assigned Students
          </button>
          {isOpen && (
            <div className="overlay">
              <div className="modal" style={{ height: "60%" }}>
                <div>
                  <h1
                    className="text-bold font-2xl text-center"
                    style={{ fontWeight: "bold", fontSize: "24px" }}
                  >
                    You Can Edit Your Student List Here!
                  </h1>
                </div>
                <div className="flex-col justify-center gap-x-5">
                  <div className="flex justify-center mt-4 text-white gap-x-10">
                    

                    {editMode ? (
                      <div style={{ display: "flex" }}>
                      <div>
                        <div className="flex-col justify-center">
                          <div>
                            {assignedStudents.length < 4 && ( // Check if the length is less than 4
                              <button
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 mr-2 mb-2 h-6 rounded-full"
                                onClick={() => {
                                  handleAddStudent();
                                  // toggleRedirectToAllStudents();
                                }}
                              >
                                Add
                              </button>
                            )}
                            {redirectToAllStudents && (
                              <div className="m-4">
                                <h2
                                  style={{
                                    color: "black",
                                    fontWeight: "bold",
                                  }}
                                >
                                  All Students
                                </h2>
                                <div>
                                  <div
                                    className="scrollable-container"
                                    // style={{ border: "1px solid #000" }}
                                  >
                                    <ul className="student-list">
                                      {allStudentData
                                        .filter(
                                          (student) =>
                                            student.assignedTo === "NULL"
                                        )
                                        .map((student) => (
                                          <div>
                                            <li
                                              className="student-item"
                                              key={student.id}
                                            >
                                              {student.name}
                                              <button
                                                className="plus-button ml-4 mt-2"
                                                onClick={() =>
                                                  handlePlusButtonClick(
                                                    student.name
                                                  )
                                                }
                                              >
                                                Plus
                                              </button>
                                            </li>
                                            <hr></hr>
                                          </div>
                                        ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Delete Student"
                              value={deleteInput}
                              onChange={(e) => setDeleteInput(e.target.value)}
                              className="w-40 rounded-md h-9 border-2 bg-white transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 p-2 text-black"
                            />
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full w-15 ml-2"
                              onClick={() => {
                                alert(
                                  "This student will not be assigned to you anymore. Proceed?"
                                );
                                handleDeleteStudent();
                                // fetchAssignedStudents();
                              }}
                            >
                              Delete Student
                            </button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3
                          style={{ color: "black", fontWeight: "bold" }}
                          className="ml-4"
                        >
                          Assigned Students
                        </h3>
                        <ul style={{ listStyleType: "none", padding: 0 }}>
                          {assignedStudents &&
                            assignedStudentData.map((student) => (
                              <div className="ml-4">
                                <li
                                  key={student.id}
                                  style={{
                                    color: "black",
                                    // marginBottom: "8px",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    padding: "8px",
                                  }}
                                >
                                  {student.name}
                                </li>
                              </div>
                            ))}
                        </ul>
                      </div>
                    </div>
                    ) : (
                      <button
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded mr-2 h-9 "
                        onClick={() => {
                          handleEditClick();
                          setErrorMessage("");
                        }}
                        style={{ marginTop: "15%" }}
                      >
                        Edit Assigned Students
                      </button>
                    )}
                  </div>
                </div>
                <span className="close" onClick={toggleModal}>
                  &times;
                </span>
              </div>
            </div>
          )}

            
            
          </div>
        )}
      </div>


      <div>
        <footer className=" bg-gray-900 py-4 text-center text-white">
          <div>
            <p className="text-sm">
              © {new Date().getFullYear()} Made by Kritika
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default index;
