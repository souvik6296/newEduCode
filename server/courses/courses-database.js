import supabaseClient from "../supabase-client.js";
import { deleteCourseDetails } from "../units and questions/firebase-database-connection.js";

// Function to insert a new course
async function insertCourse(course) {
    try {
        const { data, error } = await supabaseClient
            .from("courses")
            .insert([course])
            .select("course_id"); // This returns the course_id of the inserted course;

        if (error) {
            console.error("Error inserting course:", error);
            return { success: false, message: "Failed to insert course", error };
        }

        const courseId = data?.[0]?.course_id;

        console.log("Course inserted successfully:", data);
        return { success: true, message: "Course inserted successfully", courseId };
    } catch (err) {
        console.error("Unexpected error during course insertion:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Function to get all courses
async function getAllCourses() {
    try {
        const { data, error } = await supabaseClient
            .from("courses")
            .select("*");

        if (error) {
            console.error("Error fetching all courses:", error);
            return { success: false, message: "Failed to fetch courses", error };
        }

        return { success: true, message: "Courses fetched successfully", data };
    } catch (err) {
        console.error("Unexpected error during fetching courses:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Function to get a course by course_id
async function getCourseById(courseId) {
    try {
        const { data, error } = await supabaseClient
            .from("courses")
            .select("*")
            .eq("course_id", courseId)
            .single();

        if (error) {
            console.error("Error fetching course by ID:", error);
            return { success: false, message: "Failed to fetch course", error };
        }

        return { success: true, message: "Course fetched successfully", data };
    } catch (err) {
        console.error("Unexpected error during fetching course by ID:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Function to update a course
async function updateCourse(courseId, fieldsToUpdate) {
    try {
        const { data, error } = await supabaseClient
            .from("courses")
            .update(fieldsToUpdate)
            .eq("course_id", courseId);

        if (error) {
            console.error("Error updating course:", error);
            return { success: false, message: "Failed to update course", error };
        }

        console.log("Course updated successfully:", data);
        return { success: true, message: "Course updated successfully", data };
    } catch (err) {
        console.error("Unexpected error during course update:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Function to delete a course
async function deleteCourse(courseId) {
    try {
        const { data, error } = await supabaseClient
            .from("courses")
            .delete()
            .eq("course_id", courseId);

        if (error) {
            console.error("Error deleting course:", error);
            return { success: false, message: "Failed to delete course", error };
        }

        // try {
        //     const courseRef = ref(db, `EduCode/Courses/${courseId}`);
        //     await remove(courseRef);
        //     console.log("Course deleted successfully:", data);
        //     return { success: true, message: "Course deleted successfully", data };
        // } catch (error) {
        //     console.error("Error deleting course:", error);
        //     return { success: false, message: "Failed to delete course", error };
        // }

        const r = await deleteCourseDetails(courseId);
        const er = r.error;
        if (r.success) {
            console.log("Course deleted successfully:", data);
            return { success: true, message: "Course deleted successfully", data };

        } else {
            console.error("Error deleting course:", r.error);
            return { success: false, message: "Failed to delete course",  er};
        }
    } catch (err) {
        console.error("Unexpected error during course deletion:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Function to get courses by batch_id
async function getCoursesByBatchId(batchId) {
    try {
        const { data, error } = await supabaseClient
            .from("courses")
            .select("*")
            .eq("batch_id", batchId);

        if (error) {
            console.error("Error fetching courses by batch ID:", error);
            return { success: false, message: "Failed to fetch courses by batch ID", error };
        }

        return { success: true, message: "Courses fetched successfully by batch ID", data };
    } catch (err) {
        console.error("Unexpected error during fetching courses by batch ID:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Export all functions
export {
    insertCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getCoursesByBatchId
};