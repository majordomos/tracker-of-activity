const moment = require('moment');
// console.log(moment.duration('23:59:59').hours());
let startTime = '2021-11-15T15:00:00';

let duration = moment().diff(startTime, 'hours');
console.log(duration.asHours());