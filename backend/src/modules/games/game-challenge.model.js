import mongoose from "mongoose";

const GameChallengeSchema = new mongoose.Schema(
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

    order: {
      type: Number,
      required: true,
    },

    started_at: {
      type: Date,
      default: null,
    },

    ended_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a challenge can only be added to a game once
GameChallengeSchema.index({ game_id: 1, challenge_id: 1 }, { unique: true });

export default mongoose.model("GameChallenge", GameChallengeSchema);
