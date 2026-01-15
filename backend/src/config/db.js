import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    autoIndex: false, // important for scale
  });
  console.log("✅ MongoDB connected");
};

export default connectDB;
