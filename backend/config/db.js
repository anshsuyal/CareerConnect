import mongoose from "mongoose";
import dns from "node:dns/promises";
import dotenv from "dotenv";
dotenv.config();

const connectDb = async () =>{
    try {
        dns.setServers(["8.8.8.8", "8.8.4.4"]);
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("db connected")
    } catch (error) {
        console.log("db error", error.message);
    }
}
export default connectDb