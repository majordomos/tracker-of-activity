"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const passport_1 = __importDefault(require("passport"));
const body_parser_1 = __importDefault(require("body-parser"));
const routes_1 = __importDefault(require("./routes/routes"));
const secure_routes_1 = __importDefault(require("./routes/secure-routes"));
const redis_1 = __importDefault(require("redis"));
require('./auth/auth');
mongoose_1.default.connect('mongodb://127.0.0.1/tracker-of-activity');
mongoose_1.default.connection.on('error', error => console.log(error));
mongoose_1.default.Promise = global.Promise;
const redisClient = redis_1.default.createClient({
    host: '127.0.0.1',
    port: 6379
});
redisClient.on('error', (error) => {
    console.error(error);
});
const app = (0, express_1.default)();
const port = 3000;
app.use(passport_1.default.initialize());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use('/', routes_1.default);
app.use('/', passport_1.default.authenticate('jwt', { session: false }), secure_routes_1.default);
app.listen(port, () => {
    console.log(`Server started at ${port}.`);
});
exports.default = redisClient;
