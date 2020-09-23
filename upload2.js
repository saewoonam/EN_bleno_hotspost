const SERVER_SYNC_URL = 'http://68.183.130.247:8000/api/encounters/debug'
const request = require('request-promise');
const request1 = require('request');

function upload_batch(batch) {
    request.post(
        SERVER_SYNC_URL,
        {
            json: {encounters: batch}
        })
        .then((val) => {
            // console.log("next");
            console.log(val);
        })
        .catch(console.log); 
}

function upload_batch_v1(batch) {
    request1.post(
        SERVER_SYNC_URL,
        {
            json: {encounters: batch}
        },
        (error, res, body) => {
        if(error) {
            console.error(error);
            return;
        }
        console.log('statusCode', res.statusCode);
        console.log(body);
        }
    )
}
module.exports = {upload_batch, upload_batch_v1}
