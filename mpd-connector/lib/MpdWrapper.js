var async = require('async');
var mpd = require('mpd');
var cmd = mpd.cmd;
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function MpdWrapper(config) {
    this.config = config;
    this._client = null;
}
util.inherits(MpdWrapper, EventEmitter);

MpdWrapper.prototype.connect = function() {
    this._client = mpd.connect({
        host: this.config.host,
        port: this.config.port
    });

    this.setupListeners();
}

MpdWrapper.prototype.setupListeners = function() {
    this._client.on('end', this.emit.bind(this, 'end'));
    this._client.on('error', this.emit.bind(this, 'error'));
    this._client.on('ready', this.emit.bind(this, 'ready'));

    this._client.on('system', function(systemName) {
        if (systemName == 'player' || systemName == 'playlist') {
            this.getInfo(function(err, info) {
                if (err) {
                    return this.emit('error', err);
                }

                this.emit('update', info);
            }.bind(this));
        }
    }.bind(this));
}

MpdWrapper.prototype.getInfo = function(cb /* err, info */) {
    async.parallel(
        [
            this.getStatus.bind(this),
            this.getCurrentSong.bind(this)
        ],
        function(err, results) {
            if (err) {
                return cb(err, null);
            }

            cb(null, {
                status: results[0],
                currentsong: results[1]
            });
        }
    );
}

MpdWrapper.prototype.getStatus = function(cb /* err, status */) {
    this._client.sendCommand(cmd('status', []), function(err, msg) {
        cb(err, this.parseStatus(msg));
    }.bind(this));
}

MpdWrapper.prototype.parseStatus = function(msg) {
    /*
    msg for example:

    volume: 25
    repeat: 1
    random: 0
    single: 0
    consume: 1
    playlist: 476
    playlistlength: 1
    xfade: 0
    mixrampdb: 0.000000
    mixrampdelay: nan
    state: play
    song: 0
    songid: 127
    time: 1018:0
    elapsed: 1018.320
    bitrate: 112
    audio: 44100:24:2
    nextsong: 0
    nextsongid: 127
    */


    // TODO: convert bits to numbers
    return objectify(msg);
}

MpdWrapper.prototype.getCurrentSong = function(cb /* err, status */) {
    this._client.sendCommand(cmd('currentsong', []), function(err, msg) {
        cb(err, this.parseCurrentSong(msg));
    }.bind(this));
}

MpdWrapper.prototype.parseCurrentSong = function(msg) {
    // TODO: convert stuff to numbers
    return objectify(msg);
}

function objectify(str) {
    var obj = {};
    var lines = str.trim().split('\n');
    lines.forEach(function(line) {
        var lineParts = line.split(': ');
        obj[lineParts[0]] = lineParts[1].trim();
    });
    return obj;
}



module.exports = MpdWrapper;
