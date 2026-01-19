import mongoose from "mongoose";
import {
    CHALLENGE_VISIBILITY,
    CHALLENGE_STATUS,
} from "../../constants/enums.js";

const StatementSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },
        is_cap: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

const ChallengeSchema = new mongoose.Schema(
    {
        chain_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chain",
            default: null,
            index: true,
        },

        creator_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        parent_challenge_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Challenge",
            default: null,
            index: true,
        },

        prompt: {
            type: String,
            default: null,
            trim: true,
        },

        statements: {
            type: [StatementSchema],
            validate: {
                validator: function (arr) {
                    const capCount = arr.filter((s) => s.is_cap).length;
                    return arr.length >= 3 && arr.length <= 10 && capCount === 1;
                },
                message: "Challenge must have 3–10 statements and exactly 1 Cap",
            },
        },

        theme: {
            type: String,
            default: null,
            maxlength: 50,
        },

        media: {
            image_url: { type: String, default: null },
            voice_url: { type: String, default: null },
        },

        visibility: {
            type: String,
            enum: Object.values(CHALLENGE_VISIBILITY),
            default: CHALLENGE_VISIBILITY.DIRECT,
            index: true,
        },

        total_guesses: {
            type: Number,
            default: 0,
        },

        correct_guesses: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: Object.values(CHALLENGE_STATUS),
            default: CHALLENGE_STATUS.DRAFT,
            index: true,
        },

        is_reported: {
            type: Boolean,
            default: false,
            index: true,
        },

        reported_count: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Challenge", ChallengeSchema);
