import dotenv from "dotenv";
import path from "path";

// Resolve the path to the .env file relative to the project root
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

console.log("Environment loaded from:", envPath);
