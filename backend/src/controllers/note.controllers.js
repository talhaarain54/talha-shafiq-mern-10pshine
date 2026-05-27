import Note from "../models/Note.model.js";
import logger from "../utils/logger.js";
import asyncHandler from "../utils/asyncHandler.js";

const getNotes = asyncHandler(async (req, res) => {
    const { search, tag, sort = "updatedAt" } = req.query;

    let query = { user: req.user._id, is_deleted: false };

    if (search) {
        query.$or = [
            {
                title: {
                    $regex: search,
                    $options: "i",
                },
            },
            {
                content: {
                    $regex: search,
                    $options: "i",
                },
            },
        ];
}
    if (tag) query.tags = tag;

    const sortOptions = {
        updatedAt: { updatedAt: -1 },
        createdAt: { createdAt: -1 },
        title: { title: 1 },
        "title-desc": { title: -1 },
    };

    const notes = await Note.find(query).sort(sortOptions[sort] || { updatedAt: -1 });

    res.status(200).json({ success: true, count: notes.length, data: notes });
});

const getTrashedNotes = asyncHandler(async (req, res, next) => {
    const notes = await Note.find({
        user: req.user._id,
        is_deleted: true,
    }).sort({ deletedAt: -1 });

    res.status(200).json({ success: true, data: notes });
});

const getNoteById = asyncHandler(async (req, res, next) => {
    const note = await Note.findOne({
        _id: req.params.id,
        user: req.user._id,
        is_deleted: false,
    });

    if (!note) {
        logger.warn(
            { noteId: req.params.id, userId: req.user.id },
            "Attempted to access non-existent or unauthorized note",
        );
        return res.status(404).json({
            success: false,
            message: "Note not found or you do not have permission to view it",
        });
    }

    res.status(200).json({
        success: true,
        data: note,
    });
});

const createNote = asyncHandler(async (req, res, next) => {
    logger.info("Create note called", req.body);
    const note = await Note.create({
        ...req.body,
        user: req.user._id,
    });

    logger.info({ noteId: note._id, userId: req.user._id }, "Note created");
    res.status(201).json({ success: true, data: note });
});

const updateNote = asyncHandler(async (req, res, next) => {
    const note = await Note.findOneAndUpdate(
        {
            _id: req.params.id,
            user: req.user._id,
            is_deleted: false,
        },
        req.body,
        { returnDocument: 'after', runValidators: true },
    );

    if (!note) {
        return res.status(404).json({ success: false, message: "Note not found" });
    }

    logger.info({ noteId: note._id }, "Note updated");
    res.status(200).json({ success: true, data: note });
});

const trashNote = asyncHandler(async (req, res, next) => {
    const note = await Note.findOneAndUpdate(
        {
            _id: req.params.id,
            user: req.user._id,
            is_deleted: false,
        },
        { is_deleted: true, deletedAt: new Date() },
        { returnDocument: 'after' },
    );

    if (!note) {
        return res.status(404).json({ success: false, message: "Note not found" });
    }

    logger.info({ noteId: note._id }, "Note moved to trash");
    res.status(200).json({ success: true, message: "Note moved to trash" });
});

const restoreNote = asyncHandler(async (req, res, next) => {
    const note = await Note.findOneAndUpdate(
        {
            _id: req.params.id,
            user: req.user._id,
            is_deleted: true,
        },
        { is_deleted: false, deletedAt: null },
        { returnDocument: 'after' },
    );

    if (!note) {
        return res.status(404).json({ success: false, message: "Note not found" });
    }

    logger.info({ noteId: note._id }, "Note restored from trash");
    res.status(200).json({ success: true, data: note });
});

const deleteNotePermanently = asyncHandler(async (req, res, next) => {
    const note = await Note.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!note) {
        return res.status(404).json({ success: false, message: "Note not found" });
    }

    logger.info({ noteId: req.params.id }, "Note permanently deleted");
    res.status(200).json({ success: true, message: "Note permanently deleted" });
});

const getUserTags = asyncHandler(async (req, res) => {
    const tags = await Note.aggregate([
        { $match: { user: req.user._id, is_deleted: false } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, tag: "$_id", count: 1 } },
    ]);
    res.status(200).json({ success: true, data: tags });
});

export {
    createNote,
    updateNote,
    getNoteById,
    getNotes,
    getUserTags,
    getTrashedNotes,
    trashNote,
    restoreNote,
    deleteNotePermanently,
};
