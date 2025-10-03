import {
    insertCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getCoursesByBatchId
} from "./courses-database.js";

// Controller to handle inserting a new course
async function handleInsertCourseMetadata(req, res) {
    try {
        const course = req.body; // Assuming the course data is sent in the request body
        const result = await insertCourse(course);
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleInsertCourseMetadata:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching all courses
async function handleGetAllCoursesMetadata(req, res) {
    try {
        const result = await getAllCourses();
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleGetAllCoursesMetadata:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching a course by course ID
async function handleGetCourseByIdMetadata(req, res) {
    try {
        const { courseId } = req.params; // Assuming the course ID is sent as a URL parameter
        const result = await getCourseById(courseId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result); // Return 404 if the course is not found
        }
    } catch (error) {
        console.error("Error in handleGetCourseByIdMetadata:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle updating a course
async function handleUpdateCourseMetadata(req, res) {
    try {
        const { courseId } = req.params; // Assuming the course ID is sent as a URL parameter
        const fieldsToUpdate = req.body; // Assuming the fields to update are sent in the request body
        const result = await updateCourse(courseId, fieldsToUpdate);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleUpdateCourseMetadata:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle deleting a course
async function handleDeleteCourseMetadata(req, res) {
    try {
        const { courseId } = req.params; // Assuming the course ID is sent as a URL parameter
        const result = await deleteCourse(courseId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleDeleteCourseMetadata:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}


// Controller to handle fetching courses by batch ID
async function handleGetCoursesByBatchId(req, res) {
    try {
        const { batchId } = req.params; // Assuming the batch ID is sent as a URL parameter
        const result = await getCoursesByBatchId(batchId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result); // Return 404 if no courses are found for the batch
        }
    } catch (error) {
        console.error("Error in handleGetCoursesByBatchId:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}



// Export all controllers
export {
    handleInsertCourseMetadata,
    handleGetAllCoursesMetadata,
    handleGetCourseByIdMetadata,
    handleUpdateCourseMetadata,
    handleDeleteCourseMetadata,
    handleGetCoursesByBatchId
};