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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const todolist_model_1 = require("./todolist.model");
const http_status_codes_1 = require("http-status-codes");
const routes = (0, express_1.Router)();
exports.default = routes;
routes.get('', (req, res) => {
    res.status(200).json({
        status: true,
        message: 'SUCCESS FROM API',
    });
});
//return all items
routes.get('/all-items', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todolist = yield todolist_model_1.TodoList.find().sort({ createdAt: -1 }).lean();
        res.status(http_status_codes_1.StatusCodes.OK).json({
            status: http_status_codes_1.StatusCodes.OK,
            data: todolist,
        });
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            status: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message: 'error on fetching todolist',
            error: error
        });
    }
}));
//return a single existing item
routes.get('/search-item/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const todoItem = yield todolist_model_1.TodoList.findById({ id });
        // const item = todoListdata.find(t => t.id === id)
        if (!todoItem) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                status: http_status_codes_1.StatusCodes.NOT_FOUND,
                message: 'Item Not Found',
            });
        }
        return res.status(http_status_codes_1.StatusCodes.OK).json({
            status: http_status_codes_1.StatusCodes.OK,
            data: todoItem,
        });
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            status: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message: 'error on searching todolist item',
            error: error
        });
    }
}));
//create a new item
routes.post('/create-item', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description } = req.body;
        if (!title) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                status: http_status_codes_1.StatusCodes.BAD_REQUEST,
                message: 'Title required!'
            });
        }
        const newData = new todolist_model_1.TodoList({
            title,
            description
        });
        yield newData.save();
        console.log("field: ", newData);
        return res.status(http_status_codes_1.StatusCodes.OK).json({
            status: http_status_codes_1.StatusCodes.OK,
            data: newData
        });
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            status: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message: 'error on creating todolist item',
            error: error
        });
    }
}));
//edit the description in item
routes.patch('/edit-item/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description } = req.body;
    const id = req.params.id;
    //const newTitle : ITodoListData["title"] = title;
    try {
        if (!id) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                status: http_status_codes_1.StatusCodes.NOT_FOUND,
                message: 'item not found!'
            });
        }
        const updatedFields = {};
        if (title)
            updatedFields.title = title;
        if (description)
            updatedFields.description = description;
        if (Object.keys(updatedFields).length === 0) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                status: http_status_codes_1.StatusCodes.BAD_REQUEST,
                message: "update atleast one field"
            });
        }
        const updatedItem = yield todolist_model_1.TodoList.findByIdAndUpdate(id, updatedFields, { new: true, runValidators: true });
        if (!updatedItem) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                status: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: false,
                message: 'item not found'
            });
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            status: http_status_codes_1.StatusCodes.OK,
            message: 'Title Successfully Updated',
            data: updatedItem
        });
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            status: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message: 'error on updating todolist item',
            error: error
        });
    }
}));
//update to complete
routes.patch('/toggle-item/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const currentStatus = yield todolist_model_1.TodoList.findById(id);
        if (!id) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                status: http_status_codes_1.StatusCodes.NOT_FOUND,
                success: 'false',
                message: 'item not found!'
            });
        }
        const updatedItem = yield todolist_model_1.TodoList.findByIdAndUpdate(id, { isCompleted: !(currentStatus === null || currentStatus === void 0 ? void 0 : currentStatus.isCompleted) }, { new: true });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            status: http_status_codes_1.StatusCodes.OK,
            message: `item marked as ${(updatedItem === null || updatedItem === void 0 ? void 0 : updatedItem.isCompleted) ? 'completed' : 'incomplete'}`,
            data: updatedItem
        });
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            status: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message: 'error on updating todolist item',
            error: error
        });
    }
}));
//create endpoint for delete
routes.delete('/delete-item/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        if (!id) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                status: http_status_codes_1.StatusCodes.NOT_FOUND,
                message: 'item not found!'
            });
        }
        const deletedItem = yield todolist_model_1.TodoList.findByIdAndDelete(id);
        if (!deletedItem) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                status: http_status_codes_1.StatusCodes.BAD_REQUEST,
                message: 'item already deleted!'
            });
        }
        console.log('Deleted Item: ', deletedItem);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            status: http_status_codes_1.StatusCodes.OK,
            message: 'item successfully deleted',
        });
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            status: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message: 'error on deleting todolist item',
            error: error
        });
    }
}));
//delete all completed item
routes.delete('/batch-delete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const completedItems = yield todolist_model_1.TodoList.find({ isCompleted: true }).sort({ createdAt: -1 });
        if (!completedItems.length) {
            console.log('No completed Items');
            return res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({
                status: http_status_codes_1.StatusCodes.ACCEPTED,
                message: 'No Completed Items',
                data: completedItems
            });
        }
        const result = yield todolist_model_1.TodoList.deleteMany({ isCompleted: true });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            status: http_status_codes_1.StatusCodes.OK,
            message: `Successfully Deleted ${result.deletedCount} Items`,
            deletedItems: completedItems,
        });
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            status: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message: 'error on deleting todolist item',
            error: error
        });
    }
}));
//# sourceMappingURL=routes.js.map