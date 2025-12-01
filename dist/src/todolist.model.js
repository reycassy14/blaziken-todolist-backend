"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoList = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
//mongoose Schema
const schema = new mongoose_1.default.Schema({
    title: { type: String, requred: [true, 'Title is Required'] },
    description: { type: String, default: '' },
    isCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });
exports.TodoList = mongoose_1.default.model('TodoList', schema);
//# sourceMappingURL=todolist.model.js.map