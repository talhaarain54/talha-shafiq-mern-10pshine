import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        minlength: [8, "Password must be atleast 8 characters long"],
        trim: true,
        validate: {
            validator: function (v) {
                return !v || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(v);
            },
            message: "Password is too weak! Must include upper, lower, number, and special character."
        },
        select: false,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    refreshToken: {
        type: String,
        select: false,
    },
}, { timestamps: true });


userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) return;
    this.password = await bcryptjs.hash(this.password, 12);
});


const hashUpdatePassword = async function () {
    const update = this.getUpdate();

    if (!update) return;

    if (update.password) {
        update.password = await bcryptjs.hash(update.password, 12);
    }

    if (update.$set && update.$set.password) {
        update.$set.password = await bcryptjs.hash(update.$set.password, 12);
    }

};

userSchema.pre("findOneAndUpdate", hashUpdatePassword);
userSchema.pre("updateOne", hashUpdatePassword);


userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcryptjs.compare(candidatePassword, this.password);
};


const User = mongoose.model("User", userSchema);

export default User;