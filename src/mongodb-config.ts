import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongodburi = process.env.MONGODB_URI
const mongodbname = process.env.MONGODB_NAME

export const connectDB = async () => {
  try {
    const connect = await mongoose.connect(mongodburi as string, {
        dbName: mongodbname,
        connectTimeoutMS: 360000,
        socketTimeoutMS: 360000,
        serverSelectionTimeoutMS: 30000,
    });
    console.log(`MongoDB Connected: ${connect.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

mongoose.connection.on("connected", () => console.log("MongoDB connected"));
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB connected");
  setTimeout(connectDB, 6000);
});
mongoose.connection.on("error", (err) =>
  console.error("MongoDB connection error:", err)
);
