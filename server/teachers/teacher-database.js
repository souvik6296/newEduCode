// import { supabaseClient } from '../supabase-client.js';
import supabaseClient from "../supabase-client.js";
import crypto from 'crypto';
import { ref, set, get, remove } from 'firebase/database';
import { database } from '../firebase-config.js';
import { AccessToken } from 'livekit-server-sdk';
import nodemailer from 'nodemailer';

const LIVEKIT_URL = "wss://livekit.theeducode.com";
const LIVEKIT_API_KEY = "APIeLx3SWyKp8SF";
const LIVEKIT_API_SECRET = "1dJG9HkIxtvrFajoqjNDbdWPmvN6bYgg6kfYwBIECmG";
const allowedStudentCache = {};

const db = database;

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'theeducodeofficial@gmail.com',
        pass: 'drfx jitf uioc idxn'
    }
});

// Function to generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to create HTML email template
function createOTPEmailHTML(otp, teacherName) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EduCode Login OTP</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: bold;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            .greeting {
                font-size: 18px;
                color: #333;
                margin-bottom: 20px;
            }
            .otp-container {
                background-color: #f8f9fa;
                border: 2px dashed #667eea;
                border-radius: 10px;
                padding: 30px;
                margin: 30px 0;
            }
            .otp {
                font-size: 48px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 8px;
                margin: 0;
                font-family: 'Courier New', monospace;
            }
            .otp-label {
                font-size: 14px;
                color: #666;
                margin-top: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .message {
                font-size: 16px;
                color: #555;
                line-height: 1.6;
                margin: 20px 0;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                font-size: 14px;
                color: #856404;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 EduCode</h1>
                <p>Teacher Login Verification</p>
            </div>
            <div class="content">
                <div class="greeting">
                    Hello ${teacherName || 'Teacher'}!
                </div>
                <div class="message">
                    You have requested to login to your EduCode teacher account. Please use the following One-Time Password (OTP) to complete your login:
                </div>
                <div class="otp-container">
                    <div class="otp">${otp}</div>
                    <div class="otp-label">Your Login OTP</div>
                </div>
                <div class="warning">
                    ⚠️ <strong>Important:</strong> This OTP is valid for 10 minutes only. Do not share this code with anyone for security reasons.
                </div>
                <div class="message">
                    If you didn't request this login, please ignore this email and ensure your account credentials are secure.
                </div>
            </div>
            <div class="footer">
                <p>This is an automated message from EduCode.</p>
                <p>© 2024 EduCode. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}


/**
 * Create a new teacher
 * @param {Object} teacherData - Teacher information
 * @returns {Promise<Object>} - Success or error object
 */
async function createTeacher(teacherData) {
    try {
        const { data, error } = await supabaseClient
            .from('teachers_details')
            .insert([teacherData])
            .select()
            .single();

        if (error) {
            return { success: false, message: "Failed to create teacher", error };
        }

        return { success: true, message: "Teacher created successfully", data };
    } catch (err) {
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

/**
 * Get teacher by ID
 * @param {string} teacherId - UUID of the teacher
 * @returns {Promise<Object>} - Teacher data or error
 */
// async function getTeacherById(teacherId) {
//     try {
//         const { data, error } = await supabaseClient
//             .from('teachers_details')
//             .select('*')
//             .eq('uni_reg_id', teacherId)
//             .single();

//         if (error) {
//             return { success: false, message: "Failed to fetch teacher", error };
//         }

//         return { success: true, data };
//     } catch (err) {
//         return { success: false, message: "Unexpected error occurred", error: err };
//     }
// }

async function getTeacherById(teacherId, enteredOTP = null) {
    try {
        // If OTP is provided, verify it first
        if (enteredOTP) {
            // Get OTP data from Firebase
            const teacherOTPRef = ref(db, `EduCode/Teachers/${teacherId}`);
            const otpSnapshot = await get(teacherOTPRef);
            
            if (!otpSnapshot.exists()) {
                return { success: false, message: "No OTP session found. Please login again." };
            }

            const otpData = otpSnapshot.val();

            // Check if OTP has expired
            if (Date.now() > otpData.otpExpiry) {
                // Remove expired OTP data
                await remove(teacherOTPRef);
                return { success: false, message: "OTP has expired. Please login again." };
            }

            // Check if OTP matches
            if (otpData.otp !== enteredOTP) {
                return { success: false, message: "Invalid OTP. Please try again." };
            }

            // OTP is valid, now delete the OTP key from Firebase
            const updatedData = { ...otpData };
            delete updatedData.otp;
            delete updatedData.otpExpiry;
            
            // Keep only the token and session info
            const cleanedData = {
                token: updatedData.token,
                isVerified: true,
                verifiedAt: Date.now(),
                email: updatedData.email
            };
            
            await set(teacherOTPRef, cleanedData);

            // Get teacher data from Supabase
            const { data: teacherData, error } = await supabaseClient
                .from('teachers_details')
                .select('*')
                .eq('uni_reg_id', teacherId)
                .single();

            if (error) {
                return { success: false, message: "Failed to fetch teacher data", error };
            }

            // Return success with teacher data
            const responseData = {
                ...teacherData,
                token: updatedData.token,
                session_id: updatedData.token
            };

            return { 
                success: true, 
                message: "OTP verified successfully", 
                data: responseData 
            };
        }

        // If no OTP provided, just fetch teacher data (original functionality)
        const { data, error } = await supabaseClient
            .from('teachers_details')
            .select('*')
            .eq('uni_reg_id', teacherId)
            .single();

        if (error) {
            return { success: false, message: "Failed to fetch teacher", error };
        }

        return { success: true, data };

    } catch (err) {
        console.error('Get teacher by ID error:', err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}
/**
 * Get teacher by email
 * @param {string} email - Teacher's email
 * @returns {Promise<Object>} - Teacher data or error
 */
async function getTeacherByEmail(email) {
    try {
        const { data, error } = await supabaseClient
            .from('teachers_details')
            .select('*')
            .eq('teacher_email', email)
            .single();

        if (error) {
            return { success: false, message: "Failed to fetch teacher", error };
        }

        return { success: true, data };
    } catch (err) {
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

/**
 * Update teacher information
 * @param {string} teacherId - UUID of the teacher
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} - Success or error object
 */
async function updateTeacher(teacherId, updateData) {
    try {
        const { data, error } = await supabaseClient
            .from('teachers_details')
            .update(updateData)
            .eq('uni_reg_id', teacherId)
            .select();

        if (error) {
            return { success: false, message: "Failed to update teacher", error };
        }

        return { success: true, message: "Teacher updated successfully", data };
    } catch (err) {
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

/**
 * Delete a teacher
 * @param {string} teacherId - UUID of the teacher
 * @returns {Promise<Object>} - Success or error object
 */
async function deleteTeacher(teacherId) {
    try {
        const { error } = await supabaseClient
            .from('teachers_details')
            .delete()
            .eq('uni_reg_id', teacherId);

        if (error) {
            return { success: false, message: "Failed to delete teacher", error };
        }

        return { success: true, message: "Teacher deleted successfully" };
    } catch (err) {
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

/**
 * Teacher login function
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} - Login result with token
 */
// async function loginTeacher(regId, password) {
//     try {
//         const { data, error } = await supabaseClient
//             .from('teachers_details')
//             .select('*')
//             .eq('uni_reg_id', regId)
//             .eq('password', password)
//             .single();

//         if (error || !data) {
//             return { success: false, message: "Invalid credentials" };
//         }

//         // Generate a random token
//         const token = crypto.randomBytes(32).toString('hex');

//         // Store token in Firebase
//         const teacherRef = ref(db, `EduCode/Teachers/${data.teacher_id}`);
//         await set(teacherRef, token);

//         const e_data = {
//             ...data,
//             token,
//             session_id: token // For consistency with student system
//         };

//         return {
//             success: true,
//             message: "Login successful",
//             data: e_data
//         };
//     } catch (err) {
//         console.error('Login error:', err);
//         return { success: false, message: "Unexpected error occurred", error: err };
//     }
// }


async function loginTeacher(regId, password) {
    try {
        // First, verify credentials
        const { data, error } = await supabaseClient
            .from('teachers_details')
            .select('*')
            .eq('uni_reg_id', regId)
            .eq('password', password)
            .single();

        if (error || !data) {
            return { success: false, message: "Invalid credentials" };
        }

        // Check if teacher has email
        if (!data.teacher_email) {
            return { success: false, message: "No email found for this teacher account" };
        }

        // Generate OTP
        const otp = generateOTP();

        // Generate session token
        const token = crypto.randomBytes(64).toString('hex');

        // Store both OTP and token in Firebase with expiration
        const teacherRef = ref(db, `EduCode/Teachers/${data.uni_reg_id}`);
        const otpData = {
            token: token,
            otp: otp,
            otpExpiry: Date.now() + (10 * 60 * 1000), // 10 minutes from now
            email: data.teacher_email,
            isVerified: false,
            createdAt: Date.now()
        };

        await set(teacherRef, otpData);

        // Prepare email
        const mailOptions = {
            from: {
                name: 'EduCode',
                address: 'theeducodeofficial@gmail.com'
            },
            to: data.teacher_email,
            subject: '🔐 Your EduCode Login OTP',
            html: createOTPEmailHTML(otp, data.teacher_name || data.name)
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Return success without sensitive data
        return {
            success: true,
            message: "OTP sent successfully to your registered email",
            data: {
                token,
                otpSent: true,
                sessionId: token
            }
        };

    } catch (err) {
        console.error('Login error:', err);
        return {
            success: false,
            message: "Failed to send OTP. Please try again.",
            error: err.message,
            db: db
        };
    }
}

/**
 * Verify teacher session
 * @param {string} token - Session token
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<boolean>} - Whether the session is valid
 */
async function verifyTeacherSession(token, teacherId) {
    try {
        const tref = ref(db, `EduCode/Teachers/${teacherId}/token`);
        const validToken = await get(tref);
        if (validToken.exists() && validToken.val() === token) {
            return true;
        }
        if (!validToken.exists()) {
            console.error(`No token found for teacher ${teacherId}`);
        }
        console.error(`Invalid token ${token} && ${validToken.val()}`);
        return false;
    } catch (error) {
        console.error('Error verifying teacher session:', error);
        return false;
    }
}

/**
 * Update exam room and allowed students
 * @param {Array} roomData - Array of objects with teacherId, roomId, and allowedStudents
 * @returns {Promise<Object>} - Success or error object
 */
async function updateExamRoomAndStudents(roomData) {
    try {
        const updates = roomData.map(({ teacherId, roomId, allowedStudents }) => ({
            teacher_id: teacherId,
            exam_room_name: roomId,
            students_list: allowedStudents
        }));

        const { data, error } = await supabaseClient
            .from('teachers_details')
            .upsert(updates, { onConflict: 'teacher_id' })
            .select();

        if (error) {
            return { success: false, message: "Failed to update exam rooms", error };
        }

        return { success: true, message: "Exam rooms updated successfully", data };
    } catch (err) {
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}



// const createToken = async (teacherId, studentList) => {
//     // If this room doesn't exist, it'll be automatically created when the first
//     // participant joins
//     const roomName = `room${teacherId}`;
//     // Identifier to be used for participant.
//     // It's available as LocalParticipant.identity with livekit-client SDK
//     const participantName = `teacher${teacherId}`;

//     const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
//         identity: participantName,
//         // Token to expire after 10 minutes
//         ttl: '10m',
//     });
//     at.addGrant({ roomJoin: true, room: roomName });
//     const roomToStudentList = allowedStudentCache[`roomToStudentList`] || {};

//     roomToStudentList[roomName] = studentList;
//     allowedStudentCache[`roomToStudentList`] = roomToStudentList;

//     return await at.toJwt();
// };

// const getToken = async (ID) => {



//     // return await createToken(roomName, [ID]);
//     const participantName = `${ID}`;
//     // const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
//     const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
//         identity: participantName,
//         // Token to expire after 10 minutes
//         ttl: '10m',
//     });
//     at.addGrant({ roomJoin: true, room: "room123456" });
//     const data1 = {
//         token: await at.toJwt(),
//         success: true
//     }
//     return data1;



//     // Iterate over every key of roomToStudentList and check for every list if the studentId is there join the student in that room
//     const roomToStudentList = allowedStudentCache[`roomToStudentList`] || {};
//     for (const [roomName, studentList] of Object.entries(roomToStudentList)) {
//         if (studentList.includes(ID)) {
//             // return await createToken(roomName, [ID]);
//             const participantName = `${ID}`;
//             const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
//                 identity: participantName,
//                 // Token to expire after 10 minutes
//                 ttl: '10m',
//             });
//             at.addGrant({ roomJoin: true, room: roomName });
//             const data = {
//                 token: await at.toJwt(),
//                 success: true
//             }
//             return data;
//         }
//     }
//     const data = {
//         msg: "Teacher not joined yet please wait...",
//         success: false
//     }

//     return data;
// };

async function getStudentList(teacherId) {
    try {
        // Fetch teacher's exam room name and student list from Supabase
        const { data: teacherData, error } = await supabaseClient
            .from('teachers_details')
            .select('exam_room_name, students_list')
            .eq('uni_reg_id', teacherId)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return {
                success: false,
                error: 'Failed to fetch teacher data'
            };
        }

        if (!teacherData) {
            return {
                success: false,
                error: 'Teacher not found'
            };
        }

        // Use the actual exam room name from database, fallback to generated name
        const roomName = teacherData.exam_room_name || `room${teacherId}`;
        const studentList = Array.isArray(teacherData.students_list) ? teacherData.students_list : [];

        // Update cache with the room-to-student mapping
        allowedStudentCache[roomName] = studentList;

        // Return both token and room details
        return {
            success: true,
            data: {
                studentList: studentList,
                roomName: roomName,
                studentCount: studentList.length
            }
        };

    } catch (error) {
        console.error('Error getting student list:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

const createToken = async (teacherId) => {
    try {
        // Fetch teacher's exam room name and student list from Supabase
        const { data: teacherData, error } = await supabaseClient
            .from('teachers_details')
            .select('exam_room_name, students_list')
            .eq('uni_reg_id', teacherId)
            .single();

        if (error) {
            throw error;
        }

        if (!teacherData) {
            throw new Error('Teacher not found');
        }

        // Use the actual exam room name from database, fallback to generated name
        const roomName = teacherData.exam_room_name || `room${teacherId}`;
        const studentList = teacherData.students_list || [];

        // Identifier to be used for participant.
        // It's available as LocalParticipant.identity with livekit-client SDK
        const participantName = `teacher${teacherId}`;

        const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: participantName,
            // Token to expire after 10 minutes
            ttl: '10m',
        });
        at.addGrant({ roomJoin: true, room: roomName });

        // Update cache with the room-to-student mapping
        const roomToStudentList = allowedStudentCache[`roomToStudentList`] || {};
        roomToStudentList[roomName] = studentList;
        allowedStudentCache[`roomToStudentList`] = roomToStudentList;

        // Return both token and room details
        return {
            token: await at.toJwt(),
            roomName: roomName,
            studentCount: studentList.length,
            success: true
        };

    } catch (error) {
        console.error('Error creating token:', error);
        return {
            error: error.message,
            success: false
        };
    }
};



const getToken = async (ID) => {
    // Check if cache exists and has data
    let roomToStudentList = allowedStudentCache[`roomToStudentList`] || {};

    // If cache is empty, fetch from database
    if (Object.keys(roomToStudentList).length === 0) {
        try {
            // Query to get all teachers with their exam rooms and student lists using Supabase
            const { data: teachersData, error } = await supabaseClient
                .from('teachers_details')
                .select('exam_room_name, students_list')
                .not('exam_room_name', 'is', null)
                .not('students_list', 'is', null)
                .gt('students_list', '{}'); // Filter out empty arrays

            if (error) {
                throw error;
            }

            // Build the roomToStudentList mapping
            roomToStudentList = {};
            teachersData.forEach(row => {
                if (row.exam_room_name && row.students_list && row.students_list.length > 0) {
                    roomToStudentList[row.exam_room_name] = row.students_list;
                }
            });

            // Cache the data
            allowedStudentCache[`roomToStudentList`] = roomToStudentList;

        } catch (error) {
            console.error('Error fetching room data from Supabase:', error);
            const data = {
                msg: "Error fetching room data",
                success: false
            };
            return data;
        }
    }

    // Search for student ID in cached room mappings
    for (const [roomName, studentList] of Object.entries(roomToStudentList)) {
        if (studentList.includes(ID)) {
            const participantName = `${ID}`;
            const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
                identity: participantName,
                ttl: '10m',
            });
            at.addGrant({ roomJoin: true, room: roomName });

            const data = {
                token: await at.toJwt(),
                success: true,
                roomName: roomName
            };
            return data;
        }
    }

    // Student not found in any room
    const data = {
        msg: "Student not assigned to any exam room",
        success: false
    };
    return data;
};





export {
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
};
