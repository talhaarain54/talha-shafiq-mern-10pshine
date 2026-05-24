import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		content: {
			type: String,
			default: "",
		},
		tags: {
      		type: [String],
      		default: [],
    	},
		is_deleted: {
			type: Boolean,
			default: false,
		},
		deletedAt: {
			type: Date,
			default: null,
		},
	},
	{ timestamps: true },
);

// TTL Index: Delete document 30 days (2592000 seconds) after deletedAt is set
noteSchema.index(
	{ deletedAt: 1 },
	{
		expireAfterSeconds: 2592000,
		partialFilterExpression: { is_deleted: true },
	},
);

noteSchema.index({ title: "text", content: "text" });
noteSchema.index({ user: 1, tags: 1, is_deleted: 1 });

const Note = mongoose.model("Note", noteSchema);

export default Note;
