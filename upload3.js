const SERVER_SYNC_URL = 'http://68.183.130.247:8000/api/encounters/debug'
const phin = require('phin');
const phin2 = require('phin').unpromisified;

async function upload_batch_phin(batch) {
    return await phin({
        url: SERVER_SYNC_URL,
        method: 'POST',
        data: {encounters: batch} 
    })
    // response().then((res) => console.log(res)).catch((e) => console.log(e));
}

function upload_batch_phin2(batch) {
    return phin2({
        url: SERVER_SYNC_URL,
        method: 'POST',
        data: {encounters: batch} ,
    }, (err, res) => {
        if (!err) console.log(res.body, res.body.toString())
        else {
            console.log("Error: ", err);
        }
    })
}


module.exports = {upload_batch_phin, upload_batch_phin2 }
