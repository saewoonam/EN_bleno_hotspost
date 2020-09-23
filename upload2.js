const SERVER_SYNC_URL = 'http://68.183.130.247:8000/api/encounters/debug'
const request = require('request-promise')

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

module.exports = {upload_batch}
