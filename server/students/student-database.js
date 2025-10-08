import supabaseClient from "../supabase-client.js";
import { getDatabase, ref, set, push, update, remove, get, child } from "firebase/database";
// import app from "../firebase-config.js";
import { initializeApp } from "firebase/app";
import baseUrl from "../j0baseUrl.js";
import compilerCache from "../compilerCache.js";
import hiddenTestCasesCache from "../hiddenTestCasesCache.js";
import jwt from "jsonwebtoken";
import CryptoJS from 'crypto-js';
//key for encryting every data
const secretKey1 = "3c6876390ecc3c010aa44fba1300dd67db632aff9bba01880213b8012419f9cd";

async function encryptData(data) {

    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey1).toString();
    return ciphertext;
}

async function verifyStudentSession(token, studentId) {
    const sref = ref(db, `EduCode/Students/${studentId}`);
    const validToken = await get(sref);
    if (validToken.exists() && validToken.val() == token) {
        return true;
    }
    console.error(`Invalid token ${token}  && ${validToken}`);
    return false;
}





// Firebase configuration
const firebaseConfig = {
    databaseURL: "https://ai-projects-d261b-default-rtdb.firebaseio.com/"
};
const firebaseApp = initializeApp(firebaseConfig);

const db = getDatabase(firebaseApp);

// Function to insert a new student
async function insertStudent(student) {
    try {
        const { data, error } = await supabaseClient
            .from("students")
            .insert([student]);

        if (error) {
            console.error("Error inserting student:", error);
            return { success: false, message: "Failed to insert student", error };
        }

        console.log("Student inserted successfully:", data);
        return { success: true, message: "Student inserted successfully", data };
    } catch (err) {
        console.error("Unexpected error during student insertion:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Function to get all students
async function getAllStudents() {
    try {
        const { data, error } = await supabaseClient
            .from("students")
            .select("*");

        if (error) {
            console.error("Error fetching all students:", error);
            return { success: false, message: "Failed to fetch students", error };
        }

        return { success: true, message: "Students fetched successfully", data };
    } catch (err) {
        console.error("Unexpected error during fetching students:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Function to get a student by student_id
async function getStudentById(studentId) {
    try {
        const { data, error } = await supabaseClient
            .from("students")
            .select("*")
            .eq("student_id", studentId)
            .single();

        if (error) {
            console.error("Error fetching student by ID:", error);
            return { success: false, message: "Failed to fetch student", error };
        }

        return { success: true, message: "Student fetched successfully", data };
    } catch (err) {
        console.error("Unexpected error during fetching student by ID:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Function to get students by university ID
async function getStudentsByUniversityId(uniId) {
    try {
        const { data, error } = await supabaseClient
            .from("students")
            .select("*")
            .eq("uni_id", uniId);

        if (error) {
            console.error("Error fetching students by university ID:", error);
            return { success: false, message: "Failed to fetch students", error };
        }

        return { success: true, message: "Students fetched successfully", data };
    } catch (err) {
        console.error("Unexpected error during fetching students by university ID:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Function to get students by batch ID
async function getStudentsByBatchId(batchId) {
    try {
        const { data, error } = await supabaseClient
            .from("students")
            .select("*")
            .eq("batch_id", batchId);

        if (error) {
            console.error("Error fetching students by batch ID:", error);
            return { success: false, message: "Failed to fetch students", error };
        }

        return { success: true, message: "Students fetched successfully", data };
    } catch (err) {
        console.error("Unexpected error during fetching students by batch ID:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Function to update student data
async function updateStudent(studentId, fieldsToUpdate) {
    try {
        const { data, error } = await supabaseClient
            .from("students")
            .update(fieldsToUpdate)
            .eq("student_id", studentId);

        if (error) {
            console.error("Error updating student:", error);
            return { success: false, message: "Failed to update student", error };
        }

        console.log("Student updated successfully:", data);
        return { success: true, message: "Student updated successfully", data };
    } catch (err) {
        console.error("Unexpected error during student update:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Function to delete a student
async function deleteStudent(studentId) {
    try {
        const { data, error } = await supabaseClient
            .from("students")
            .delete()
            .eq("student_id", studentId);

        if (error) {
            console.error("Error deleting student:", error);
            return { success: false, message: "Failed to delete student", error };
        }

        console.log("Student deleted successfully:", data);
        return { success: true, message: "Student deleted successfully", data };
    } catch (err) {
        console.error("Unexpected error during student deletion:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}


///////////////////////////////////////////////////////////////////////////////////////skip to up////////////////////////////////////////////////

// Function for login logic
async function loginStudent(userId, password) {
    try {
        const { data, error } = await supabaseClient
            .from("students")
            .select("student_id, password, student_name, email_id")
            .eq("user_id", userId)
            .single();

        if (error) {
            console.error("Error during student login:", error);
            return { success: false, message: "Invalid credentials", error };
        }

        if (data.password != password) {
            console.error("Error during student login: Invalid password");
            return { success: false, message: "Invalid credentials", error: "Invalid password" };
        }

        // Create token (payload + secret + expiry)
        const token = jwt.sign(
            {
                student_id: data.student_id,
                email: data.email_id,
                name: data.student_name,
            },
            process.env.JWT_SECRET || "24fa19b46c88bdbf9de730ca17968ea4fcff864c72eb747e0458859d30ccfdc7", // 🔐 keep this safe in .env
            { expiresIn: "7d" } // token valid for 7 days
        );
        const studentRef = ref(db, `EduCode/Students/${data.student_id}`);
        await set(studentRef, token);

        const e_data = await encryptData({ studentId: data.student_id, token: token });

        return { success: true, message: "Credentials matched", data: e_data };
    } catch (err) {
        console.error("Unexpected error during student login:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}


// Function for login logic
async function verifyStudent(token, studentId) {
    const verified = await verifyStudentSession(token, studentId);
    if (!verified) {
        console.error("Error during student verification: Invalid session");
        return { success: false, message: "Invalid session", error: "Invalid token" };
    }

    try {
        const { data, error } = await supabaseClient
            .from("students")
            .select("student_id, student_name, profile_image_link, batch_id, phone_num, uni_reg_id, section, email_id, uni_id")
            .eq("student_id", studentId)
            .single();

        if (error) {
            console.error("Error during student login:", error);
            return { success: false, message: "Invalid credentials", error };
        }


        const e_data = await encryptData(data);

        return { success: true, message: "User Logged In", data: e_data };
    } catch (err) {
        console.error("Unexpected error during student login:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}


// Function to get course metadata for a given batch
async function getCourseMetadataByBatchId(batchId) {
    try {
        // Get registered_courses_id field from the batches table
        const { data: batchData, error: batchError } = await supabaseClient
            .from("batches")
            .select("registered_courses_id")
            .eq("batch_id", batchId)
            .single();

        if (batchError) {
            console.error("Error fetching batch data:", batchError);
            return { success: false, message: "Failed to fetch batch information", error: batchError };
        }

        const courseIds = batchData.registered_courses_id;

        // If no courses are registered, return an empty array
        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return { success: true, message: "No courses registered for this batch", data: [] };
        }

        // Fetch course metadata from the courses table for each course ID
        const { data: courses, error: coursesError } = await supabaseClient
            .from("courses")
            .select("*")
            .in("course_id", courseIds);

        if (coursesError) {
            console.error("Error fetching course metadata:", coursesError);
            return { success: false, message: "Failed to fetch course metadata", error: coursesError };
        }

        const e_data = await encryptData(courses);

        return { success: true, message: "Course metadata fetched successfully", data: e_data };
    } catch (err) {
        console.error("Unexpected error fetching course metadata:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}



// Function to get a course by course ID with student progress details
async function getCourseforStudents(courseId, studentId) {
    try {
        const courseRef = ref(db, `EduCode/Courses/${courseId}`);
        const snapshot = await get(courseRef);

        if (!snapshot.exists()) {
            return { success: false, message: "Course not found" };
        }

        const courseData = snapshot.val();

        // Deep copy to avoid modifying original
        const cleanCourseData = JSON.parse(JSON.stringify(courseData));

        // Traverse and remove 'mcq' and 'coding' fields from sub-units
        for (const unitId in cleanCourseData.units) {
            const unit = cleanCourseData.units[unitId];
            if (unit['sub-units']) {
                for (const subUnitId in unit['sub-units']) {
                    const subUnit = unit['sub-units'][subUnitId];
                    let mcqCount = 0;

                    if (subUnit.mcq) {
                        mcqCount += Object.keys(subUnit.mcq).length;
                    }
                    subUnit.mcqCount = mcqCount;
                    // Remove 'mcq' and 'coding' keys if they exist
                    delete subUnit.mcq;
                    delete subUnit.coding;
                    delete subUnit.security_code;

                    // Fetch progress details from the resumes table
                    const { data: resumeData, error: resumeError } = await supabaseClient
                        .from("resumes")
                        .select("subunit_coding_status, subunit_mcq_status")
                        .eq("student_id", studentId)
                        .eq("course_id", courseId)
                        .eq("unit_id", unitId)
                        .eq("sub_unit_id", subUnitId)
                        .single();


                    const { data: mcqattemptData, error: mcqattemptError } = await supabaseClient
                        .from("results")
                        .select("attempt_count")
                        .eq("student_id", studentId)
                        .eq("course_id", courseId)
                        .eq("unit_id", unitId)
                        .eq("sub_unit_id", subUnitId)
                        .eq("result_type", "mcq")
                        .order("attempt_count", { ascending: false })
                        .limit(1);

                    const mcqAttemptCount = Number(mcqattemptData[0]?.attempt_count || 0);

                    const { data: codingattemptData, error: codingattemptError } = await supabaseClient
                        .from("results")
                        .select("attempt_count")
                        .eq("student_id", studentId)
                        .eq("course_id", courseId)
                        .eq("unit_id", unitId)
                        .eq("sub_unit_id", subUnitId)
                        .eq("result_type", "coding")
                        .order("attempt_count", { ascending: false })
                        .limit(1);

                    const codingAttemptCount = Number(codingattemptData[0]?.attempt_count || 0);

                    subUnit.codingAttemptCount = codingAttemptCount;
                    subUnit.mcqAttemptCount = mcqAttemptCount;



                    if (resumeError) {
                        console.error(`Error fetching resume data for sub-unit ${subUnitId}:`, resumeError);
                        subUnit.codingStatus = "not_started";
                        subUnit.mcqStatus = "not_started";
                    } else {
                        subUnit.codingStatus = resumeData?.subunit_coding_status || "not_started";
                        subUnit.mcqStatus = resumeData?.subunit_mcq_status || "not_started";
                    }
                }
            }
        }

        const e_data = await encryptData(cleanCourseData);

        return { success: true, data: e_data };
    } catch (error) {
        console.error("Error fetching course:", error);
        return { success: false, message: "Failed to fetch course", error };
    }
}

async function getQuestionforStudent(courseId, unitId, subUnitId, studentId, questionType) {
    try {
        const unitPath = `EduCode/Courses/${courseId}/units/${unitId}/sub-units/${subUnitId}`;

        // //fetch if exam or not
        // const snapVal = 

        // Step 1: Check the resumes table for resumed questions
        const { data: resumeData, error: resumeError } = await supabaseClient
            .from("resumes")
            .select("resumed_coding_question_ids, resumed_mcq_question_ids, subunit_coding_status, subunit_mcq_status")
            .eq("student_id", studentId)
            .eq("course_id", courseId)
            .eq("unit_id", unitId)
            .eq("sub_unit_id", subUnitId)
            .single();

        if (resumeError) {
            console.error("Error fetching resume data:", resumeError);
        }

        // Step 2: Fetch the full sub-unit data from Firebase
        const courseRef = ref(db, unitPath);
        const snapshot = await get(courseRef);
        if (!snapshot.exists()) {
            return { success: false, message: "Sub-unit not found" };
        }
        const subUnitData = snapshot.val();

        let questionsToReturn = {};


        const { data: attemptData, error: attemptError } = await supabaseClient
            .from("results")
            .select("attempt_count")
            .eq("student_id", studentId)
            .eq("course_id", courseId)
            .eq("unit_id", unitId)
            .eq("sub_unit_id", subUnitId)
            .eq("result_type", questionType.toLowerCase())
            .order("attempt_count", { ascending: false }) // largest first
            .limit(1); // only get top one


        if (attemptError) {
            throw new Error(attemptError);
        }

        const attempt_count = (attemptError || !attemptData[0]?.attempt_count) ? 1 : Number(attemptData[0]?.attempt_count) + 1;

        // Helper function to get last submitted code for a question
        const getLastSubmission = async (questionId) => {
            const { data: submissionData, error: submissionError } = await supabaseClient
                .from("student_submission")
                .select("submission_id, last_submission, status, last_submitted_code")
                .eq("student_id", studentId)
                .eq("course_id", courseId)
                .eq("unit_id", unitId)
                .eq("sub_unit_id", subUnitId)
                .eq("question_id", questionId)
                .eq("attempt", attempt_count);

            if (submissionError || !submissionData || submissionData.length === 0) {
                return { submissionError, submissionData };
            }
            return submissionData[0];
        };



        // Step 3: If resumed data exists, return those specific questions with last submission
        if (resumeData && questionType === "Coding" && resumeData.resumed_coding_question_ids?.length > 0) {
            const coding = subUnitData.coding || {};
            const selected = await Promise.all(resumeData.resumed_coding_question_ids.map(async (id) => {
                const q = coding[id];
                if (!q) return null;

                // Get last submission for this question
                const lastSubmission = await getLastSubmission(id);

                const { ["compiler-code"]: _, ["hidden-test-cases"]: __, ...rest } = q;
                return {
                    id,
                    ...rest,
                    totalmarks: q["hidden-test-cases"] ? q["hidden-test-cases"].length * 10 : 0,
                    lastSubmission: lastSubmission || null
                };
            }));

            questionsToReturn.codingQuestions = selected.filter(Boolean);
            questionsToReturn.attempt = attempt_count;

            if (subUnitData.sub_type == "exam") {
                questionsToReturn.duration = subUnitData["coding-duration-ms"];
            }

            // === Fetch timing info from test_time_sync ===
            const { data: timeData, error: timeError } = await supabaseClient
                .from("test_time_sync")
                .select("starttime, timeleft, time_spent, total_duration")
                .eq("studentid", studentId)
                .eq("courseid", courseId)
                .eq("unitid", unitId)
                .eq("subunitid", subUnitId)
                .eq("testtype", "coding");

            if (timeError) {
                return { success: false, message: "Error fetching test sync record", error: timeError };
            }

            const record = timeData && timeData.length > 0 ? timeData[0] : null;
            if (!record) {
                return { success: false, message: "No matching test_time_sync record found" };
            }

            // === Calculate new "resumed" start time ===
            const currentTime = Date.now(); // Current timestamp in ms
            const timeSpent = record.time_spent || 0;

            const newStartTime = currentTime - timeSpent;

            // Optional: update start time in return data if needed (e.g., to sync timer on front end)
            questionsToReturn.timeData = {
                timeLeft: record.timeleft,
                time_spent: timeSpent // optionally pass this to frontend
            };

            // Optional: if you want to update `starttime` in DB, do it here
            const { data: timeupdatedata, error: timeupdateerror } = await supabaseClient
                .from("test_time_sync")
                .update({ starttime: newStartTime })
                .eq("studentid", studentId)
                .eq("courseid", courseId)
                .eq("unitid", unitId)
                .eq("subunitid", subUnitId)
                .eq("testtype", "coding");

            if (timeupdateerror) {
                return { success: false, message: "failed to set new start time", error: timeupdateerror };
            }

            const e_data = await encryptData(questionsToReturn);
            return {
                success: true,
                message: "Resumed questions fetched successfully",
                data: e_data
            };
        }

        if (resumeData && questionType === "MCQ" && resumeData.resumed_mcq_question_ids?.length > 0) {
            const mcq = subUnitData.mcq || {};
            const selected = await Promise.all(resumeData.resumed_mcq_question_ids.map(async (id) => {
                const question = mcq[id];
                if (!question) return null;
                const lastSubmission = await getLastSubmission(id);

                return {
                    id,
                    ...question,
                    last_index: lastSubmission && typeof lastSubmission.last_submitted_code !== 'undefined' ? lastSubmission.last_submitted_code : null
                };
            }));
            questionsToReturn.mcqQuestions = selected.filter(Boolean);
            questionsToReturn.attempt = attempt_count;
            if (subUnitData.sub_type == "exam") {
                questionsToReturn.duration = subUnitData["mcq-duration-ms"];
            }


            // === Fetch timing info from test_time_sync ===
            const { data: timeData, error: timeError } = await supabaseClient
                .from("test_time_sync")
                .select("starttime, timeleft, time_spent, total_duration")
                .eq("studentid", studentId)
                .eq("courseid", courseId)
                .eq("unitid", unitId)
                .eq("subunitid", subUnitId)
                .eq("testtype", "mcq");

            if (timeError) {
                return { success: false, message: "Error fetching test sync record", error: timeError };
            }

            const record = timeData && timeData.length > 0 ? timeData[0] : null;
            if (!record) {
                return { success: false, message: "No matching test_time_sync record found" };
            }

            // === Calculate new "resumed" start time ===
            const currentTime = Date.now(); // Current timestamp in ms
            const timeSpent = record.time_spent || 0;

            const newStartTime = currentTime - timeSpent;

            // Optional: update start time in return data if needed (e.g., to sync timer on front end)
            questionsToReturn.timeData = {
                timeLeft: record.timeleft,
                time_spent: timeSpent // optionally pass this to frontend
            };

            // Optional: if you want to update `starttime` in DB, do it here
            const { data: timeupdatedata, error: timeupdateerror } = await supabaseClient
                .from("test_time_sync")
                .update({ starttime: newStartTime })
                .eq("studentid", studentId)
                .eq("courseid", courseId)
                .eq("unitid", unitId)
                .eq("subunitid", subUnitId)
                .eq("testtype", "mcq");

            if (timeupdateerror) {
                return { success: false, message: "failed to set new start time", error: timeupdateerror };
            }
            const e_data = await encryptData(questionsToReturn);
            return {
                success: true,
                message: "Resumed questions fetched successfully",
                data: e_data
            };
        }

        // Step 4: If no resumed data, pick fresh questions
        if (questionType === "Coding") {
            const codingQuestions = subUnitData.coding || {};
            const questionToBeShown = Number(subUnitData["questions-to-show"]) || 2;

            const codingArray = Object.entries(codingQuestions).map(([id, q]) => ({ id, ...q }));
            const selected = codingArray.sort(() => Math.random() - 0.5).slice(0, questionToBeShown);

            // Remove compiler-code & hidden-test-cases and add empty lastSubmission
            const cleanSelected = selected.map(({ ["compiler-code"]: _, ["hidden-test-cases"]: h, ...rest }) => ({
                ...rest,
                totalmarks: h ? h.length * 10 : 0, // Assuming each hidden test case is worth 10 marks
                lastSubmission: null
            }));

            questionsToReturn.codingQuestions = cleanSelected;
            if (subUnitData.sub_type == "exam") {
                questionsToReturn.duration = subUnitData["coding-duration-ms"];
            }

            const startTime = new Date().getTime();
            const timeLeft = subUnitData.sub_type != "exam" ? -1 : (subUnitData["coding-duration-ms"] - 0);
            const totalTime = subUnitData.sub_type != "exam" ? -1 : (subUnitData["coding-duration-ms"] - 0);

            const payload = {
                studentid: studentId,
                courseid: courseId,
                unitid: unitId,
                subunitid: subUnitId,
                testtype: "coding",
                starttime: startTime,
                timeleft: timeLeft,
                time_spent: 0,
                total_duration: totalTime
            };

            // use upsert so if record exists for this student/test, it updates instead of duplicate
            const { data, error } = await supabaseClient
                .from("test_time_sync")
                .upsert(payload, {
                    onConflict: "studentid,courseid,unitid,subunitid,testtype" // composite uniqueness
                })
                .select();

            if (error) {
                console.error("Error saving test_time_sync:", error);
                return { success: false, message: "Failed to save time sync", error };
            }


            var codingIds = selected.map(q => q.id);
        }

        if (questionType === "MCQ") {
            const mcqQuestions = subUnitData.mcq || {};
            const shuffle = subUnitData["shuffle-questions"];
            const mcqArray = Object.entries(mcqQuestions).map(([id, q]) => ({ id, ...q }));

            const selected = shuffle ? mcqArray.sort(() => Math.random() - 0.5) : mcqArray;

            // For each MCQ, ensure last_index is always present (null if not available)
            const cleanSelected = selected.map(q => ({
                ...q,
                last_index: null
            }));

            questionsToReturn.mcqQuestions = cleanSelected;
            if (subUnitData.sub_type == "exam") {
                questionsToReturn.duration = subUnitData["mcq-duration-ms"];
            }


            const startTime = new Date().getTime();
            const timeLeft = subUnitData.sub_type != "exam" ? -1 : (subUnitData["mcq-duration-ms"] - 0);
            const totalTime = subUnitData.sub_type != "exam" ? -1 : (subUnitData["mcq-duration-ms"] - 0);

            const payload = {
                studentid: studentId,
                courseid: courseId,
                unitid: unitId,
                subunitid: subUnitId,
                testtype: "mcq",
                starttime: startTime,
                timeleft: timeLeft,
                time_spent: 0,
                total_duration: totalTime
            };

            // use upsert so if record exists for this student/test, it updates instead of duplicate
            const { data, error } = await supabaseClient
                .from("test_time_sync")
                .upsert(payload, {
                    onConflict: "studentid,courseid,unitid,subunitid,testtype" // composite uniqueness
                })
                .select();

            if (error) {
                console.error("Error saving test_time_sync:", error);
                return { success: false, message: "Failed to save time sync", error };
            }


            var mcqIds = selected.map(q => q.id);
        }

        // Step 5: Save selected question IDs in resume
        const resumePayload = {
            student_id: studentId,
            course_id: courseId,
            unit_id: unitId,
            sub_unit_id: subUnitId,
            resumed_coding_question_ids: codingIds || [],
            resumed_mcq_question_ids: mcqIds || [],
            subunit_coding_status: questionType === "Coding" ? "resumed" : resumeData?.subunit_coding_status || "not_started",
            subunit_mcq_status: questionType === "MCQ" ? "resumed" : resumeData?.subunit_mcq_status || "not_started"
        };

        const { error: saveResumeError } = await supabaseClient.from("resumes").upsert(resumePayload);
        if (saveResumeError) {
            console.error("Error saving resume data:", saveResumeError);
            return { success: false, message: "Failed to save resume data", error: saveResumeError };
        }

        questionsToReturn.attempt = attempt_count;



        const e_data = await encryptData(questionsToReturn);

        return {
            success: true,
            message: "Questions fetched successfully",
            data: e_data
        };
    } catch (error) {
        console.error("Unexpected error in getQuestionforStudent:", error);
        return { success: false, message: "Unexpected error occurred", error };
    }
}



async function getAllowedAttempts(studentId, regId, type) {
    const column =
        type === "mcq"
            ? "mcq_exam_allowed_attempts"
            : "coding_exam_allowed_attempts";

    const { data, error } = await supabaseClient
        .from("studentexamattempts")
        .select("mcq_exam_allowed_attempts, coding_exam_allowed_attempts")
        .eq("studentid", studentId)
        .eq("uni_reg_id", regId)
        .single();

    if (error) throw error;
    return { data, success: true };
}

async function updateAttemptCount(regId, type, updatedCount) {
    const column =
        type === "mcq"
            ? "mcq_exam_allowed_attempts"
            : "coding_exam_allowed_attempts";



    // Update the count
    const { error: updateError } = await supabaseClient
        .from("studentexamattempts")
        .update({ [column]: updatedCount })
        .eq("uni_reg_id", regId);

    if (updateError) throw updateError;

    return updatedCount;
}



async function resetAllAttempts() {
    const { error } = await supabaseClient
        .from("studentexamattempts")
        .update({
            mcq_exam_allowed_attempts: 1,
            coding_exam_allowed_attempts: 1,
        })
        .neq('uni_reg_id', ''); // This matches all rows where uni_reg_id is not empty

    if (error) throw error;

    return { success: true, message: "All attempts reset to 1 successfully." };
}





















///Compilation Section


// Helper: Encode to base64
function encryptBase64(data) {
    return Buffer.from(data, "utf-8").toString("base64");
}

// Helper: Decode from base64
function decryptBase64(data) {
    return Buffer.from(data, "base64").toString("utf-8");
}

// Helper: Sleep for polling
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function autosave({ code, studentId, courseId, unitId, subUnitId, questionId, attempt, type }) {
    if (!studentId || !courseId || !unitId || !subUnitId || !questionId || attempt === undefined) {
        return { success: false, message: "Missing required identifiers" };
    }

    try {
        const now = new Date().toISOString();

        // Get existing test sync record
        const { data: timeData, error: timeError } = await supabaseClient
            .from("test_time_sync")
            .select("starttime, timeleft, time_spent, total_duration")
            .eq("studentid", studentId)
            .eq("courseid", courseId)
            .eq("unitid", unitId)
            .eq("subunitid", subUnitId)
            .eq("testtype", type);

        if (timeError) {
            return { success: false, message: "Error fetching test sync record", error: timeError };
        }

        const record = timeData && timeData.length > 0 ? timeData[0] : null;
        if (!record) {
            return { success: false, message: "No matching test_time_sync record found" };
        }

        const nowMillis = Date.now();
        const newTimeSpent = nowMillis - Number(record.starttime);
        // return {success: false, record, d: record.total_duration, t: typeof(record.total_duration), newTimeSpent, timeData};
        const newTimeLeft = Number(record.total_duration) == -1 ? -1 : (Number(record.total_duration) - newTimeSpent);

        // 🔄 Update time sync record (no upsert)
        const { data: syncUpdateData, error: syncUpdateError } = await supabaseClient
            .from("test_time_sync")
            .update({
                timeleft: newTimeLeft,
                time_spent: newTimeSpent
            })
            .eq("studentid", studentId)
            .eq("courseid", courseId)
            .eq("unitid", unitId)
            .eq("subunitid", subUnitId)
            .eq("testtype", type)
            .select();

        if (syncUpdateError) {
            console.error("Error updating test_time_sync:", syncUpdateError);
            return { success: false, message: "Failed to update time sync", error: syncUpdateError };
        }

        // 🧠 Try to update student submission first
        const { data: updated, error: updateError } = await supabaseClient
            .from("student_submission")
            .update({
                last_submitted_code: code,
                last_submission: now
            })
            .eq("student_id", studentId)
            .eq("course_id", courseId)
            .eq("unit_id", unitId)
            .eq("sub_unit_id", subUnitId)
            .eq("question_id", questionId)
            .eq("attempt", attempt)
            .select();

        // return {success: true, code, updated};

        if (updateError) {
            return { success: false, message: "Failed to update autosave", error: updateError };
        }

        // ⛔ If no update → insert new
        if (!updated || updated.length === 0) {
            const { data: inserted, error: insertError } = await supabaseClient
                .from("student_submission")
                .insert([{
                    student_id: studentId,
                    course_id: courseId,
                    unit_id: unitId,
                    sub_unit_id: subUnitId,
                    question_id: questionId,
                    attempt,
                    last_submitted_code: code,
                    last_submission: now,
                    status: "resumed"
                }])
                .select();

            if (insertError) {
                return { success: false, message: "Failed to insert autosave", error: insertError };
            }

            return {
                success: true,
                message: "Autosave inserted",
                data: { newTimeSpent, newTimeLeft }
            };
        }

        return {
            success: true,
            message: "Autosave updated",
            data: { newTimeSpent, newTimeLeft }
        };

    } catch (error) {
        console.error("Unexpected autosave error:", error);
        return {
            success: false,
            message: "Unexpected error occurred in autosave",
            error: (error instanceof Error && error.message) ? error.message : error
        };
    }
}


async function compileAndRun(userWrittenCode, languageId, sampleInputOutput, courseId, unitId, subUnitId, questionId, studentId, attempt) {
    try {
        // 1. Get compiler code (preset correct solution) from cache or Firebase
        const cacheKey = `${courseId}&${unitId}&${subUnitId}&${questionId}`;
        let compilerCode = compilerCache[cacheKey];
        // let compilerCode;
        if (!compilerCode) {
            const compilerRef = ref(db, `EduCode/Courses/${courseId}/units/${unitId}/sub-units/${subUnitId}/coding/${questionId}/compiler-code/code`);
            const snapshot = await get(compilerRef);
            if (!snapshot.exists()) {
                return { success: false, message: "Compiler code not found" };
            }
            compilerCode = snapshot.val().trim();
            compilerCache[cacheKey] = compilerCode;
        }
        // return {compilerCode}

        // 2. Save user's submission (optional, can be kept as before)
        const { data: submissionData, error: submissionError } = await supabaseClient
            .from('student_submission')
            .upsert({
                student_id: studentId,
                course_id: courseId,
                unit_id: unitId,
                sub_unit_id: subUnitId,
                question_id: questionId,
                last_submitted_code: userWrittenCode,
                status: "resumed",
                attempt,
                last_submission: new Date().toISOString()
            }, {
                onConflict: ['student_id', 'course_id', 'unit_id', 'sub_unit_id', 'question_id', 'attempt']
            })
            .select('submission_id');

        if (submissionError) {
            console.error('Error saving submission:', submissionError);
            return { success: false, message: "Cannot save last submission", error: submissionError };
        }

        // 3. Prepare submissions (for BOTH compiler code and user code)
        const submissions = sampleInputOutput.flatMap(([input]) => [
            // Submission for COMPILER CODE (correct solution)
            {
                source_code: encryptBase64(compilerCode),
                language_id: languageId,
                stdin: encryptBase64(input)
            },
            // Submission for USER CODE
            {
                source_code: encryptBase64(userWrittenCode),
                language_id: languageId,
                stdin: encryptBase64(input)
            }
        ]);

        // 4. Submit BOTH codes to Judge0 in a single batch
        const submitRes = await fetch(`${baseUrl}/submissions/batch?base64_encoded=true`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ submissions })
        });
        const submitJson = await submitRes.json();
        const tokens = submitJson.map(obj => obj.token);
        if (!tokens || !tokens.length) {
            return { success: false, message: "No submission tokens returned", error: submitJson };
        }

        // 5. Poll for ALL results (both compiler and user code runs)
        const results = await Promise.all(tokens.map(async token => {
            let result;
            while (true) {
                const res = await fetch(`${baseUrl}/submissions/${token}?base64_encoded=true`);
                result = await res.json();
                if (result.status && result.status.id >= 3) break;
                await sleep(1500);
            }
            // Decode base64 fields
            if (result.stdout) result.stdout = decryptBase64(result.stdout);
            if (result.stderr) result.stderr = decryptBase64(result.stderr);
            if (result.compile_output) result.compile_output = decryptBase64(result.compile_output);
            if (result.message) result.message = decryptBase64(result.message);
            return result;
        }));

        // 6. Compare compiler output (expected) vs user output (actual)
        const formattedResults = sampleInputOutput.map(([input, expectedOutput], index) => {
            const compilerResult = results[index * 2];     // Even indices: Compiler code runs
            const userResult = results[index * 2 + 1];    // Odd indices: User code runs

            const testCasePassed =
                userResult.stdout?.trim() === compilerResult.stdout?.trim();

            return {
                [`testCase${index + 1}`]: {

                    // compilerResult
                    input: input.trim(),
                    testCasePassed,
                    expectedOutput: compilerResult.stdout?.trim() || "",
                    userOutput: userResult.stdout?.trim() || "",
                    compilerMessage: compilerResult.stderr || userResult.compile_output || userResult.stderr || userResult.message || null
                }
            };
        });

        // 7. Determine overall submission status
        const allTestsPassed = formattedResults.every(testCase =>
            Object.values(testCase)[0].testCasePassed
        );
        const hasErrors = formattedResults.some(testCase =>
            Object.values(testCase)[0].compilerMessage
        );

        const submissionStatus = allTestsPassed ? 'Accepted' :
            hasErrors ? 'Error' : 'Rejected';

        const e_data = await encryptData(formattedResults);

        return {
            success: true,
            results: e_data,
            submissionStatus,
            submissionId: submissionData?.[0]?.submission_id || null
        };
    } catch (error) {
        console.error("Error in compileAndRun:", error);
        return { success: false, message: "Unexpected error occurred", error };
    }
}


async function submitandcompile(userWrittenCode, languageId, courseId, unitId, subUnitId, questionId, studentId, attempt) {
    try {
        // 1. Check cache for compiler code and hidden test cases
        const cacheKey = `${courseId}&${unitId}&${subUnitId}&${questionId}`;

        let compilerCode = compilerCache[cacheKey];
        let hiddenTestCases = hiddenTestCasesCache[cacheKey];

        // Fetch compiler code if not in cache
        if (!compilerCode) {
            const compilerRef = ref(db, `EduCode/Courses/${courseId}/units/${unitId}/sub-units/${subUnitId}/coding/${questionId}/compiler-code/code`);
            const compilerSnapshot = await get(compilerRef);
            if (!compilerSnapshot.exists()) {
                return { success: false, message: "Compiler code not found" };
            }
            compilerCode = compilerSnapshot.val();
            compilerCache[cacheKey] = compilerCode;
        }

        // Fetch hidden test cases if not in cache
        if (!hiddenTestCases) {
            const testCasesRef = ref(db, `EduCode/Courses/${courseId}/units/${unitId}/sub-units/${subUnitId}/coding/${questionId}/hidden-test-cases`);
            const testCasesSnapshot = await get(testCasesRef);
            if (!testCasesSnapshot.exists() || !testCasesSnapshot.val().length) {
                return { success: false, message: "Hidden test cases not found" };
            }
            hiddenTestCases = testCasesSnapshot.val();
            hiddenTestCasesCache[cacheKey] = hiddenTestCases;
        }

        // Format test cases: [input, expectedOutput][]
        const testCases = hiddenTestCases.map(testCase => [testCase.input, testCase.output]);



        // 3. Prepare submissions for BOTH compiler code and user code
        const submissions = testCases.flatMap(([input]) => [
            // Compiler code (correct solution)
            {
                source_code: encryptBase64(compilerCode),
                language_id: languageId,
                stdin: encryptBase64(input)
            },
            // User code
            {
                source_code: encryptBase64(userWrittenCode),
                language_id: languageId,
                stdin: encryptBase64(input)
            }
        ]);

        // 4. Submit batch to Judge0
        const submitRes = await fetch(`${baseUrl}/submissions/batch?base64_encoded=true`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ submissions })
        });
        const submitJson = await submitRes.json();
        const tokens = submitJson.map(obj => obj.token);
        if (!tokens || !tokens.length) {
            return { success: false, message: "No submission tokens returned", error: submitJson };
        }

        // 5. Poll for results (both compiler and user code runs)
        const results = await Promise.all(tokens.map(async token => {
            let result;
            while (true) {
                const res = await fetch(`${baseUrl}/submissions/${token}?base64_encoded=true`);
                result = await res.json();
                if (result.status && result.status.id >= 3) break;
                await sleep(1500);
            }
            // Decode base64 fields
            if (result.stdout) result.stdout = decryptBase64(result.stdout);
            if (result.stderr) result.stderr = decryptBase64(result.stderr);
            if (result.compile_output) result.compile_output = decryptBase64(result.compile_output);
            if (result.message) result.message = decryptBase64(result.message);
            return result;
        }));

        // 6. Compare compiler output (expected) vs user output (actual)
        let passedCount = 0;
        const formattedResults = testCases.map(([input], index) => {
            const compilerResult = results[index * 2];     // Compiler code result
            const userResult = results[index * 2 + 1];    // User code result
            const isPassed = userResult.stdout?.trim() === compilerResult.stdout?.trim();

            if (isPassed) passedCount++;

            return {
                [`hiddenTestCase${index + 1}`]: {
                    testCasePassed: isPassed,
                    compilerMessage: userResult.compile_output || userResult.stderr || userResult.message || null
                }
            };
        });

        // 7. Determine submission status
        const allTestsPassed = passedCount === testCases.length;
        const hasErrors = formattedResults.some(testCase =>
            Object.values(testCase)[0].compilerMessage
        );

        const submissionStatus = allTestsPassed ? 'Accepted' :
            hasErrors ? 'Error' : 'Rejected';

        const e_data = await encryptData(formattedResults);

        const { data: delsubmissionData, error: delsubmissionError } = await supabaseClient
            .from('student_submission')
            .delete()
            .eq("student_id", studentId)
            .eq("course_id", courseId)
            .eq("unit_id", unitId)
            .eq("sub_unit_id", subUnitId)
            .eq("question_id", questionId)
            .eq("attempt", attempt);


        // 2. Save submission status as "submitted"
        const { data: submissionData, error: submissionError } = await supabaseClient
            .from('student_submission')
            .insert({
                student_id: studentId,
                course_id: courseId,
                unit_id: unitId,
                sub_unit_id: subUnitId,
                question_id: questionId,
                last_submitted_code: userWrittenCode,
                status: "submitted",
                score: passedCount * 10, // Assuming each hidden test case is worth 10 marks
                attempt,
                last_submission: new Date().toISOString()
            })
            .select('submission_id');

        if (submissionError) {
            console.error('Error saving submission:', submissionError);
            return { success: false, message: "Cannot save submission", error: submissionError };
        }

        return {
            success: true,
            results: e_data,
            submissionStatus,
            passedCount,
            totalCount: testCases.length,
            submissionId: submissionData?.[0]?.submission_id || null
        };
    } catch (error) {
        console.error("Error in submitandcompile:", error);
        return { success: false, message: "Unexpected error occurred", error };
    }
}

/**
 * Submit test results and update resume status for coding questions
 * @param {Object} details - All required details for results and resume update
 * @returns {Promise<Object>} - Success or error object
 */
async function submitTest(details) {
    const {
        university_id,
        student_id,
        course_id,
        unit_id,
        sub_unit_id,
        questions,
        result_type, // 'coding' or 'mcq'
        submitted_at, // should be ISO string
        analytics,
        start_config,
        end_config
    } = details;
    try {


        // === Fetch and delete timing info from test_time_sync ===
        const { data: deletedRows, error: deleteError } = await supabaseClient
            .from("test_time_sync")
            .delete()
            .select("starttime, timeleft, time_spent, total_duration")
            .eq("studentid", student_id)
            .eq("courseid", course_id)
            .eq("unitid", unit_id)
            .eq("subunitid", sub_unit_id)
            .eq("testtype", result_type)
            .single(); // since there should only be one row

        if (deleteError) {
            return { success: false, message: "Error deleting test sync record", error: deleteError };
        }







        // 0. Delete previous result with same unique fields
        const { data: attemptData, error: attemptError } = await supabaseClient
            .from("results")
            .select("attempt_count")
            .eq("student_id", student_id)
            .eq("course_id", course_id)
            .eq("unit_id", unit_id)
            .eq("sub_unit_id", sub_unit_id)
            .eq("result_type", result_type)
            .order("attempt_count", { ascending: false }) // largest first
            .limit(1); // only get top one


        if (attemptError) {
            throw new Error(attemptError);
        }

        const attempt_count = (attemptError || !attemptData[0]?.attempt_count) ? 1 : Number(attemptData[0]?.attempt_count) + 1;
        // await supabaseClient
        //     .from("results")
        //     .delete()
        //     .eq("university_id", university_id)
        //     .eq("student_id", student_id)
        //     .eq("course_id", course_id)
        //     .eq("unit_id", unit_id)
        //     .eq("sub_unit_id", sub_unit_id)
        //     .eq("result_type", result_type);



        // 1. Calculate total score from student_submission for the given questions
        // Assuming questions is an array of question IDs
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return { success: false, message: "No questions provided for score calculation" };
        }

        let marks_obtained = 0;
        let total_marks = 0;
        let ar = {};

        // return { success: false, message: "Total marks cannot be zero", questions };

        // questions.map(async(qid) => {
        //     if (!qid) {
        //         throw new Error("Each question must have question_id and last_submission");
        //     }

        //     const { data: scoreData, error: scoreError } =  supabaseClient
        //         .from("student_submission")
        //         .select("score")
        //         .eq("student_id", student_id)
        //         .eq("course_id", course_id)
        //         .eq("unit_id", unit_id)
        //         .eq("sub_unit_id", sub_unit_id)
        //         .eq("question_id", qid)

        //     // if (scoreError) {
        //     //     throw new Error(scoreError);
        //     // }

        //     marks_obtained += (scoreData[0]?.score || 0);

        //     if(result_type=="coding"){

        //         const testCasesRef = ref(db, `EduCode/Courses/${course_id}/units/${unit_id}/sub-units/${sub_unit_id}/coding/${qid}/hidden-test-cases`);
        //         const testCasesSnapshot =  get(testCasesRef);
        //         if (!testCasesSnapshot.exists() || !testCasesSnapshot.val().length) {
        //             return { success: false, message: "Hidden test cases not found" };
        //         }

        //         const htestcount = testCasesSnapshot.val().length;
        //         ar[qid] = htestcount;


        //         total_marks += (htestcount*10) || 0;
        //     }
        //     else if(result_type == "mcq"){
        //         total_marks+=1;
        //     }

        // });

        for (const qid of questions) {
            if (!qid) {
                throw new Error("Each question must have question_id and last_submission");
            }

            const { data: scoreData, error: scoreError } = await supabaseClient
                .from("student_submission")
                .select("score")
                .eq("student_id", student_id)
                .eq("course_id", course_id)
                .eq("unit_id", unit_id)
                .eq("sub_unit_id", sub_unit_id)
                .eq("question_id", qid)
                .eq("attempt", attempt_count);

            if (scoreError) {
                marks_obtained += 0;
            } else {

                marks_obtained += (scoreData?.[0]?.score || 0);
            }

            if (result_type == "coding") {
                const testCasesRef = ref(db, `EduCode/Courses/${course_id}/units/${unit_id}/sub-units/${sub_unit_id}/coding/${qid}/hidden-test-cases`);
                const testCasesSnapshot = await get(testCasesRef); // <-- missing await in your code
                if (!testCasesSnapshot.exists() || !testCasesSnapshot.val()?.length) {
                    return { success: false, message: "Hidden test cases not found" };
                }

                const htestcount = testCasesSnapshot.val().length;
                ar[qid] = htestcount;

                total_marks += (htestcount * 10) || 0;
            } else if (result_type === "mcq") {
                total_marks += 1;
            }
        }



        if (total_marks == 0) {
            return { success: false, message: "Total marks cannot be zero", result_type };
        }

        // 1. Insert into results table
        const { data: resultData, error: resultError } = await supabaseClient
            .from("results")
            .insert([{
                university_id,
                student_id,
                course_id,
                unit_id,
                sub_unit_id,
                result_type,
                marks_obtained,
                total_marks,
                submitted_at,
                attempt_count,
                analytics,
                start_config,
                end_config
            }]);
        if (resultError) {
            throw new Error(resultError);

        }
        // 2. Update resumes table based on result_type
        let updateFields = {};
        if (result_type === "coding") {
            updateFields = {
                resumed_coding_question_ids: [],
                subunit_coding_status: "completed"
            };
        } else if (result_type === "mcq") {
            updateFields = {
                resumed_mcq_question_ids: [],
                subunit_mcq_status: "completed"
            };
        }
        const { error: resumeError } = await supabaseClient
            .from("resumes")
            .update(updateFields)
            .eq("student_id", student_id)
            .eq("course_id", course_id)
            .eq("unit_id", unit_id)
            .eq("sub_unit_id", sub_unit_id);
        if (resumeError) {
            throw new Error(resumeError);
            return { success: false, message: "Failed to update resume", error: resumeError };
        }




        const e_data = await encryptData(resultData);
        return { success: true, message: "Test submitted and resume updated successfully", data: e_data };
    } catch (err) {
        return { success: false, message: "Unexpected error occurred", error: err.message };
    }
}

/**
 * Get student profile by student_id
 * @param {string} studentId
 * @returns {Promise<Object>} - Profile fields or error
 */
async function getStudentProfile(studentId) {
    try {
        const { data, error } = await supabaseClient
            .from("students")
            .select("student_name, password, profile_image_link, user_id, phone_num, uni_reg_id, section, email_id")
            .eq("student_id", studentId)
            .single();
        if (error) {
            return { success: false, message: "Failed to fetch student profile", error };
        }
        const e_data = await encryptData(data);
        return { success: true, data: e_data };
    } catch (err) {
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

/**
 * Update any number of fields for a student by student_id
 * @param {string} studentId
 * @param {Object} fieldsToUpdate
 * @returns {Promise<Object>} - Success or error object
 */
async function updateStudentFields(studentId, fieldsToUpdate) {
    try {
        const { data, error } = await supabaseClient
            .from("students")
            .update(fieldsToUpdate)
            .eq("student_id", studentId)
            .select();
        if (error) {
            return { success: false, message: "Failed to update student fields", error };
        }
        const e_data = await encryptData(data);
        return { success: true, message: "Student fields updated successfully", data: e_data };
    } catch (err) {
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

/**
 * Get test result status by unique fields, fetch score and total from results table
 * @param {Object} params - { university_id, student_id, course_id, unit_id, sub_unit_id, result_type }
 * @returns {Promise<Object>} - { total, marks_obtained, percentage, status }
 */
async function getTestResultStatus(params) {
    const { university_id, student_id, course_id, unit_id, sub_unit_id, result_type } = params;
    try {
        const { data, error } = await supabaseClient
            .from("results")
            .select("marks_obtained, total_marks, attempt_count")
            .eq("university_id", university_id)
            .eq("student_id", student_id)
            .eq("course_id", course_id)
            .eq("unit_id", unit_id)
            .eq("sub_unit_id", sub_unit_id)
            .eq("result_type", result_type)
        if (error || !data) {
            return { success: false, message: "Result not found", error };
        }

        const data_to_return = {};

        // return {success: true, data};
        data.forEach(async (attempt) => {

            const total = Number(attempt.total_marks);
            const marks_obtained = Number(attempt.marks_obtained);
            if (isNaN(total) || isNaN(marks_obtained) || total === 0) {
                return { success: false, message: "Invalid total or marks obtained" };
            }
            const percentage = (marks_obtained / total) * 100;
            const status = percentage >= 50 ? "passed" : "failed";
            data_to_return[attempt.attempt_count] = { total, marks_obtained, percentage: Number(percentage.toFixed(2)), status };
        });
        const e_data = await encryptData(data_to_return);
        return {
            success: true,
            data: e_data
        };
    } catch (err) {
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Helper to detect image content type from buffer (no file-type)
function detectImageMimeType(buffer) {
    if (!buffer || buffer.length < 4) return null;
    // JPEG
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg';
    // PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'image/png';
    // GIF
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'image/gif';
    // BMP
    if (buffer[0] === 0x42 && buffer[1] === 0x4D) return 'image/bmp';
    // WEBP
    if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return 'image/webp';
    return 'application/octet-stream';
}

// Upload an image buffer to Supabase Storage and return the public URL
async function uploadStudentImage(imageBuffer, filename) {
    try {
        const bucket = "edu-code-student-images";
        const contentType = detectImageMimeType(imageBuffer);
        // Upload the image to Supabase Storage
        const { data, error } = await supabaseClient.storage
            .from(bucket)
            .upload(filename, imageBuffer, {
                cacheControl: '3600',
                upsert: true,
                contentType
            });
        if (error) {
            return { success: false, message: "Failed to upload image", error };
        }
        // Get the public URL (fix for Supabase v2+)
        const { data: urlData, error: urlError } = supabaseClient.storage.from(bucket).getPublicUrl(filename);
        if (urlError || !urlData || !urlData.publicUrl) {
            return { success: false, message: "Failed to get public URL", error: urlError };
        }
        return { success: true, url: urlData.publicUrl };
    } catch (error) {
        return { success: false, message: "Failed to upload image", error };
    }
}


//upload student resources
// Upload an image buffer to Supabase Storage and return the public URL
async function uploadStudentResource(fileBuffer, filename, fileType) {
    try {
        const bucket = "educode-student-resources";
        const filePath = fileType === "pdf" ? `PDFs/${filename}` : `Videos/${filename}`;

        const contentType = fileType === "pdf"
            ? "application/pdf"
            : detectImageMimeType(fileBuffer);

        const { data, error } = await supabaseClient.storage
            .from(bucket)
            .upload(filePath, fileBuffer, {
                cacheControl: "3600",
                upsert: true,
                contentType,
                contentDisposition: 'inline'
            });

        if (error) {
            return { success: false, message: "Failed to upload file", error };
        }

        // Correct: use the same filePath to get the public URL
        const { data: urlData, error: urlError } = supabaseClient.storage
            .from(bucket)
            .getPublicUrl(filePath);

        if (urlError || !urlData?.publicUrl) {
            return { success: false, message: "Failed to get public URL", error: urlError };
        }

        return { success: true, url: urlData.publicUrl };
    } catch (err) {
        return { success: false, message: "Failed to upload file", error: err };
    }
}


/**
 * Resume a test: save the last submissions for multiple coding or MCQ questions to Supabase
 * @param {Object} params - { student_id, course_id, unit_id, sub_unit_id, questions, question_type }
 * questions: Array of { question_id, code }
 * @returns {Promise<Object>} - Success or error object
 */
// async function resumeTest({ student_id, course_id, unit_id, sub_unit_id, questions, question_type, attempt }) {
//     try {
//         // Prepare payloads for all questions
//         const now = new Date().toISOString();
//         const payloads = questions.map(q => ({
//             student_id,
//             course_id,
//             unit_id,
//             sub_unit_id,
//             question_id: q.question_id,
//             last_submitted_code: q.code,
//             status: "resumed",
//             attempt,
//             last_submission: now
//         }));
//         // Upsert all submissions
//         const { data, error } = await supabaseClient
//             .from('student_submission')
//             .upsert(payloads, {
//                 onConflict: ['student_id', 'course_id', 'unit_id', 'sub_unit_id', 'question_id', 'attempt']
//             })
//             .select();
//         if (error) {
//             return { success: false, message: "Failed to save last submissions", error };
//         }
//         // Optionally update resume status in resumes table
//         let resumeUpdate = {};
//         if (question_type === "Coding") {
//             resumeUpdate = { subunit_coding_status: "resumed" };
//         } else if (question_type === "MCQ") {
//             resumeUpdate = { subunit_mcq_status: "resumed" };
//         }
//         if (Object.keys(resumeUpdate).length > 0) {
//             await supabaseClient
//                 .from("resumes")
//                 .update(resumeUpdate)
//                 .eq("student_id", student_id)
//                 .eq("course_id", course_id)
//                 .eq("unit_id", unit_id)
//                 .eq("sub_unit_id", sub_unit_id);
//         }
//         const e_data = await encryptData(data);
//         return { success: true, message: "Test resumed and last submissions saved", data: e_data };
//     } catch (error) {
//         return { success: false, message: "Unexpected error occurred", error };
//     }
// }


async function resumeTest({ student_id, course_id, unit_id, sub_unit_id, questions, question_type, attempt }) {
    try {
        const now = new Date().toISOString();

        // Step 1: Insert rows if not exist
        const insertPayloads = questions.map(q => ({
            student_id,
            course_id,
            unit_id,
            sub_unit_id,
            question_id: q.question_id,
            last_submitted_code: q.code,
            status: "resumed", // default, but may not overwrite later
            attempt,
            last_submission: now
        }));

        // Insert ignoring duplicates
        const { error: insertError } = await supabaseClient
            .from("student_submission")
            .insert(insertPayloads, { upsert: false });

        if (insertError && insertError.code !== "23505") { // 23505 = duplicate error
            return { success: false, message: "Failed to insert submissions", error: insertError };
        }

        // Step 2: Update only non-submitted rows
        for (const q of questions) {
            const { error: updateError } = await supabaseClient
                .from("student_submission")
                .update({
                    last_submitted_code: q.code,
                    last_submission: now,
                    // only update status if it's not already "submitted"
                    status: "resumed"
                })
                .eq("student_id", student_id)
                .eq("course_id", course_id)
                .eq("unit_id", unit_id)
                .eq("sub_unit_id", sub_unit_id)
                .eq("question_id", q.question_id)
                .eq("attempt", attempt)
                .neq("status", "submitted"); // 👈 key condition

            if (updateError) {
                return { success: false, message: "Failed to update submissions", error: updateError };
            }
        }

        // Step 3: Update resume table
        let resumeUpdate = {};
        if (question_type === "Coding") {
            resumeUpdate = { subunit_coding_status: "resumed" };
        } else if (question_type === "MCQ") {
            resumeUpdate = { subunit_mcq_status: "resumed" };
        }

        if (Object.keys(resumeUpdate).length > 0) {
            await supabaseClient
                .from("resumes")
                .update(resumeUpdate)
                .eq("student_id", student_id)
                .eq("course_id", course_id)
                .eq("unit_id", unit_id)
                .eq("sub_unit_id", sub_unit_id);
        }

        return { success: true, message: "Test resumed and last submissions saved" };
    } catch (error) {
        return { success: false, message: "Unexpected error occurred", error };
    }
}




// async function saveMCQSubmission({ student_id, course_id, unit_id, sub_unit_id, questions, question_type, attempt }) {
//     try {

//         const unitPath = `EduCode/Courses/${course_id}/units/${unit_id}/sub-units/${sub_unit_id}/mcq`;

//         const questionToMarkMap = {};

//         questions.map(q => {
//             const questionRef = ref(db, `${unitPath}/${q.question_id}/options`);
//             get(questionRef).then((snapshot) => {
//                 if (snapshot.exists()) {
//                     const options = snapshot.val();
//                     if (!options || !Array.isArray(options) || q.code < 0 || q.code >= options.length) {
//                         throw new Error(`Invalid option index for question_id: ${q.question_id}`);
//                     }
//                     if (options[q.code].isAnswer) {
//                         questionToMarkMap[q.question_id] = true;
//                     }
//                 }
//             });
//         });

//         // Prepare payloads for all questions
//         const now = new Date().toISOString();
//         const payloads = questions.map(q => ({
//             student_id,
//             course_id,
//             unit_id,
//             sub_unit_id,
//             question_id: q.question_id,
//             last_submitted_code: q.code,
//             status: "submitted",
//             score: questionToMarkMap[q.question_id] ? 1 : 0, // Assuming each MCQ is worth 10 marks
//             attempt,
//             last_submission: now
//         }));
//         // Upsert all submissions
//         const { data, error } = await supabaseClient
//             .from('student_submission')
//             .upsert(payloads, {
//                 onConflict: ['student_id', 'course_id', 'unit_id', 'sub_unit_id', 'question_id', 'attempt']
//             })
//             .select();
//         if (error) {
//             return { success: false, message: "Failed to save last submissions", error };
//         }
//         const e_data = await encryptData(data);
//         return { success: true, message: "MCQ last submissions saved", data: e_data, questionToMarkMap, payloads };
//     } catch (error) {
//         return { success: false, message: "Unexpected error occurred", error };
//     }
// }




// Function to check security code for a test

async function saveMCQSubmission({ student_id, course_id, unit_id, sub_unit_id, questions, question_type, attempt }) {
    try {
        const unitPath = `EduCode/Courses/${course_id}/units/${unit_id}/sub-units/${sub_unit_id}/mcq`;
        const questionToMarkMap = {};

        // Fetch options for all questions concurrently
        await Promise.all(
            questions.map(async (q) => {
                const questionRef = ref(db, `${unitPath}/${q.question_id}/options`);
                const snapshot = await get(questionRef);

                if (snapshot.exists()) {
                    const options = snapshot.val();
                    if (!options || !Array.isArray(options) || q.code < 0 || q.code >= options.length) {
                        throw new Error(`Invalid option index for question_id: ${q.question_id}`);
                    }

                    if (q.code && options[q.code].isAnswer) {
                        questionToMarkMap[q.question_id] = true;
                    }
                }
            })
        );

        // Prepare payloads for all questions
        const now = new Date().toISOString();
        const payloads = questions.map(q => ({
            student_id,
            course_id,
            unit_id,
            sub_unit_id,
            question_id: q.question_id,
            last_submitted_code: q.code,
            status: "submitted",
            score: questionToMarkMap[q.question_id] ? 1 : 0, // ✅ now correct
            attempt,
            last_submission: now
        }));

        // Upsert all submissions
        const { data, error } = await supabaseClient
            .from('student_submission')
            .upsert(payloads, {
                onConflict: ['student_id', 'course_id', 'unit_id', 'sub_unit_id', 'question_id', 'attempt']
            })
            .select();

        if (error) {
            return { success: false, message: "Failed to save last submissions", error };
        }

        const e_data = await encryptData(data);
        return { success: true, message: "MCQ last submissions saved", data: e_data };

    } catch (error) {
        return { success: false, message: "Unexpected error occurred", error };
    }
}




/**
 * Checks if the provided security code matches the one in Firebase for the given course/unit/subunit
 * @param {string} courseId
 * @param {string} unitId
 * @param {string} subUnitId
 * @param {string} securityCode
 * @returns {Promise<{ testAllowed: boolean }>} - { testAllowed: true/false }
 */
async function checkTestSecurityCode(courseId, unitId, subUnitId, securityCode) {
    try {
        const codeRef = ref(db, `EduCode/Courses/${courseId}/units/${unitId}/sub-units/${subUnitId}/security_code`);
        const snapshot = await get(codeRef);
        if (!snapshot.exists()) {
            return { success: false, testAllowed: false };
        }
        const storedCode = snapshot.val();
        const e_data = await encryptData({ testAllowed: storedCode === securityCode });
        return { success: true, data: e_data };
    } catch (error) {
        return { success: false, testAllowed: false };
    }
}

export {
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
    checkTestSecurityCode,
    uploadStudentResource,
    saveMCQSubmission,
    autosave,
    getAllowedAttempts,
    updateAttemptCount,
    resetAllAttempts
};