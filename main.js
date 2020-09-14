console.log("Starting...");
if (process.platform==="darwin") {
    console.log("got mac, use different bleno library");
    var bleno = require('bleno-mac');
} else {
    var bleno = require('bleno');
}
var BlenoPrimaryService = bleno.PrimaryService;

var EchoCharacteristic = require('./characteristic');
var TimeCharacteristic = require('./get_time_characteristic');
var service_uuid = 'c019';
var isAdvertising = false;
var bluetooth_name = 'NISTCO19';
var remote = {};

console.log('bleno - EN hotspot');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising(bluetooth_name, [service_uuid]);
    isAdvertising = true;
  } else {
    bleno.stopAdvertising();
    isAdvertising = false;
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: service_uuid,
        characteristics: [
          new EchoCharacteristic(remote),
	  new TimeCharacteristic()
        ]
      })
    ]);
  }
});

// code ideas from https://medium.com/@luigi.saetta/bluetooth-low-energy-93284319bfaa
// ACCEPT:
// Accepted a connection from a central device
bleno.on ('accept', function (clientAddress) {
    console.log ("Connection ACCEPTED from address:" + clientAddress);
    remote['mac'] = clientAddress;
    // Stop advertising
    // bleno.stopAdvertising ();
    // isAdvertising = false;
    // console.log ( 'Stop advertising …');
});


// DISCONNECT:
// Disconnected from a client
bleno.on ('disconnect', function (clientAddress) {
    console.log ( "Disconnected from address:" + clientAddress);
    // restart advertising …
    bleno.startAdvertising(bluetooth_name, [service_uuid]);
    isAdvertising = true;
    remote['mac'] = '';
    console.log ( 'Start advertising …');
});

// In our case we decided to implement the rule that when a connection is established with a Device Central, 
// our device stops sending the Advertising Package (thus, it is no longer discoverable).
// STOP ADVERTISING:
bleno.on ('advertisingStop', function (error) {
    console.log ( 'Advertising Stopped …');
});


