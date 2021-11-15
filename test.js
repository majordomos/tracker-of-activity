const moment = require('moment');
// console.log(moment.duration('23:59:59').hours());
let fromDate = '2021-11-15';
let toDate = '2021-11-17';
let allTracks = [{
        _id: "61927bb46e2ef2c1a5ba0c60",
        start_time: 'Mon Nov 15 2021 18:24:36 GMT+0300',
        end_time: 'Mon Nov 15 2021 18:43:53',
        username: 'user',
        __v: 0
    },
    {
        _id: "619282028fd635cccc58fc2d",
        start_time: 'Mon Nov 15 2021 18:51:30',
        end_time: 'Mon Nov 15 2021 18:52:08',
        username: 'user',
        __v: 0
    },
    {
        _id: "61929afaa2fe8827a7677d1b",
        start_time: 'Mon Nov 15 2021 20:38:02',
        end_time: 'Mon Nov 15 2021 20:46:55',
        username: 'user',
        __v: 0
    },
    {
        _id: "6192b1374825dc59487dbcba",
        start_time: 'Tue Nov 16 2021 18:24:36',
        end_time: 'Tue Nov 16 2021 22:24:36',
        username: 'user'
    },
    {
        _id: "6192b14a4825dc59487dbcbb",
        start_time: 'Tue Nov 17 2021 18:24:36',
        end_time: 'Tue Nov 17 2021 22:24:36',
        username: 'user'
    }
];
allTracks = allTracks.filter(track =>
    moment().utc(track.start_time, 'YYYY-MM-DD[T]HH:mm[Z]').isAfter(moment().utc('2021-11-16', 'YYYY-MM-DD[T]HH:mm[Z]')) /* && moment(track.end_time).isBefore(moment('2021-11-17'))*/
);
console.log(allTracks);
console.log(moment().format('ddd MMM DD YYYY kk:mm:ss'));
// console.log(moment.duration(moment(toDate).diff(moment(fromDate))).asHours());