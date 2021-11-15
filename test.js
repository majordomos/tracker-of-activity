const moment = require('moment');
// console.log(moment.duration('23:59:59').hours());
let fromDate = '2021-11-15';
let toDate = '2021-11-18';
let end_time = 'Wed Nov 17 2021 22:24:36';
let end_time1 = 'Wed Nov 18 2021 23:00:00';
console.log(moment(end_time, 'ddd MMM DD YYYY kk:mm:ss').isBefore(moment(toDate), 'day'));
// console.log(moment.duration(moment(toDate).diff(moment(fromDate))).asHours());