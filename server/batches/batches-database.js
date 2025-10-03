import supabaseClient from "../supabase-client.js";
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This section contains the database activity functions for handling requests related to batches.

// Function to add a new batch
async function addBatch(batch) {
    try {
        const { data, error } = await supabaseClient
            .from("batches")
            .insert([batch]);

        if (error) {
            console.error("Error adding batch:", error);
            return { success: false, message: "Failed to add batch", error };
        }

        console.log("Batch added successfully:", data);
        return { success: true, message: "Batch added successfully", data };
    } catch (err) {
        console.error("Unexpected error during batch addition:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Function to get all batches
async function getAllBatches() {
    try {
        const { data, error } = await supabaseClient
            .from("batches")
            .select("*");

        if (error) {
            console.error("Error fetching all batches:", error);
            return { success: false, message: "Failed to fetch batches", error };
        }

        return { success: true, message: "Batches fetched successfully", data };
    } catch (err) {
        console.error("Unexpected error during fetching batches:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Function to get batches of a particular university by university_id
async function getBatchesByUniversityId(universityId) {
    try {
        const { data, error } = await supabaseClient
            .from("batches")
            .select("*")
            .eq("university_id", universityId);

        if (error) {
            console.error("Error fetching batches by university ID:", error);
            return { success: false, message: "Failed to fetch batches", error };
        }

        return { success: true, message: "Batches fetched successfully", data };
    } catch (err) {
        console.error("Unexpected error during fetching batches by university ID:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Function to get details of a particular batch by batch_id
async function getBatchById(batchId) {
    try {
        const { data, error } = await supabaseClient
            .from("batches")
            .select("*")
            .eq("batch_id", batchId)
            .single(); // Ensures only one record is returned

        if (error) {
            console.error("Error fetching batch by ID:", error);
            return { success: false, message: "Failed to fetch batch", error };
        }

        return { success: true, message: "Batch fetched successfully", data };
    } catch (err) {
        console.error("Unexpected error during fetching batch by ID:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Function to update a batch
async function updateBatch(batchId, fieldsToUpdate) {
    try {
        const { data, error } = await supabaseClient
            .from("batches")
            .update(fieldsToUpdate)
            .eq("batch_id", batchId);

        if (error) {
            console.error("Error updating batch:", error);
            return { success: false, message: "Failed to update batch", error };
        }

        console.log("Batch updated successfully:", data);
        return { success: true, message: "Batch updated successfully", data };
    } catch (err) {
        console.error("Unexpected error during batch update:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}

// Function to delete a batch
async function deleteBatch(batchId) {
    try {
        const { data, error } = await supabaseClient
            .from("batches")
            .delete()
            .eq("batch_id", batchId);

        if (error) {
            console.error("Error deleting batch:", error);
            return { success: false, message: "Failed to delete batch", error };
        }

        console.log("Batch deleted successfully:", data);
        return { success: true, message: "Batch deleted successfully", data };
    } catch (err) {
        console.error("Unexpected error during batch deletion:", err);
        return { success: false, message: "Unexpected error occurred", error: err };
    }
}



// This section contains the database activity functions for handling requests related to batches.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////









// Export all functions at once
export {
    addBatch,
    getAllBatches,
    getBatchesByUniversityId,
    getBatchById,
    updateBatch,
    deleteBatch
};
