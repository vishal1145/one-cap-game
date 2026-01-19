import mongoose from "mongoose";

const GamePlayerSchema = new mongoose.Schema(
  {
    game_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
      index: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    score: {
      type: Number,
      default: 0,
    },

    joined_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only join a game once
GamePlayerSchema.index({ game_id: 1, user_id: 1 }, { unique: true });

export default mongoose.model("GamePlayer", GamePlayerSchema);
