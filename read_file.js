var fs = require('fs')
var convert = require('./bytes-to-csv.js')

zeros = Buffer.alloc(32);
zeros.fill(0);
console.log(zeros.toString('hex'));
row_buffer = Buffer.alloc(64);

const readable = fs.createReadStream('588e8166afd3',null);
readable.on('readable', () => {

    let chunk;
    let skip = 0;
    while (null !== (chunk = readable.read(32))) {
        if (skip>0) {
            skip -= 1;
        } else if (Buffer.compare(zeros, chunk)==0) {
            console.log("found zeros");
            skip = 2;
        } else {
            // console.log(`read: ${chunk.length}`);
            d = convert.bytesToData(chunk);
            console.log(chunk)

        }
    }
});

if (false) {
    binary = fs.readFileSync('588e8166afd3',null);
    console.log(typeof(binary));
    num_blocks = binary.length/32;
    for (i=0; i<num_blocks; i++) {
    // for (i=0; i<10; i++) {
        if (Buffer.compare(zeros, binary.slice((i<<5), (i<<5)+32))==0) {
            i += 2;
        } else {
            evt = binary.slice(i<<5,(i<<5)+64)
            evt.copy(row_buffer, 0, 0)
            // console.log(row_buffer)
            d = convert.bytesToData(row_buffer);
            console.log(d)
            i++;
        }
    }
}
if (false) {
        console.log('evt: ' + evt.length)
        let row = new DataView(evt.buffer)
        console.log('row: ', row, evt.buffer)
        minute = row.getUint32(0)
        console.log('minute: '+minute)
        let tz_offset_ms = new Date().getTimezoneOffset() * 60 * 1000;
        let d = new Date(minute * 60 * 1000 - tz_offset_ms) // 3600 * 6 * 1000)
        let timestamp = d.toISOString()
        timestamp = timestamp.split('.')
        timestamp = timestamp[0]
        entry = {timestamp: timestamp}

        console.log(evt.toString('hex'));
}
