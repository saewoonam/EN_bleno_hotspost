var fs = require('fs')
var convert = require('./bytes-to-csv.js')
// var upload = require('./upload2.js');
var upload = require('./upload3.js');

zeros = Buffer.alloc(32);
zeros.fill(0);
console.log(zeros.toString('hex'));
row_buffer = Buffer.alloc(64);
// const readable = fs.createReadStream('588e8166a4b2',null);
// const readable = fs.createReadStream('588e8166afd3',null);
// const readable = fs.createReadStream('588e81a54819',null);
function rm(filename) {
    fs.unlink(filename, (err) => {
        if (err) {
            console.log(err)
        }
    })
}

function upload_file(name) {
    console.log("Open: ", name);
    let readable = fs.createReadStream(name,null);

    let block = [];
    let part_one = true;
    let chunk;
    let skip = 0;
    let count = 0;
    let upload_count = 0;

    async function upload_block(block, retry=5) {
        let encounters = block.map(d => {
            return {
                encounterId: d.encounterId,
                timestamp: d.timestamp,
                _meta: d
            }
        })
        try {
            res = await upload.upload_batch_phin(encounters)
            // console.log(res.body.toString())
            upload_count  += block.length;
            console.log("uploaded block of", block.length, upload_count);
        } catch(e) {
            console.log(e)
            console.log("Retry", retry-1);
            upload_block(block, retry-1)
        }
    }
    function upload_block_blank(block) {
            upload_count  += block.length;
            console.log("uploaded block of", block.length, upload_count);
    }
    readable.on('readable', () => {
        while (null !== (chunk = readable.read(32))) {
            if (skip>0) { // skip header info
                skip -= 1;
                // console.log(skip,': ', chunk.toString('hex'))
            } else if (Buffer.compare(zeros, chunk)==0) {
                skip = 2; // set number of 32byte chunks to skip because it is header info
                // console.log(skip, ': ', chunk.toString('hex'))
                part_one = true;
            } else {
                // console.log('start part_one', part_one)
                if (part_one) {
                    chunk.copy(row_buffer, 0, 0);  // copy first 32bytes of event info
                    // console.log("part one", chunk.toString('hex'))
                    part_one = false;
                } else {
                    chunk.copy(row_buffer, 32, 0); // copy 2nd 32 bytes of event info
                    // console.log("part two", chunk.toString('hex'))
                    //
                    // Don't process any old data if it is there...
                    if((row_buffer[63]==0)  // this is v1 firmware data...
                        &&(row_buffer[62]==0x07 || row_buffer[62]==0x01)) {
                        part_one = true;
                        // console.log("old format");
                    } else {
                        // console.log("new format", row_buffer[63], row_buffer[62]);
                        part_one = true;
                        data = convert.bytesToData(row_buffer);
                        data = data[0]
                        data.name = name;
                        console.log('data', data)
                        if (data.minute > (1577836800/60)) {
                            block.push(data); // append data to block
                            count += 1; 
                        } else {
                            // console.log("too early");
                        }
                        if (count==50) {
                            upload_block(block);
                            block = [];
                            count = 0;
                        }
                    }
                }
                // console.log('end part_one', part_one)
            }
        }
    });
    readable.on('close', () => {
        // upload last chunk of data
        upload_block(block);
        upload_count = 0;
    });
}
module.exports = {upload_file, rm}

