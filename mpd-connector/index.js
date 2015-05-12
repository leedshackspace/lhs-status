var config = require('./config.json');
var MpdWrapper = require('./lib/MpdWrapper.js');
var io = require('socket.io')(3030);

var mpdw = new MpdWrapper({
    host: config.mpd.host,
    port: config.mpd.port
});
mpdw.connect();

console.log('Connecting to MPD server on ' + config.mpd.host + ':' + config.mpd.port);

mpdw.on('error', function(err) {
    console.error(err);
    // TODO: now what?
});

mpdw.on('end', function() {
    console.log('MPD server disconnected');
    // TODO: now what?
});

mpdw.on('ready', function() {
    console.log('Connected to MPD server');

    // Fetch the MPD server status on startup
    mpdw.getInfo(function(err, info) {
        if (err) {
            return console.error(err);
        }

        handleUpdate(info);
    });
});

mpdw.on('update', handleUpdate);

function handleUpdate(updateInfo) {
    console.log('UPDATE: ' + JSON.stringify(updateInfo));
    io.emit('update', updateInfo);
}


io.on('connection', function(socket) {
    console.log('socket.io client connected');

    mpdw.getInfo(function(err, info) {
        if (err) {
            return console.error(err);
        }

        socket.emit('update', info);
    });
});
