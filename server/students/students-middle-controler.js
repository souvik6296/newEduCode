import { chatWithGemini } from "./gemini-ai.js";
import { getDatabase, ref, set, push, update, remove, get, child } from "firebase/database";
import { initializeApp } from "firebase/app";
import CryptoJS from "crypto-js";
// Firebase configuration
const firebaseConfig = {
    databaseURL: "https://ai-projects-d261b-default-rtdb.firebaseio.com/"
};
const firebaseApp = initializeApp(firebaseConfig);

const db = getDatabase(firebaseApp);

//key for encryting every data
const secretKey1 = "3c6876390ecc3c010aa44fba1300dd67db632aff9bba01880213b8012419f9cd";
//key to encrypt secretkey1

const secretKey2 = "dd62cc4fd422cd179bc5501ed0f4c3b252af92bd01c340647fe8549fae5bb6ad";

async function sendKeytoBrowser(req, res) {
    const data = {
        s_key: secretKey1
    }

    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey2).toString();
    return res.status(200).json({ success: true, data: ciphertext });
}

async function verifyStudentSession(token, studentId) {
    const sref = ref(db, `EduCode/Students/${studentId}`);
    const validToken = await get(sref);
    if (validToken.exists() && validToken.val() == token) {
        return true;
    }
    if (!validToken.exists()) {
        console.error(`No token found for student ${studentId}`);
    }
    console.error(`Invalid token ${token}  && ${validToken.val()}`);
    return false;
}




// Middleware to handle Gemini chatbot requests
async function handleGeminiChat(req, res) {
    try {

        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const studentId = req.headers['studentid'];      // custom header
        const isValidSession = await verifyStudentSession(token, studentId);
        if (!isValidSession) {
            return res.status(401).json({ session_expired: true, success: false, message: "Invalid or expired session. Please log in again." });
        }

        const { query, sessionId, question_details } = req.body;
        if (!query) {
            return res.status(400).json({ success: false, message: "Missing query in request body" });
        }
        const result = await chatWithGemini(query, sessionId, question_details);
        if (result && result.error) {
            // If Gemini returned an error, show it in the response
            return res.status(500).json({ success: false, message: "Gemini error", error: result.error, response: result.response });
        }
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: "Unexpected error occurred", error: { message: error.message, stack: error.stack, raw: error } });
    }
}
import {
    insertStudent,
    getAllStudents,
    getStudentById,
    getStudentsByUniversityId,
    getStudentsByBatchId,
    updateStudent,
    deleteStudent,
    loginStudent,
    verifyStudent,
    getCourseMetadataByBatchId,
    getCourseforStudents,
    getQuestionforStudent,
    compileAndRun,
    submitandcompile,
    submitTest,
    getStudentProfile,
    updateStudentFields,
    getTestResultStatus,
    uploadStudentImage,
    resumeTest,
    saveMCQSubmission,
    checkTestSecurityCode,
    uploadStudentResource,
    autosave,
    getAllowedAttempts,
    updateAttemptCount,
    resetAllAttempts
} from "./student-database.js";
// Controller to check test security code
async function handleCheckTestSecurityCode(req, res) {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const studentId = req.headers['studentid'];      // custom header
        const isValidSession = await verifyStudentSession(token, studentId);
        if (!isValidSession) {
            return res.status(401).json({ session_expired: true, success: false, message: "Invalid or expired session. Please log in again." });
        }

        const { courseId, unitId, subUnitId, securityCode } = req.body;
        if (!courseId || !unitId || !subUnitId || !securityCode) {
            return res.status(400).json({ success: false, message: "Missing required fields: courseId, unitId, subUnitId, or securityCode" });
        }
        const result = await checkTestSecurityCode(courseId, unitId, subUnitId, securityCode);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle inserting a new student
async function handleInsertStudent(req, res) {
    try {

        const student = req.body; // Assuming the student data is sent in the request body
        const result = await insertStudent(student);
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleInsertStudent:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching all students
async function handleGetAllStudents(req, res) {
    try {


        const result = await getAllStudents();
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleGetAllStudents:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching a student by student ID
async function handleGetStudentById(req, res) {
    try {


        const { studentId } = req.params; // Assuming the student ID is sent as a URL parameter
        const result = await getStudentById(studentId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result); // Return 404 if the student is not found
        }
    } catch (error) {
        console.error("Error in handleGetStudentById:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching students by university ID
async function handleGetStudentsByUniversityId(req, res) {
    try {

        const { uniId } = req.params; // Assuming the university ID is sent as a URL parameter
        const result = await getStudentsByUniversityId(uniId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result); // Return 404 if no students are found
        }
    } catch (error) {
        console.error("Error in handleGetStudentsByUniversityId:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching students by batch ID
async function handleGetStudentsByBatchId(req, res) {
    try {

        const { batchId } = req.params; // Assuming the batch ID is sent as a URL parameter
        const result = await getStudentsByBatchId(batchId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result); // Return 404 if no students are found
        }
    } catch (error) {
        console.error("Error in handleGetStudentsByBatchId:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle updating a student
async function handleUpdateStudent(req, res) {
    try {

        const { studentId } = req.params; // Assuming the student ID is sent as a URL parameter
        const fieldsToUpdate = req.body; // Assuming the fields to update are sent in the request body
        const result = await updateStudent(studentId, fieldsToUpdate);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleUpdateStudent:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle deleting a student
async function handleDeleteStudent(req, res) {
    try {

        const { studentId } = req.params; // Assuming the student ID is sent as a URL parameter
        const result = await deleteStudent(studentId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleDeleteStudent:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle student login
async function handleStudentLogin(req, res) {
    try {
        const { userId, password } = req.body; // Assuming the user ID and password are sent in the request body
        const result = await loginStudent(userId, password);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(401).json(result); // Return 401 for invalid credentials
        }
    } catch (error) {
        console.error("Error in handleStudentLogin:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}


async function handleVerifyStudent(req, res) {
    try {

        // Assuming the token and student ID are sent in the request body
        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const studentId = req.headers['studentid'];      // custom header
        const result = await verifyStudent(token, studentId);
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(401).json(result);
        }
    } catch (error) {
        console.error("Error in handleVerifyStudent:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching course metadata by batch ID
async function handleGetCourseMetadataByBatchId(req, res) {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const sid = req.headers['studentid'];      // custom header
        const isValidSession = await verifyStudentSession(token, sid);
        if (!isValidSession) {
            return res.status(401).json({ session_expired: true, success: false, message: "Invalid or expired session. Please log in again." });
        }
        const { batchId } = req.params; // Assuming the batch ID is sent as a URL parameter
        const result = await getCourseMetadataByBatchId(batchId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result); // Return 404 if no metadata is found
        }
    } catch (error) {
        console.error("Error in handleGetCourseMetadataByBatchId:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching a course by course ID
async function handleGetCourseforStudents(req, res) {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const sid = req.headers['studentid'];      // custom header
        const isValidSession = await verifyStudentSession(token, sid);
        if (!isValidSession) {
            return res.status(401).json({ session_expired: true, success: false, message: "Invalid or expired session. Please log in again." });
        }
        const { courseId, studentId } = req.body; // Expecting courseId and studentId as URL parameters
        const result = await getCourseforStudents(courseId, studentId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result); // Return 404 if the course is not found
        }
    } catch (error) {
        console.error("Error in handleGetCourseforStudents:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}



// Controller to handle fetching questions for a student
async function handleGetQuestionforStudent(req, res) {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const sid = req.headers['studentid'];      // custom header
        const isValidSession = await verifyStudentSession(token, sid);
        if (!isValidSession) {
            return res.status(401).json({ session_expired: true, success: false, message: "Invalid or expired session. Please log in again." });
        }
        const { courseId, unitId, subUnitId, studentId, questionType } = req.body; // Extract parameters from the request body

        // Validate required parameters
        if (!courseId || !unitId || !subUnitId || !studentId || !questionType) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: courseId, unitId, subUnitId, studentId, or questionType"
            });
        }

        const result = await getQuestionforStudent(courseId, unitId, subUnitId, studentId, questionType);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result); // Return 404 if no questions are found
        }
    } catch (error) {
        console.error("Error in handleGetQuestionforStudent:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle compiling and running code
async function handleCompileAndRun(req, res) {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const sid = req.headers['studentid'];      // custom header
        const isValidSession = await verifyStudentSession(token, sid);
        if (!isValidSession) {
            return res.status(401).json({ session_expired: true, success: false, message: "Invalid or expired session. Please log in again." });
        }
        const { userWrittenCode, languageId, sampleInputOutput, courseId, unitId, subUnitId, questionId, studentId, attempt } = req.body;

        // Validate required parameters
        if (!userWrittenCode || !languageId || !sampleInputOutput || !courseId || !unitId || !subUnitId || !questionId || !studentId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: userWrittenCode, languageId, sampleInputOutput, courseId, unitId, subUnitId, questionId, or studentId"
            });
        }

        // Call the compileAndRun function
        const result = await compileAndRun(userWrittenCode, languageId, sampleInputOutput, courseId, unitId, subUnitId, questionId, studentId, attempt);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result); // Return 400 for errors during compilation or execution
        }
    } catch (error) {
        console.error("Error in handleCompileAndRun:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle submitting and compiling code
async function handleSubmitAndCompile(req, res) {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const sid = req.headers['studentid'];      // custom header
        const isValidSession = await verifyStudentSession(token, sid);
        if (!isValidSession) {
            return res.status(401).json({ session_expired: true, success: false, message: "Invalid or expired session. Please log in again." });
        }
        const { userWrittenCode, languageId, courseId, unitId, subUnitId, questionId, studentId, attempt } = req.body;

        // Validate required parameters
        if (!userWrittenCode || !languageId || !courseId || !unitId || !subUnitId || !questionId || !studentId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: userWrittenCode, languageId, courseId, unitId, subUnitId, questionId, or studentId"
            });
        }

        // Call the submitandcompile function
        const result = await submitandcompile(userWrittenCode, languageId, courseId, unitId, subUnitId, questionId, studentId, attempt);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result); // Return 400 for errors during submission or compilation
        }
    } catch (error) {
        console.error("Error in handleSubmitAndCompile:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle submitting test and updating resume
async function handleSubmitTest(req, res) {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const sid = req.headers['studentid'];      // custom header
        const isValidSession = await verifyStudentSession(token, sid);
        if (!isValidSession) {
            return res.status(401).json({ session_expired: true, success: false, message: "Invalid or expired session. Please log in again." });
        }
        const details = req.body;
        // Validate required fields
        const requiredFields = [
            "university_id", "student_id", "course_id", "unit_id", "sub_unit_id", "questions", "result_type", "submitted_at"
        ];
        for (const field of requiredFields) {
            if (!details[field]) {
                return res.status(400).json({ success: false, message: `Missing required field: ${field}` });
            }
        }
        if (!details.score) {
            details.score = 0; // Default score if not provided
        }
        const result = await submitTest(details);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching student profile by student_id
async function handleGetStudentProfile(req, res) {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const sid = req.headers['studentid'];      // custom header
        const isValidSession = await verifyStudentSession(token, sid);
        if (!isValidSession) {
            return res.status(401).json({ session_expired: true, success: false, message: "Invalid or expired session. Please log in again." });
        }
        const { studentId } = req.query;
        if (!studentId) {
            return res.status(400).json({ success: false, message: "Missing required parameter: studentId" });
        }
        const result = await getStudentProfile(studentId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle updating any number of fields for a student
async function handleUpdateStudentFields(req, res) {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const sid = req.headers['studentid'];      // custom header
        const isValidSession = await verifyStudentSession(token, sid);
        if (!isValidSession) {
            return res.status(401).json({ session_expired: true, success: false, message: "Invalid or expired session. Please log in again." });
        }
        const { studentId } = req.params;
        const fieldsToUpdate = req.body;
        if (!studentId || !fieldsToUpdate || Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ success: false, message: "Missing studentId or fields to update" });
        }
        const result = await updateStudentFields(studentId, fieldsToUpdate);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching test result status and summary
async function handleGetTestResultStatus(req, res) {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const sid = req.headers['studentid'];      // custom header
        const isValidSession = await verifyStudentSession(token, sid);
        if (!isValidSession) {
            return res.status(401).json({ session_expired: true, success: false, message: "Invalid or expired session. Please log in again." });
        }
        const { university_id, student_id, course_id, unit_id, sub_unit_id, result_type } = req.body;
        // Validate required fields
        const requiredFields = [
            "university_id", "student_id", "course_id", "unit_id", "sub_unit_id", "result_type"
        ];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ success: false, message: `Missing required field: ${field}` });
            }
        }
        // Call the database function to fetch the result
        const result = await getTestResultStatus({ university_id, student_id, course_id, unit_id, sub_unit_id, result_type });
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle image upload for student and return download URL
async function handleUploadStudentImage(req, res) {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const sid = req.headers['studentid'];      // custom header
        const isValidSession = await verifyStudentSession(token, sid);
        if (!isValidSession) {
            return res.status(401).json({ session_expired: true, success: false, message: "Invalid or expired session. Please log in again." });
        }
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ success: false, message: "No image file uploaded" });
        }
        const filename = req.file.originalname || `student_${Date.now()}`;
        const result = await uploadStudentImage(req.file.buffer, filename);
        if (result.success) {
            res.status(200).json({ success: true, url: result.url });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}



// Controller to handle resource upload for student and return download URL
async function handleUploadStudentResource(req, res) {
    try {

        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ success: false, message: "No resource file uploaded" });
        }
        const filename = req.file.originalname || `student_${Date.now()}`;
        const fileType = req.body.fileType; // Expecting fileType to be sent in the request body
        const result = await uploadStudentResource(req.file.buffer, filename, fileType);
        if (result.success) {
            res.status(200).json({ success: true, url: result.url });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}


// Controller to handle resuming a test and saving last submissions
async function handleResumeTest(req, res) {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const sid = req.headers['studentid'];      // custom header
        const isValidSession = await verifyStudentSession(token, sid);
        if (!isValidSession) {
            return res.status(401).json({ session_expired: true, success: false, message: "Invalid or expired session. Please log in again." });
        }
        const { student_id, course_id, unit_id, sub_unit_id, questions, question_type, attempt } = req.body;
        // Validate required fields
        if (!student_id || !course_id || !unit_id || !sub_unit_id || !Array.isArray(questions) || !question_type) {
            return res.status(400).json({ success: false, message: "Missing required fields: student_id, course_id, unit_id, sub_unit_id, questions (array), or question_type" });
        }
        const result = await resumeTest({ student_id, course_id, unit_id, sub_unit_id, questions, question_type, attempt });
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}
// Controller to handle resuming a test and saving last submissions
async function handleAutoSave(req, res) {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const sid = req.headers['studentid'];      // custom header
        const isValidSession = await verifyStudentSession(token, sid);
        if (!isValidSession) {
            return res.status(401).json({ session_expired: true, success: false, message: "Invalid or expired session. Please log in again." });
        }
        const { code, studentId, courseId, unitId, subUnitId, questionId, attempt, type } = req.body;
        // return res.status(200).json({success: true, code});
        // Validate required fields
        if (!studentId || !courseId || !unitId || !subUnitId || !questionId || !attempt || !type) {
            return res.status(400).json({ success: false, message: "Missing required fields: student_id, course_id, unit_id, sub_unit_id, questions (array), or question_type" });
        }
        const result = await autosave({ code, studentId, courseId, unitId, subUnitId, questionId, attempt, type });
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}


// Controller to handle resuming a test and saving last submissions
async function handleSaveMCQSubmission(req, res) {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const sid = req.headers['studentid'];      // custom header
        const isValidSession = await verifyStudentSession(token, sid);
        if (!isValidSession) {
            return res.status(401).json({ session_expired: true, success: false, message: "Invalid or expired session. Please log in again." });
        }
        const { student_id, course_id, unit_id, sub_unit_id, questions, question_type, attempt } = req.body;
        // Validate required fields
        if (!student_id || !course_id || !unit_id || !sub_unit_id || !Array.isArray(questions) || !question_type) {
            return res.status(400).json({ success: false, message: "Missing required fields: student_id, course_id, unit_id, sub_unit_id, questions (array), or question_type" });
        }
        const result = await saveMCQSubmission({ student_id, course_id, unit_id, sub_unit_id, questions, question_type, attempt });
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching allowed attempts for a student
async function handleGetAllowedAttempts(req, res) {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Bearer token
        const studentId0 = req.headers['studentid'];      // custom header
        const isValidSession = await verifyStudentSession(token, studentId0);
        if (!isValidSession) {
            return res.status(401).json({ session_expired: true, success: false, message: "Invalid or expired session. Please log in again." });
        }

        const {studentId, regId, type} = req.body;
        if (!regId || !type || !studentId) {
            return res.status(400).json({ success: false, message: "Missing required fields: regId, type, or studentId" });
        }

        const result = await getAllowedAttempts(studentId, regId, type);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result); // Return 404 if no data is found
        }
    } catch (error) {
        console.error("Error in handleGetAllowedAttempts:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle updating attempt count
async function handleUpdateAttemptCount(req, res) {
    try {
        const { regId, type, updatedCount } = req.body;
        if (!regId || !type || updatedCount === undefined) {
            return res.status(400).json({ success: false, message: "Missing required fields: regId, type, or updatedCount" });
        }

        const result = await updateAttemptCount(regId, type, updatedCount);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleUpdateAttemptCount:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle resetting all attempts
async function handleResetAllAttempts(req, res) {
    try {

        const result = await resetAllAttempts();
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleResetAllAttempts:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Export all controllers
export {
    sendKeytoBrowser,
    handleInsertStudent,
    handleGetAllStudents,
    handleGetStudentById,
    handleGetStudentsByUniversityId,
    handleGetStudentsByBatchId,
    handleUpdateStudent,
    handleDeleteStudent,
    handleGetCourseMetadataByBatchId,
    handleStudentLogin,
    handleVerifyStudent,
    handleGetCourseforStudents,
    handleGetQuestionforStudent,
    handleCompileAndRun,
    handleSubmitAndCompile,
    handleSubmitTest,
    handleGetStudentProfile,
    handleUpdateStudentFields,
    handleGetTestResultStatus,
    handleUploadStudentImage,
    handleResumeTest,
    handleCheckTestSecurityCode,
    handleGeminiChat,
    handleUploadStudentResource,
    handleSaveMCQSubmission,
    handleAutoSave,
    handleGetAllowedAttempts,
    handleUpdateAttemptCount,
    handleResetAllAttempts
};