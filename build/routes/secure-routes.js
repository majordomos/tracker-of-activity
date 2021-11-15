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
const express_1 = __importDefault(require("express"));
const moment_1 = __importDefault(require("moment"));
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const model_1 = require("../model/model");
const router = express_1.default.Router();
router.post('/start-work', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.secret_token;
    const decodedToken = (0, jwt_decode_1.default)(token);
    const currentUser = decodedToken.user.username;
    const currentTime = (0, moment_1.default)().format("ddd MMM D YYYY kk:mm:ss");
    const endTime = ' ';
    const lastTrack = yield model_1.timeModel.findOne({ username: currentUser, end_time: endTime });
    if (!lastTrack) {
        const time = yield model_1.timeModel.create({ start_time: currentTime, end_time: endTime, username: currentUser });
        res.status(200).send(`start moment: ${currentTime} for ${currentUser}`);
    }
    else {
        res.status(200).send(`You did not finished last track`);
    }
}));
router.post('/end-work', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.secret_token;
    const decodedToken = (0, jwt_decode_1.default)(token);
    const currentUser = decodedToken.user.username;
    const currentTime = (0, moment_1.default)().format("ddd MMM D YYYY kk:mm:ss");
    const endTime = ' ';
    const lastTrack = yield model_1.timeModel.findOne({ username: currentUser, end_time: endTime });
    if (lastTrack) {
        const time = yield model_1.timeModel.updateOne({ end_time: { $eq: endTime }, username: { $eq: currentUser } }, { end_time: currentTime });
        res.status(200).send(`end moment: ${currentTime} for ${currentUser}`);
    }
    else {
        res.status(200).send(`You have no unfineshed tracks`);
    }
}));
router.get('/work-time', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const fromDate = req.query['from-date'];
    const toDate = req.query['to-date'];
    const token = req.body.secret_token;
    const decodedToken = (0, jwt_decode_1.default)(token);
    const currentUser = decodedToken.user.username;
    let allTracks = yield model_1.timeModel.find({ username: currentUser });
    let callTracks = [];
    if (toDate && fromDate) {
        callTracks = allTracks.filter(track => {
            console.log(`mom: ${(0, moment_1.default)(track.end_time, 'ddd MMM DD YYYY kk:mm:ss')} dad: ${(0, moment_1.default)(toDate.toString()).format('ddd MMM DD YYYY kk:mm:ss')}`);
            return (0, moment_1.default)(track.start_time, 'ddd MMM DD YYYY kk:mm:ss').isAfter(fromDate.toString())
                && (0, moment_1.default)(track.end_time, 'ddd MMM DD YYYY kk:mm:ss').isBefore((0, moment_1.default)(toDate.toString()), 'day');
        });
    }
    const sumOfHours = callTracks.reduce((prevTrack, currTrack) => {
        return moment_1.default.duration((0, moment_1.default)(prevTrack.end_time.toString()).diff((0, moment_1.default)(prevTrack.start_time.toString()))).asHours() +
            moment_1.default.duration((0, moment_1.default)(currTrack.end_time.toString()).diff((0, moment_1.default)(currTrack.start_time.toString()))).asHours();
    });
    console.log(`sum: ${sumOfHours}`);
    // if (toDate && fromDate)
    //     console.log(`diff: ${moment.duration(moment(toDate.toString()).diff(moment(fromDate.toString()))).asHours()}`);
    res.status(200);
}));
exports.default = router;
