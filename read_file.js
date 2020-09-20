var fs = require('fs')
var convert = require('./bytes-to-csv.js')
var upload = require('./upload.js');

zeros = Buffer.alloc(32);
zeros.fill(0);
console.log(zeros.toString('hex'));
row_buffer = Buffer.alloc(64);

const readable = fs.createReadStream('588e8166afd3',null);
// const readable = fs.createReadStream('588e81a54819',null);
let block = [];
let part_one = true;
let chunk;
let skip = 0;
let count = 0;

readable.on('readable', () => {
    while (null !== (chunk = readable.read(32))) {
        if (skip>0) {
            skip -= 1;
            // console.log(skip,': ', chunk.toString('hex'))
        } else if (Buffer.compare(zeros, chunk)==0) {
            skip = 2;
            // console.log(skip, ': ', chunk.toString('hex'))
            part_one = true;
        } else {
            // console.log('start part_one', part_one)
            if (part_one) {
                chunk.copy(row_buffer, 0, 0);
                // console.log("part one", chunk.toString('hex'))
                part_one = false;
            } else {
                chunk.copy(row_buffer, 32, 0);
                // console.log("part two", chunk.toString('hex'))
                //
                // Don't process any old data if it is there...
                if((row_buffer[63]==0)
                    &&(row_buffer[62]==0x07 || row_buffer[62]==0x01)) {
                    part_one = true;
                    // console.log("old format");
                } else {
                    // console.log("new format", row_buffer[63], row_buffer[62]);
                    part_one = true;
                    data = convert.bytesToData(row_buffer);
                    data = data[0]
                    if (data.minute > (1577836800/60)) {
                        block.push(data);
                        count += 1; 
                    } else {
                        // console.log("too early");
                    }
                    if (count==50) {
                        let encounters = block.map(d => {
                            return {
                                clientKey: d.encounter_id,
                                timestamp: d.timestamp,
                                _meta: d
                            }
                        })
                        upload.upload_block(encounters);
                        console.log("convert block of 50: ", data.timestamp);
                        count = 0;
                        block = [];
                    }
                }
            }
            // console.log('end part_one', part_one)
        }
    }
});
readable.on('close', () => {
    // console.log('closed ', block.length)
    let encounters = block.map(d => {
        return {
            clientKey: d.encounter_id,
            timestamp: d.timestamp,
            _meta: d
        }
    })
    console.log("convert last block", block.length, ":", encounters[encounters.length-1].timestamp);
    upload.upload_block(encounters);
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
