import {
    createTeacher,
    getTeacherById,
    getTeacherByEmail,
    updateTeacher,
    deleteTeacher,
    loginTeacher,
    verifyTeacherSession,
    updateExamRoomAndStudents,
    createToken,
    getToken,
    getStudentList
} from "./teacher-database.js";


// Middleware to verify teacher session
async function verifyTeacherAuth(token, teacherId) {
    try {
        const isValidSession = await verifyTeacherSession(token, teacherId);
        return isValidSession;
    } catch (error) {
        console.error('Auth middleware error:', error);
        return false;
    }
}

// Create new teacher
async function handleCreateTeacher(req, res) {
    try {
        const {
            teacher_name,
            uni_reg_id,
            teacher_email,
            teacher_phone,
            password,
            university_id
        } = req.body;

        if (!teacher_name || !uni_reg_id || !teacher_email || !teacher_phone || !password || !university_id) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const result = await createTeacher({
            teacher_name,
            uni_reg_id,
            teacher_email,
            teacher_phone,
            password,
            university_id
        });

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
}

// Teacher login
async function handleTeacherLogin(req, res) {
    try {
        const { regId, password } = req.body;

        if (!regId || !password) {
            return res.status(400).json({ success: false, message: "Registration ID and password required" });
        }

        const result = await loginTeacher(regId, password);
        if (!result.success) {
            return res.status(401).json(result);
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
}

// Get teacher profile
async function handleGetTeacherProfile(req, res) {
    try {
        const token = req.headers['authorization']?.split(' ')[1]; // Bearer token
        const teacherId = req.headers['teacherid'];      // custom header
        const enteredOTP = req.headers['verification_code'];      // custom header

        if (!token || !teacherId) {
            return res.status(401).json({
                session_expired: true,
                success: false,
                message: "Missing authentication credentials"
            });
        }
        const isValidSession = await verifyTeacherAuth(token, teacherId);
        if (!isValidSession) {
            return res.status(401).json({
                session_expired: true,
                success: false,
                message: "Invalid or expired session. Please log in again."
            });
        }

        const result = await getTeacherById(teacherId, enteredOTP);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
}

// Update teacher profile
async function handleUpdateTeacher(req, res) {
    try {
        // const token = req.headers['authorization']?.split(' ')[1]; // Bearer token
        // const teacherId = req.headers['teacherid'];      // custom header

        // if (!token || !teacherId) {
        //     return res.status(401).json({
        //         session_expired: true,
        //         success: false,
        //         message: "Missing authentication credentials"
        //     });
        // }
        // const isValidSession = await verifyTeacherAuth(token, teacherId);
        // if (!isValidSession) {
        //     return res.status(401).json({
        //         session_expired: true,
        //         success: false,
        //         message: "Invalid or expired session. Please log in again."
        //     });
        // }
        const updateFields = req.body;
        delete updateFields.teacher_id; // Prevent ID modification

        const result = await updateTeacher(teacherId, updateFields);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
}

// Delete teacher
async function handleDeleteTeacher(req, res) {
    try {
        const result = await deleteTeacher(req.params.teacherId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
}

// Update exam room and allowed students
async function handleUpdateExamRooms(req, res) {
    try {
        const { roomData } = req.body;

        if (!Array.isArray(roomData)) {
            return res.status(400).json({ success: false, message: "Invalid room data format" });
        }

        const result = await updateExamRoomAndStudents(roomData);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
}

// Get teacher by email
async function handleGetTeacherByEmail(req, res) {
    try {
        // const token = req.headers['authorization']?.split(' ')[1]; // Bearer token
        // const teacherId = req.headers['teacherid'];      // custom header

        // if (!token || !teacherId) {
        //     return res.status(401).json({
        //         session_expired: true,
        //         success: false,
        //         message: "Missing authentication credentials"
        //     });
        // }
        // const isValidSession = await verifyTeacherAuth(token, teacherId);
        // if (!isValidSession) {
        //     return res.status(401).json({
        //         session_expired: true,
        //         success: false,
        //         message: "Invalid or expired session. Please log in again."
        //     });
        // }
        const result = await getTeacherByEmail(req.params.email);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
}

// Create a token
async function handleCreateToken(req, res) {
    try {
        const { teacherId } = req.body;

        if (!teacherId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const result = await createToken(teacherId);
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
}

// Get a token
async function handleGetToken(req, res) {
    try {
        const { ID } = req.query;

        if (!ID) {
            return res.status(400).json({ success: false, message: "Missing student ID" });
        }

        const result = await getToken(ID);
        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
}

// Get student list
async function handleGetStudentList(req, res) {
    try {
        const { teacherId } = req.params;

        if (!teacherId) {
            return res.status(400).json({ success: false, message: "Missing teacher ID" });
        }

        const result = await getStudentList(teacherId);
        if (!result.success) {
            return res.status(404).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
}

export {
    handleCreateTeacher,
    handleGetTeacherProfile,
    handleGetTeacherByEmail,
    handleUpdateTeacher,
    handleDeleteTeacher,
    handleTeacherLogin,
    verifyTeacherAuth as verifyTeacher,
    handleUpdateExamRooms as handleUpdateExamRoomAndStudents,
    handleCreateToken,
    handleGetToken,
    handleGetStudentList
};