import {
    addBatch,
    getAllBatches,
    getBatchesByUniversityId,
    getBatchById,
    updateBatch,
    deleteBatch
} from "./batches-database.js";

// This section contains the controller functions for handling requests related to batches.
////////////////////////////////////////////////////////////////////////////////////////////////////////////




// Controller to handle adding a new batch
async function handleAddBatch(req, res) {
    try {
        const batch = req.body; // Assuming the batch data is sent in the request body
        const result = await addBatch(batch);
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleAddBatch:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching all batches
async function handleGetAllBatches(req, res) {
    try {
        const result = await getAllBatches();
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleGetAllBatches:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching batches by university ID
async function handleGetBatchesByUniversityId(req, res) {
    try {
        const { universityId } = req.params; // Assuming the university ID is sent as a URL parameter
        const result = await getBatchesByUniversityId(universityId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result); // Return 404 if no batches are found
        }
    } catch (error) {
        console.error("Error in handleGetBatchesByUniversityId:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle fetching a batch by batch ID
async function handleGetBatchById(req, res) {
    try {
        const { batchId } = req.params; // Assuming the batch ID is sent as a URL parameter
        const result = await getBatchById(batchId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result); // Return 404 if the batch is not found
        }
    } catch (error) {
        console.error("Error in handleGetBatchById:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle updating a batch
async function handleUpdateBatch(req, res) {
    try {
        const { batchId } = req.params; // Assuming the batch ID is sent as a URL parameter
        const fieldsToUpdate = req.body; // Assuming the fields to update are sent in the request body
        const result = await updateBatch(batchId, fieldsToUpdate);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleUpdateBatch:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

// Controller to handle deleting a batch
async function handleDeleteBatch(req, res) {
    try {
        const { batchId } = req.params; // Assuming the batch ID is sent as a URL parameter
        const result = await deleteBatch(batchId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error in handleDeleteBatch:", error);
        res.status(500).json({ success: false, message: "Unexpected error occurred", error });
    }
}

















// This section contains the controller functions for handling requests related to batches.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////




// Export all controllers at once
export {
    handleAddBatch,
    handleGetAllBatches,
    handleGetBatchesByUniversityId,
    handleGetBatchById,
    handleUpdateBatch,
    handleDeleteBatch
};