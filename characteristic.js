var util = require('util');
var fs = require('fs');

// var bleno = require('../..');
var bleno = require('bleno');

var BlenoCharacteristic = bleno.Characteristic;

var EchoCharacteristic = function(remote) {
  EchoCharacteristic.super_.call(this, {
    uuid: 'ec0e',
    properties: ['read', 'write', 'notify'],
    value: null
  });
  this._remote = remote;
  this._value = new Buffer(0);
  this._updateValueCallback = null;
};

util.inherits(EchoCharacteristic, BlenoCharacteristic);

EchoCharacteristic.prototype.onReadRequest = function(offset, callback) {
  console.log('EchoCharacteristic - onReadRequest: value = ' + this._value.toString('hex'));

  callback(this.RESULT_SUCCESS, this._value);
};

EchoCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    this._value = data;

    // console.log('EchoCharacteristic - onWriteRequest: value = ' + this._value.toString('hex'));
    name = this._remote['mac'].replace(/:/g,'')
    console.log('EchoCharacteristic - onWriteRequest: filename: ' + name + 
        ' encounter_index = ' + this._value.readUInt32LE(0) + ' len: ' + this._value.length);
    // console.log('index: ' + this._value.slice(0,4).toString('hex'));
    // console.log('Data: '+this._value.slice(4, this._value.length).length);
    fs.appendFileSync(name, this._value.slice(4, this._value.length));
    // console.log('remote '+typeof(this._remote['mac']));

    if (this._updateValueCallback) {
        console.log('EchoCharacteristic - onWriteRequest: notifying');

        this._updateValueCallback(this._value);
    }

    callback(this.RESULT_SUCCESS);
};

EchoCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('EchoCharacteristic - onSubscribe');

  this._updateValueCallback = updateValueCallback;
};

EchoCharacteristic.prototype.onUnsubscribe = function() {
  console.log('EchoCharacteristic - onUnsubscribe');

  this._updateValueCallback = null;
};

module.exports = EchoCharacteristic;
