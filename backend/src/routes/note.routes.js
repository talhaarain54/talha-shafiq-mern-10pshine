import express from "express";
import {
    createNote,
    updateNote,
    getNotes,
    getTrashedNotes,
    trashNote,
    restoreNote,
    deleteNotePermanently,
    getNoteById,
    getUserTags,
    importNotes,
    exportNotes,
} from "../controllers/note.controllers.js";
import { protect } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
    createNoteSchema,
    updateNoteSchema,
} from "../validations/note.validation.js";

const router = express.Router();

router.use(protect);

router
    .route("/")
    .get(getNotes)
    .post(validate(createNoteSchema), createNote);
router.get("/tags", getUserTags);

router.get("/trash", getTrashedNotes);
router.put("/restore/:id", restoreNote);
router.delete("/permanent/:id", deleteNotePermanently);
router.post("/import", importNotes);
router.get("/export", exportNotes);

router
    .route("/:id")
    .get(getNoteById)
    .put(validate(updateNoteSchema), updateNote)
    .delete(trashNote);

export default router;
