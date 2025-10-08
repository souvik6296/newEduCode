// Import required modules
import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { AccessToken, EgressClient, EncodedFileOutput, DirectFileOutput } from 'livekit-server-sdk';

const LIVEKIT_URL = "wss://livekit.theeducode.com";
const LIVEKIT_API_KEY = "APIdZvcW3DrSKxq";
const LIVEKIT_API_SECRET = "5NMPqZztCfC13uiMM7H3frwx6Wy2LqpydehFR8ThLpBA";
// const roomToStudentList = {};
import allowedStudentCache from "./allowedStudentCache.js";

const egressClient = new EgressClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
import { HeadObjectCommand } from '@aws-sdk/client-s3';

import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  // ListPartsCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto"; // Add this line


const region = "eu-central-003"; // example
const endpoint = "https://s3.eu-central-003.backblazeb2.com"; // Backblaze S3 endpoint
const bucket = "StudentsRecording"; // Your bucket name
const s3 = new S3Client({
  region,
  endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: "00381c56cbd3f2a0000000001",
    secretAccessKey: "K003JQ+WWk0A72QEfITG0aEaMSktL+o",
  },
});



// Configure Multer
// const uploadMiddleware = multer({ dest: "uploads/" }); // Files will be stored in the 'uploads' folder
const uploadMiddleware = multer({ storage: multer.memoryStorage() });

// Import controllers for universities
import {
  handleGetAllUniversities,
  handleInsertUniversity,
  handleUpdateUniversity,
  handleDeleteUniversity,
  handleGetUniversityByUid,
  handleUniversityLogin,
  handleUploadStudentsExcel
} from "./university/university-middle-controler.js";

// Import controllers for batches
import {
  handleAddBatch,
  handleGetAllBatches,
  handleGetBatchesByUniversityId,
  handleGetBatchById,
  handleUpdateBatch,
  handleDeleteBatch,
} from "./batches/batches-middle-controler.js";

// Import controllers for students
import {
  handleInsertStudent,
  handleGetAllStudents,
  handleGetStudentById,
  handleGetStudentsByUniversityId,
  handleGetStudentsByBatchId,
  handleUpdateStudent,
  handleDeleteStudent,
  handleStudentLogin,
  handleGetCourseMetadataByBatchId,
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
  handleVerifyStudent,
  sendKeytoBrowser,
  handleAutoSave,
  handleGetAllowedAttempts,
  handleUpdateAttemptCount,
  handleResetAllAttempts
} from "./students/students-middle-controler.js";


// Import controllers for courses
import {
  handleInsertCourseMetadata,
  handleGetAllCoursesMetadata,
  handleGetCourseByIdMetadata,
  handleUpdateCourseMetadata,
  handleDeleteCourseMetadata,
  handleGetCoursesByBatchId,
} from "./courses/course-middle-controler.js";


// Import controllers for units and questions
import {
  handleAddCourse,
  handleGetCourse,
  handleUpdateCourse,
  handleDeleteCourse,
  handleAddUnit,
  handleGetUnits,
  handleUpdateUnit,
  handleDeleteUnit,
  handleAddSubUnit,
  handleGetSubUnits,
  handleUpdateSubUnit,
  handleDeleteSubUnit,
} from "./units and questions/units-and-questions-middle-controler.js";

// Import controllers for teachers
import {
  handleCreateTeacher,
  handleGetTeacherProfile,
  handleUpdateTeacher,
  handleDeleteTeacher,
  handleTeacherLogin,
  handleGetTeacherByEmail,
  handleCreateToken,
  handleGetToken,
  handleGetStudentList
} from "./teachers/teacher-middle-controler.js";

const app = express();
const PORT = 3000;

// Middleware Section
// --------------------------------------------------------------------------------
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies

// Serve static files from the current directory
// Create __dirname equivalent for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// app.use(express.static(path.join(__dirname)));

// Routes for Universities
// --------------------------------------------------------------------------------
app.get("/universities", handleGetAllUniversities); // Fetch all universities
app.get("/universities/:uid", handleGetUniversityByUid); // Fetch a university by UID
app.post("/universities", handleInsertUniversity); // Insert a new university
app.put("/universities/:uid", handleUpdateUniversity); // Update a university by UID
app.delete("/universities/:uid", handleDeleteUniversity); // Delete a university by UID
app.post("/universities/login", handleUniversityLogin); // University login
app.post("/universities/upload-students", uploadMiddleware.single("file"), handleUploadStudentsExcel); //

// Routes for Batches
// --------------------------------------------------------------------------------
app.post("/batches", handleAddBatch); // Add a new batch
app.get("/batches", handleGetAllBatches); // Fetch all batches
app.get("/batches/university/:universityId", handleGetBatchesByUniversityId); // Fetch batches by university ID
app.get("/batches/:batchId", handleGetBatchById); // Fetch a batch by batch ID
app.put("/batches/:batchId", handleUpdateBatch); // Update a batch by batch ID
app.delete("/batches/:batchId", handleDeleteBatch); // Delete a batch by batch ID

// Routes for Students
// --------------------------------------------------------------------------------
app.post("/students", handleInsertStudent); // Add a new student
app.get("/students", handleGetAllStudents); // Fetch all students
app.post("/students/code/autosave", handleAutoSave);
app.get("/students/:studentId", handleGetStudentById); // Fetch a student by ID
app.get("/students/university/:uniId", handleGetStudentsByUniversityId); // Fetch students by university ID
app.get("/students/batch/:batchId", handleGetStudentsByBatchId); // Fetch students by batch ID
app.put("/students/:studentId", handleUpdateStudent); // Update a student by ID
app.delete("/students/:studentId", handleDeleteStudent); // Delete a student by ID
app.post("/students/login", handleStudentLogin); // Student login
app.get("/students/course-metadata/batch/:batchId", handleGetCourseMetadataByBatchId); // Fetch course metadata by batch ID
app.post("/students/course", handleGetCourseforStudents); // Fetch a course by course ID for students
app.post("/students/questions", handleGetQuestionforStudent); // Fetch questions for a student
app.post("/students/compile-and-run", handleCompileAndRun); // Compile and run code
app.post("/students/submit-and-compile", handleSubmitAndCompile); // Submit and compile code
app.post("/students/submit-test", handleSubmitTest); // Submit test and update resume
app.get("/students/profile/getProfile", handleGetStudentProfile); // Get student profile by studentId
app.put("/students/update-fields/:studentId", handleUpdateStudentFields); // Update any number of student fields
app.post("/students/test-result-status", handleGetTestResultStatus); // Get test result status and summary by unique fields
app.post("/students/upload-image", uploadMiddleware.single("image"), handleUploadStudentImage); // Upload student image and get download URL
app.post("/students/resume-test", handleResumeTest); // Resume test and save last submissions
app.post("/students/save-mcq-submission", handleSaveMCQSubmission); // Save MCQ submission
app.get("/verify/students/verify-session", handleVerifyStudent); // Verify student session
// Gemini AI Chatbot endpoint
app.post("/students/gemini-chat", handleGeminiChat); // Chat with Gemini AI

// Route to check test security code
app.post("/students/check-test-security", handleCheckTestSecurityCode); // Check test security code
app.post("/students/upload-student-resource", uploadMiddleware.single("resource"), handleUploadStudentResource); // Upload student resource file
// Routes for handling allowed attempts
app.post("/students/allowed-attempts", handleGetAllowedAttempts); // Fetch allowed attempts for a student
// Routes for updating attempt count
app.put("/admin/update-attempt-count", handleUpdateAttemptCount); // Update attempt count
// Routes for resetting all attempts
app.post("/admin/reset-all-attempts", handleResetAllAttempts); // Reset all attempts


// Routes for Courses
// --------------------------------------------------------------------------------
app.post("/coursesmetadata", handleInsertCourseMetadata); // Add a new course
app.get("/coursesmetadata", handleGetAllCoursesMetadata); // Fetch all courses
app.get("/coursesmetadata/:courseId", handleGetCourseByIdMetadata); // Fetch a course by ID
app.put("/coursesmetadata/:courseId", handleUpdateCourseMetadata); // Update a course by ID
app.delete("/coursesmetadata/:courseId", handleDeleteCourseMetadata); // Delete a course by ID
app.get("/coursesmetadata/batch/:batchId", handleGetCoursesByBatchId); // Fetch courses by batch ID



// Routes for units and questions
// --------------------------------------------------------------------------------
// Course-level operations
app.post("/courses", handleAddCourse); // Add a new course
app.get("/courses/:courseId", handleGetCourse); // Fetch a course by ID
app.put("/courses/:courseId", handleUpdateCourse); // Update a course by ID
app.delete("/courses/:courseId", handleDeleteCourse); // Delete a course by ID

// Unit-level operations
app.post("/courses/:courseId/units", handleAddUnit); // Add a new unit to a course
app.get("/courses/:courseId/units", handleGetUnits); // Fetch all units of a course
app.put("/courses/:courseId/units/:unitId", handleUpdateUnit); // Update a unit by ID
app.delete("/courses/:courseId/units/:unitId", handleDeleteUnit); // Delete a unit by ID

// Sub-unit-level operations
app.post("/courses/:courseId/units/:unitId/sub-units", handleAddSubUnit); // Add a new sub-unit to a unit
app.get("/courses/:courseId/units/:unitId/sub-units", handleGetSubUnits); // Fetch all sub-units of a unit
app.put("/courses/:courseId/units/:unitId/sub-units/:subUnitId", handleUpdateSubUnit); // Update a sub-unit by ID
app.delete("/courses/:courseId/units/:unitId/sub-units/:subUnitId", handleDeleteSubUnit); // Delete a sub-unit by ID

// Routes for Teachers
// --------------------------------------------------------------------------------
app.post("/teachers", handleCreateTeacher); // Create a new teacher
app.get("/teachers/:teacherId", handleGetTeacherProfile); // Get teacher profile by ID
app.put("/teachers/:teacherId", handleUpdateTeacher); // Update teacher by ID
app.delete("/teachers/:teacherId", handleDeleteTeacher); // Delete teacher by ID
app.post("/teachers/login", handleTeacherLogin); // Teacher login
app.get("/teachers/email/:email", handleGetTeacherByEmail); // Get teacher by email
app.get('/getToken', handleGetToken);
app.post('/createToken', handleCreateToken);
app.get("/teachers/getStudentList/:teacherId", handleGetStudentList);

// Function to get a unique filename
async function getUniqueFilename(bucket, baseKey) {
  let key = baseKey;
  let counter = 0;

  while (true) {
    try {
      // Try checking if file already exists
      await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      // If exists, increment counter
      const ext = baseKey.substring(baseKey.lastIndexOf('.'));
      const nameWithoutExt = baseKey.substring(0, baseKey.lastIndexOf('.'));
      key = `${nameWithoutExt}__${counter}${ext}`;
      counter++;
    } catch (err) {
      if (err.name === "NotFound") {
        // File does not exist, we can use this key
        return key;
      } else {
        throw err;
      }
    }
  }
}





// POST /api/uploads/initiate

app.post("/api/uploads/initiate", async (req, res) => {
  const { studentRegId, contentType, liveRead, roomName } = req.body || {};
  const today = new Date();

  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const yyyy = today.getFullYear();

  const formattedDate = `${dd}-${mm}-${yyyy}`;

  const bucket = "studentsrecording";
  const baseKey = `recordings/${formattedDate}/${roomName.replace('room', '')}/${studentRegId}/${studentRegId}.webm`;
  const uniqueKey = await getUniqueFilename(bucket, baseKey);
  // const filename = `${prefix || "recordings"}/${Date.now()}-${crypto.randomUUID()}.webm`;
  const filename = uniqueKey;
  const cmd = new CreateMultipartUploadCommand({
    Bucket: bucket,
    Key: filename,
    ContentType: contentType || "video/webm",
    // Optional Live Read (Backblaze extension)
    Metadata: liveRead ? { "x-backblaze-live-read-enabled": "true" } : undefined,
  });
  const out = await s3.send(cmd);
  res.json({ key: filename, uploadId: out.UploadId, partSize: 10 * 1024 * 1024 }); // suggest >= 5MB
});

// POST /api/uploads/presign
app.post("/api/uploads/presign", async (req, res) => {
  const { key, uploadId, parts } = req.body; // parts: number[] of PartNumber(s)
  const urls = await Promise.all(
    parts.map(async (PartNumber) => {
      const url = await getSignedUrl(
        s3,
        new UploadPartCommand({ Bucket: bucket, Key: key, UploadId: uploadId, PartNumber }),
        { expiresIn: 15 * 60 }
      );
      return { PartNumber, url };
    })
  );
  res.json({ urls });
});

// // GET /api/uploads/parts
// app.get("/api/uploads/parts", async (req, res) => {
//   const { key, uploadId, partNumberMarker } = req.query;
//   const out = await s3.send(
//     new ListPartsCommand({ Bucket: bucket, Key: key, UploadId: uploadId, PartNumberMarker: partNumberMarker })
//   );
//   res.json(out);
// });

// POST /api/uploads/complete
app.post("/api/uploads/complete", async (req, res) => {
  const { key, uploadId, parts } = req.body; // [{ETag, PartNumber}]
  const out = await s3.send(
    new CompleteMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId, MultipartUpload: { Parts: parts } })
  );
  res.json(out);
});

// DELETE /api/uploads/abort
app.delete("/api/uploads/abort", async (req, res) => {
  const { key, uploadId } = req.body;
  await s3.send(new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId }));
  res.json({ ok: true });
});

app.get("/getKey", sendKeytoBrowser);


// Start the Server
// --------------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

