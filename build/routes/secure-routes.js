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
const model_1 = require("../model/model");
const index_1 = __importDefault(require("../index"));
const router = express_1.default.Router();
router.post('/start-work', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let currentUser = '';
    if (req) {
        currentUser = req.user.username;
    }
    const currentTime = (0, moment_1.default)().format("ddd MMM D YYYY kk:mm:ss");
    const endTime = new Date(0);
    const timeDiff = 0;
    if (!currentUser) {
        return res.status(403).send('Unauthorized');
    }
    const lastTrack = yield model_1.trackModel.findOne({ end_time: endTime, username: currentUser });
    if (!lastTrack) {
        const newTrack = yield model_1.trackModel.create({ start_time: currentTime, end_time: endTime, username: currentUser, time_diff: timeDiff });
        res.status(200).send(`start moment: ${currentTime} for ${currentUser}`);
    }
    else
        res.status(200).send(`You did not finished last track`);
}));
router.post('/end-work', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let currentUser = '';
    if (req) {
        currentUser = req.user.username;
    }
    const currentTime = new Date((0, moment_1.default)().format("ddd MMM D YYYY kk:mm:ss"));
    const endTime = new Date(0);
    let timeDiff = 0;
    const workHours = (start_time, end_time) => {
        return moment_1.default.duration((0, moment_1.default)(end_time, 'ddd MMM DD YYYY kk:mm:ss').diff((0, moment_1.default)(start_time, 'ddd MMM DD YYYY kk:mm:ss'))).asHours();
    };
    if (currentUser) {
        const lastTrack = yield model_1.trackModel.findOne({ end_time: endTime, username: currentUser });
        if (lastTrack) {
            timeDiff = workHours(lastTrack.start_time, currentTime);
            const time = yield model_1.trackModel.updateOne({ end_time: { $eq: endTime }, username: { $eq: currentUser } }, { end_time: currentTime, time_diff: timeDiff });
            res.status(200).send(`end moment: ${currentTime} for ${currentUser}`);
        }
        else
            res.status(200).send(`You have no unfineshed tracks`);
    }
}));
router.get('/work-time', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const fromDate = (_a = (req.query['from-date'])) === null || _a === void 0 ? void 0 : _a.toString();
    const toDate = (_b = (req.query['to-date'])) === null || _b === void 0 ? void 0 : _b.toString();
    let currentUser = '';
    if (req) {
        currentUser = req.user.username;
    }
    const keyValue = `${currentUser}${fromDate}${toDate}`;
    index_1.default.get(keyValue, (err, sum) => __awaiter(void 0, void 0, void 0, function* () {
        if (sum) {
            return res.status(200).send(`number of hours: ${Math.floor(parseInt(sum))}`);
        }
        let allTracks = [];
        if (toDate && fromDate) {
            const toDateFormatted = new Date(new Date(toDate).setHours(23, 59, 59));
            const fromDateFormatted = new Date(new Date(fromDate).setHours(0, 0, 0));
            allTracks = yield model_1.trackModel.find({ username: currentUser, start_time: { $gte: fromDateFormatted }, end_time: { $lte: toDateFormatted } }).lean();
        }
        let sumOfHours = 0;
        let counter = allTracks.length;
        while (counter--) {
            if (allTracks)
                sumOfHours += allTracks[counter].time_diff;
            else
                break;
        }
        index_1.default.set(keyValue, JSON.stringify(sumOfHours));
        return res.status(200).send(`number of hours: ${Math.floor(sumOfHours)}`);
    }));
}));
exports.default = router;
