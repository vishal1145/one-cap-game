import mongoose from "mongoose";
import { GAME_STATUS } from "../../constants/enums.js";

const GameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    join_code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },

    max_players: {
      type: Number,
      default: 20,
      min: 2,
      max: 100,
    },

    status: {
      type: String,
      enum: Object.values(GAME_STATUS),
      default: GAME_STATUS.DRAFT,
      index: true,
    },

    started_at: {
      type: Date,
      default: null,
    },

    ended_at: {
      type: Date,
      default: null,
    },

    current_challenge_index: {
      type: Number,
      default: 0,
    },

    is_challenge_active: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique join code
GameSchema.statics.generateJoinCode = async function () {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  let exists = true;

  while (exists) {
    code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    exists = await this.findOne({ join_code: code });
  }

  return code;
};

export default mongoose.model("Game", GameSchema);
