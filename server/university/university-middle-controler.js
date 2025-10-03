import {
    getAllUniversities,
    insertUniversity,
    updateUniversity,
    deleteUniversity,
    getUniversityByUid,
    loginUniversity,
    uploadStudentsExcel
} from "./university-database.js";

//////////////////////////////////////////////////////////////////////////////////////////////

// This section contains the controller functions for handling requests related to universities.


// Controller to handle uploading students Excel file
async function handleUploadStudentsExcel(req, res) {
    try {
        const file = req.file; // File sent in the request
        const { batchId, universityId } = req.body; // Extract batch_id and university_id from the request body

        if (!file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        if (!batchId || !universityId) {
            return res.status(400).json({ success: false, message: "batchId and universityId are required" });
        }

        const result = await uploadStudentsExcel(file, batchId, universityId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleUploadStudentsExcel:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching all universities
async function handleGetAllUniversities(req, res) {
    try {
        const universities = await getAllUniversities();
        res.status(200).json({ success: true, data: universities });
    } catch (error) {
        console.error("Error in handleGetAllUniversities:", error);
        res.status(500).json({ success: false, message: "Failed to fetch universities", error });
    }
}

// Controller to handle inserting a new university
async function handleInsertUniversity(req, res) {
    try {
        const university = req.body; // Assuming the university data is sent in the request body
        const result = await insertUniversity(university);
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleInsertUniversity:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle updating a university
async function handleUpdateUniversity(req, res) {
    try {
        const { uid } = req.params; // Assuming the UID is sent as a URL parameter
        const fieldsToUpdate = req.body; // Assuming the fields to update are sent in the request body
        const result = await updateUniversity(uid, fieldsToUpdate);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleUpdateUniversity:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle deleting a university
async function handleDeleteUniversity(req, res) {
    try {
        const { uid } = req.params; // Assuming the UID is sent as a URL parameter
        const result = await deleteUniversity(uid);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleDeleteUniversity:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching a university by UID
async function handleGetUniversityByUid(req, res) {
    try {
        const { uid } = req.params; // Assuming the UID is sent as a URL parameter
        const result = await getUniversityByUid(uid);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result); // Return 404 if the university is not found
        }
    } catch (error) {
        console.error("Error in handleGetUniversityByUid:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}


// Controller to handle university login
async function handleUniversityLogin(req, res) {
    try {
        const { email, password } = req.body; // Assuming email and password are sent in the request body
        const result = await loginUniversity(email, password);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(401).json(result); // Return 401 for invalid credentials
        }
    } catch (error) {
        console.error("Error in handleUniversityLogin:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}


// This section contains the controller functions for handling requests related to universities.

///////////////////////////////////////////////////////////////////////////////////////////////////////




// Export all functions at once
export {
    handleGetAllUniversities,
    handleInsertUniversity,
    handleUpdateUniversity,
    handleDeleteUniversity,
    handleGetUniversityByUid,
    handleUniversityLogin,
    handleUploadStudentsExcel
};
