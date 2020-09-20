const SERVER_SYNC_URL = 'http://68.183.130.247:8000/api/encounters/debug'

async sendDataToServer(data){
    let encounters = data.map(d => {
        return {
            clientKey: d.clientKey,
            timestamp: d.timestamp,
            _meta: d
        }
    })

    const batchLength = 50
    const batches = []
    for (let i = 0, l = encounters.length; i < l; i++){
        let b = Math.floor(i / batchLength)
        let batch = batches[b] = batches[b] || []
        batch.push(encounters[i])
    }

    for (let batch of batches){
        let response = await request({
            url: SERVER_SYNC_URL,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            content: JSON.stringify({ encounters: batch })
        })

        let res = response.content.toJSON()
        if (res.errors.length){
            throw new Error('Server Error: ' + res.errors[0].message)
        }
    }

}

async upload_batch(batch) {
    let response = await request({
        url: SERVER_SYNC_URL,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        content: JSON.stringify({ encounters: batch })
    })

    let res = response.content.toJSON()
    if (res.errors.length){
        throw new Error('Server Error: ' + res.errors[0].message)
    }
}

module.exports = {upload_batch}
