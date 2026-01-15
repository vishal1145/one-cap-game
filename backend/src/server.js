import { app } from "./app.js";
import connectDB from "./config/db.js";

const start = async () => {
  try {
    await connectDB();
    await app.listen({
      port: process.env.PORT || 4000,
      host: "0.0.0.0",
    });
    console.log("🚀 Server running");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
