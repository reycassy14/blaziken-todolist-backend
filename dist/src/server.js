"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const morgan_1 = __importDefault(require("morgan"));
const routes_1 = __importDefault(require("./routes"));
const mongodb_config_1 = require("./mongodb-config");
const PORT = process.env.PORT || 3000;
const server = (0, express_1.default)();
server.use((0, cors_1.default)());
server.use((0, morgan_1.default)('dev'));
server.use(express_1.default.json());
server.use(express_1.default.urlencoded({ extended: true }));
server.use('/api', routes_1.default);
(0, mongodb_config_1.connectDB)();
server.listen(PORT, () => {
    console.log(`TODO API is Running!! at PORT: ${PORT}`);
});
exports.default = server;
//# sourceMappingURL=server.js.map