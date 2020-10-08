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
  this.filename = '';
  this.device_name = '';
};

util.inherits(DataCharacteristic, BlenoCharacteristic);

DataCharacteristic.prototype.onReadRequest = function(offset, callback) {
  console.log('DataCharacteristic - onReadRequest: value = ' + this._value.toString('hex'));

  callback(this.RESULT_SUCCESS, this._value);
};

DataCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    this._value = data;

    console.log('DataCharacteristic - onWriteRequest: ' + 
        ' encounter_index = ' + this._value.readUInt32LE(0) + ' len: ' + this._value.length);
    if (this._value.readUInt32LE(0)==0xFFFFFFFF) { // got name for debugging
        this.device_name = this._value.slice(4+32, 4+32+8).toString();
        this._remote.device_name = this.device_name
        console.log('Name: '+this.device_name);
    } else {
        if (this.device_name.length > 0) {
            name = this.device_name;
	} else {
            name = this._remote['mac'].replace(/:/g,'')
	}
        fs.appendFileSync(name, this._value.slice(4, this._value.length));
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
