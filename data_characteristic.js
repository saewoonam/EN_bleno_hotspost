var util = require('util');
var fs = require('fs');

// var bleno = require('../..');
var bleno = require('bleno');

var BlenoCharacteristic = bleno.Characteristic;

var DataCharacteristic = function(remote) {
  DataCharacteristic.super_.call(this, {
    uuid: 'ec0e',
    properties: ['read', 'write', 'notify'],
    value: null
  });
  this._remote = remote;
  this._value = new Buffer.alloc(0);
  this._updateValueCallback = null;
};

util.inherits(DataCharacteristic, BlenoCharacteristic);

DataCharacteristic.prototype.onReadRequest = function(offset, callback) {
  console.log('DataCharacteristic - onReadRequest: value = ' + this._value.toString('hex'));

  callback(this.RESULT_SUCCESS, this._value);
};

DataCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    this._value = data;

    // console.log('DataCharacteristic - onWriteRequest: value = ' + this._value.toString('hex'));
    name = this._remote['mac'].replace(/:/g,'')
    console.log('DataCharacteristic - onWriteRequest: filename: ' + name + 
        ' encounter_index = ' + this._value.readUInt32LE(0) + ' len: ' + this._value.length);
    // console.log('index: ' + this._value.slice(0,4).toString('hex'));
    // console.log('Data: '+this._value.slice(4, this._value.length).length);
    var device_name;
    if (this._value.readUInt32LE(0)==0xFFFFFFFF) { // got name for debugging
        var device_name = this._value.slice(4+32, 4+32+8).toString();
        console.log('Name: '+device_name);
    } else {
        fs.appendFileSync(name, this._value.slice(4, this._value.length));
        // console.log('remote '+typeof(this._remote['mac']));
    }
    if (this._updateValueCallback) {
        console.log('DataCharacteristic - onWriteRequest: notifying');

        this._updateValueCallback(this._value);
    }

    callback(this.RESULT_SUCCESS);
};

DataCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('DataCharacteristic - onSubscribe');

  this._updateValueCallback = updateValueCallback;
};

DataCharacteristic.prototype.onUnsubscribe = function() {
  console.log('DataCharacteristic - onUnsubscribe');

  this._updateValueCallback = null;
};

module.exports = DataCharacteristic;
