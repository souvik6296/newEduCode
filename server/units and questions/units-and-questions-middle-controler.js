import {
    addCourse,
    getCourse,
    updateCourse,
    deleteCourseDetails,
    addUnit,
    getUnits,
    updateUnit,
    deleteUnit,
    addSubUnit,
    getSubUnits,
    updateSubUnit,
    deleteSubUnit
} from "./firebase-database-connection.js";


// Controller to handle adding a new course
async function handleAddCourse(req, res) {
    try {
        const { courseId, courseData } = req.body; // Expecting courseId and courseData in the request body
        const result = await addCourse(courseId, courseData);
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleAddCourse:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching a course by course ID
async function handleGetCourse(req, res) {
    try {
        const { courseId } = req.params; // Expecting courseId as a URL parameter
        const result = await getCourse(courseId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result); // Return 404 if the course is not found
        }
    } catch (error) {
        console.error("Error in handleGetCourse:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle updating a course
async function handleUpdateCourse(req, res) {
    try {
        const { courseId } = req.params; // Expecting courseId as a URL parameter
        const updates = req.body; // Expecting updates in the request body
        const result = await updateCourse(courseId, updates);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleUpdateCourse:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle deleting a course
async function handleDeleteCourse(req, res) {
    try {
        const { courseId } = req.params; // Expecting courseId as a URL parameter
        const result = await deleteCourseDetails(courseId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleDeleteCourse:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle adding a unit to a course
async function handleAddUnit(req, res) {
    try {
        const { courseId, unitData } = req.body;
        console.log(JSON.stringify(req.body)); // Expecting courseId and unitData in the request body
        const result = await addUnit(courseId, unitData);
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleAddUnit:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching all units of a course
async function handleGetUnits(req, res) {
    try {
        const { courseId } = req.params; // Expecting courseId as a URL parameter
        const result = await getUnits(courseId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result); // Return 404 if no units are found
        }
    } catch (error) {
        console.error("Error in handleGetUnits:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle updating a unit
async function handleUpdateUnit(req, res) {
    try {
        const { courseId, unitId } = req.params; // Expecting courseId and unitId as URL parameters
        const updates = req.body; // Expecting updates in the request body
        const result = await updateUnit(courseId, unitId, updates);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleUpdateUnit:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle deleting a unit
async function handleDeleteUnit(req, res) {
    try {
        const { courseId, unitId } = req.params; // Expecting courseId and unitId as URL parameters
        const result = await deleteUnit(courseId, unitId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleDeleteUnit:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle adding a sub-unit to a unit
async function handleAddSubUnit(req, res) {
    try {
        const { courseId, unitId, subUnitData } = req.body; // Expecting courseId, unitId, and subUnitData in the request body
        const result = await addSubUnit(courseId, unitId, subUnitData);
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleAddSubUnit:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching all sub-units of a unit
async function handleGetSubUnits(req, res) {
    try {
        const { courseId, unitId } = req.params; // Expecting courseId and unitId as URL parameters
        const result = await getSubUnits(courseId, unitId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result); // Return 404 if no sub-units are found
        }
    } catch (error) {
        console.error("Error in handleGetSubUnits:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle updating a sub-unit
async function handleUpdateSubUnit(req, res) {
    try {
        const { courseId, unitId, subUnitId } = req.params; // Expecting courseId, unitId, and subUnitId as URL parameters
        const updates = req.body; // Expecting updates in the request body
        const result = await updateSubUnit(courseId, unitId, subUnitId, updates);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleUpdateSubUnit:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle deleting a sub-unit
async function handleDeleteSubUnit(req, res) {
    try {
        const { courseId, unitId, subUnitId } = req.params; // Expecting courseId, unitId, and subUnitId as URL parameters
        const result = await deleteSubUnit(courseId, unitId, subUnitId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleDeleteSubUnit:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Export all controllers
export {
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
    handleDeleteSubUnit
};
