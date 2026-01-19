import mongoose from "mongoose";

const GameGuessSchema = new mongoose.Schema(
  {
    game_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
      index: true,
    },

    challenge_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
      index: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    selected_index: {
      type: Number,
      required: true,
    },

    is_correct: {
      type: Boolean,
      required: true,
    },

    points_earned: {
      type: Number,
      default: 0,
    },

    guessed_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one guess per user per challenge
GameGuessSchema.index({ game_id: 1, challenge_id: 1, user_id: 1 }, { unique: true });

export default mongoose.model("GameGuess", GameGuessSchema);
