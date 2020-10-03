var util = require('util');
var fs = require('fs');

// var bleno = require('../..');
var bleno = require('bleno');

var BlenoCharacteristic = bleno.Characteristic;

var time_cb = function(code, value) {
  console.log("time callback result: "+code);
  console.log("sent value: "+value.toString('hex'));
}

var TimeCharacteristic = function() {
  TimeCharacteristic.super_.call(this, {
    uuid: 'ec0f',
    properties: ['read'],
    value: null
  });
  this._value = new Buffer.alloc(0);
  // this._updateValueCallback = null;
  this._updateValueCallback = time_cb;
};

util.inherits(TimeCharacteristic, BlenoCharacteristic);

TimeCharacteristic.prototype.onReadRequest = function(offset, callback) {
  time = Date.now();
  this._value = new Buffer.alloc(8);
  this._value.writeUInt32LE(parseInt(time/1000));
  this._value.writeUInt32LE(parseInt(time%1000), 4);
  console.log('TimeCharacteristic - onReadRequest: value = ' + this._value.toString('hex'));
  console.log('callback', callback)
  // setTimeout(() => {  callback(this.RESULT_SUCCESS, this._value);}, 200);
  // await new Promise(resolve => setTimeout(resolve, 50));
  callback(this.RESULT_SUCCESS, this._value);

};


module.exports = TimeCharacteristic;
