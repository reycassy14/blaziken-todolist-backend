import mongoose, { Document, Schema } from "mongoose";

export interface ITodoListData {
    title: string,
    description: string,
    isCompleted: boolean,
    createdAt: Date
    
}

export interface ITodoListDocument extends ITodoListData, Document{}

//mongoose Schema
const schema: Schema<ITodoListDocument> = new mongoose.Schema ({
    title: { type: String, requred: [true, 'Title is Required'] },
    description: { type: String, required: [ true, 'Description is Required'] },
    isCompleted: { type: Boolean, default: false },
    createdAt: {type: Date, default: Date.now}
    
},
    { timestamps: true })

    export const TodoList = mongoose.model<ITodoListDocument>('TodoList', schema);