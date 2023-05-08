"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = require("express-rate-limit");
class Server {
    constructor() {
        this.defaultRateLimit = (0, express_rate_limit_1.rateLimit)({
            windowMs: 5 * 60 * 1000,
            max: 100,
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app = (0, express_1.default)();
        dotenv_1.default.config();
        this.plugins();
        this.routes();
    }
    // plugins
    plugins() {
        this.app.use((0, cors_1.default)({}));
        this.app.use((0, cookie_parser_1.default)());
        this.app.use((0, helmet_1.default)());
        this.app.use((0, compression_1.default)());
        this.app.use(express_1.default.json());
        this.app.use(this.defaultRateLimit);
    }
    //   routing
    routes() {
        this.app.get("/", (request, response) => {
            response.status(200).send("Api is ready to use");
        });
    }
    start() {
        const PORT = process.env.PORT || 5000;
        this.app.listen(PORT, () => console.log(`server running on port ${PORT}`));
    }
}
const server = new Server();
server.start();
