"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongodburi = process.env.MONGODB_URI;
const mongodbname = process.env.MONGODB_NAME;
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connect = yield mongoose_1.default.connect(mongodburi, {
            dbName: mongodbname,
            connectTimeoutMS: 360000,
            socketTimeoutMS: 360000,
            serverSelectionTimeoutMS: 30000,
        });
        console.log(`MongoDB Connected: ${connect.connection.host}`);
    }
    catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
});
exports.connectDB = connectDB;
mongoose_1.default.connection.on("connected", () => console.log("MongoDB connected"));
mongoose_1.default.connection.on("disconnected", () => {
    console.log("MongoDB connected");
    setTimeout(exports.connectDB, 6000);
});
mongoose_1.default.connection.on("error", (err) => console.error("MongoDB connection error:", err));
//# sourceMappingURL=mongodb-config.js.map