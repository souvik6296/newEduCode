// Import required modules
const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const { AccessToken, EgressClient, EncodedFileOutput, DirectFileOutput } = require('livekit-server-sdk');

const LIVEKIT_URL = "wss://educode-190pkw3r.livekit.cloud";
const LIVEKIT_API_KEY = "API24izSzNSuaNf";
const LIVEKIT_API_SECRET = "uaLxHpEB5ivWwTGc9tf0t0klYzjbszqt2HMLV3aEG3S";
// const roomToStudentList = {};
const allowedStudentCache = require("./allowedStudentCache.js");

const egressClient = new EgressClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: "ap-southeast-1",
    credentials: {
        accessKeyId: "8FJTMT9D7XWGDTW9SA0D",
        secretAccessKey: "AmRqRjbDMzVfdf5goRCYBjLtChNhYDBziYOzpl4R"
    },
    endpoint: "https://s3.ap-southeast-1.wasabisys.com",
    forcePathStyle: true
});

const createToken = async (teacherId, studentList) => {
    // If this room doesn't exist, it'll be automatically created when the first
    // participant joins
    const roomName = `room${teacherId}`;
    // Identifier to be used for participant.
    // It's available as LocalParticipant.identity with livekit-client SDK
    const participantName = `teacher${teacherId}`;

    const at = new AccessToken("devkey", "secret", {
        identity: participantName,
        // Token to expire after 10 minutes
        ttl: '10m',
    });
    at.addGrant({ roomJoin: true, room: roomName });
    const roomToStudentList = allowedStudentCache[`roomToStudentList`] || {};

    roomToStudentList[roomName] = studentList;
    allowedStudentCache[`roomToStudentList`] = roomToStudentList;

    return await at.toJwt();
};

const getToken = async (ID) => {



    // return await createToken(roomName, [ID]);
    const participantName = `${ID}`;
    // const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    const at = new AccessToken("devkey", "secret", {
        identity: participantName,
        // Token to expire after 10 minutes
        ttl: '10m',
    });
    at.addGrant({ roomJoin: true, room: "room123456" });
    const data1 = {
        token: await at.toJwt(),
        success: true
    }
    return data1;



    // Iterate over every key of roomToStudentList and check for every list if the studentId is there join the student in that room
    const roomToStudentList = allowedStudentCache[`roomToStudentList`] || {};
    for (const [roomName, studentList] of Object.entries(roomToStudentList)) {
        if (studentList.includes(ID)) {
            // return await createToken(roomName, [ID]);
            const participantName = `${ID}`;
            const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
                identity: participantName,
                // Token to expire after 10 minutes
                ttl: '10m',
            });
            at.addGrant({ roomJoin: true, room: roomName });
            const data = {
                token: await at.toJwt(),
                success: true
            }
            return data;
        }
    }
    const data = {
        msg: "Teacher not joined yet please wait...",
        success: false
    }

    return data;
};


// Configure Multer
// const uploadMiddleware = multer({ dest: "uploads/" }); // Files will be stored in the 'uploads' folder
const uploadMiddleware = multer({ storage: multer.memoryStorage() });

// Import controllers for universities
const {
    handleGetAllUniversities,
    handleInsertUniversity,
    handleUpdateUniversity,
    handleDeleteUniversity,
    handleGetUniversityByUid,
    handleUniversityLogin,
    handleUploadStudentsExcel
} = require("./university/university-middle-controler.js");

// Import controllers for batches
const {
    handleAddBatch,
    handleGetAllBatches,
    handleGetBatchesByUniversityId,
    handleGetBatchById,
    handleUpdateBatch,
    handleDeleteBatch,
} = require("./batches/batches-middle-controler.js");

// Import controllers for students
const {
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
    handleAutoSave
} = require("./students/students-middle-controler.js");


// Import controllers for courses
const {
    handleInsertCourseMetadata,
    handleGetAllCoursesMetadata,
    handleGetCourseByIdMetadata,
    handleUpdateCourseMetadata,
    handleDeleteCourseMetadata,
    handleGetCoursesByBatchId,
} = require("./courses/course-middle-controler.js");


// Import controllers for units and questions
const {
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
} = require("./units and questions/units-and-questions-middle-controler.js");



const app = express();
const PORT = 3000;

// Middleware Section
// --------------------------------------------------------------------------------
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

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
// app.get("/students/test-result-status", handleGetTestResultStatus); // Get test result status
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


app.get('/getToken', async (req, res) => {
    const data = await getToken(req.query.ID);
    if (!data.success) {
        return res.status(400).send(data);
    } else if (data.success) {
        return res.status(200).send(data);
    }
});

app.post('/createToken', async (req, res) => {
    const token = await createToken(req.body.ID, req.body.studentList);
    res.status(200).send({ token });
});

app.get("/teachers/getStudentList/:teacherId", async (req, res) => {
    const { teacherId } = req.params;
    const data = { studentList: ["UNI001", "UNI002", "UNI005", "12345678", "12345679", "12345680", "12345681", "12345682", "12345690", "12345691", "12345692", "12345693", "12345694"] };
    if (!data.success) {
        return res.status(400).send(data);
    } else if (data.success) {
        return res.status(200).send(data);
    }
});

// Function to get a unique filename
async function getUniqueFilename(bucket, baseKey) {
    let key = baseKey;
    let counter = 0;

    while (true) {
        try {
            // Try checking if file already exists
            await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
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


app.post("/startRecording", async (req, res) => {
    const { roomName, participantId, studentName } = req.body;
    const today = new Date();

    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const yyyy = today.getFullYear();

    const formattedDate = `${dd}-${mm}-${yyyy}`;

    const bucket = "studentrecording";
    const baseKey = `recordings/${formattedDate}/${roomName.replace('room', '')}/${studentName}/${studentName}.webm`;
    const uniqueKey = await getUniqueFilename(bucket, baseKey);

    const output = new DirectFileOutput({
        filepath: uniqueKey,
        output: {

            case: 's3',
            value: {
                accessKey: "8FJTMT9D7XWGDTW9SA0D",
                secret: "AmRqRjbDMzVfdf5goRCYBjLtChNhYDBziYOzpl4R",
                region: "ap-southeast-1",
                endpoint: "https://s3.ap-southeast-1.wasabisys.com", // region-specific
                bucket: "studentrecording",
                forcePathStyle: true
            }
        }

    });



    try {
        const egressInfo = await egressClient.startTrackEgress(roomName, output, participantId);

        res.send(egressInfo);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.post("/stopRecording", async (req, res) => {
    const { egressId } = req.body;
    try {
        await egressClient.stopEgress(egressId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/getegress/:egressId", async (req, res) => {
    const { egressId } = req.params;
    try {
        const egressList = await egressClient.listEgress();
        const egressInfo = egressList.find(e => e.egressId === egressId);
        res.json(egressInfo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get("/getKey", sendKeytoBrowser);



// Start the Server
// --------------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});