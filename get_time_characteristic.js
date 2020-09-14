var util = require('util');
var fs = require('fs');

// var bleno = require('../..');
var bleno = require('bleno');

var BlenoCharacteristic = bleno.Characteristic;

var TimeCharacteristic = function() {
  TimeCharacteristic.super_.call(this, {
    uuid: 'ec0f',
    properties: ['read'],
    value: null
  });
  this._value = new Buffer(0);
  this._updateValueCallback = null;
};

util.inherits(TimeCharacteristic, BlenoCharacteristic);

TimeCharacteristic.prototype.onReadRequest = function(offset, callback) {
  time = Date.now();
  this._value = new Buffer(8);
  this._value.writeUInt32LE(parseInt(time/1000));
  this._value.writeUInt32LE(parseInt(time%1000), 4);
  console.log('TimeCharacteristic - onReadRequest: value = ' + this._value.toString('hex'));

  callback(this.RESULT_SUCCESS, this._value);
};


module.exports = TimeCharacteristic;
