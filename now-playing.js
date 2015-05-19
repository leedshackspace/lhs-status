function NowPlaying(elementPrefix) {
    this.textElement = document.getElementById(elementPrefix + '-text');
    this.iconElement = document.getElementById(elementPrefix + '-icon');
    this.socket = io('http://localhost:3030');

    /* This is an implementation that can connect to ympd via websocket directly
       Unfortunately ympd's websocket doesn't send info about the current playing
       track when listening to a radio stream, so we're not going to use it.

    this.socket = new WebSocket('ws://wifihifi.hackspace');

    var lastMsg;
    var lastPlayState;
    this.socket.onmessage = function(msg) {
        if (msg.data.length == 0 || lastMsg === msg) {
            return;
        }
        lastMsg = msg.data;

        var payload = JSON.parse(msg.data);

        switch (payload.type) {
            case 'state':
                if (payload.data.state == lastPlayState) {
                    return;
                }
                lastPlayState = payload.data.state;

                console.log('updated play state', lastPlayState);

                this.updatePlayIcon(payload.data.state);
                break;

            case 'song_change':
                console.log('song change', payload.data);

                var textToShow = payload.data.title;

                if (payload.data.hasOwnProperty('artist')) {
                    textToShow += ' - ' + payload.data.artist;
                }

                if (payload.data.hasOwnProperty('album')) {
                    textToShow += ' - ' + payload.data.album;
                }

                this.updateText(textToShow);
                break;
        }
    }.bind(this);
    */

    var prevPlayState;
    this.socket.on('update', function(info) {
        if (info.status.state != prevPlayState) {
            this.updatePlayIcon(info.status.state);
        }

        if (info.status.state == 'play' || info.status.state == 'pause') {
            // We need to figure out what kind of media it is to best display informatino about it.
            if (info.currentsong.hasOwnProperty('Title') && info.currentsong.hasOwnProperty('Name')) {
                // It's probably a stream playing
                this.updateText(info.currentsong.Title + ' (' + info.currentsong.Name + ')');
            } else if (info.currentsong.hasOwnProperty('Name')) {
                // It's probably a stream playing that's not publishing a track name
                this.updateText(info.currentsong.Name);
            } else if (info.currentsong.hasOwnProperty('Artist') && info.currentsong.hasOwnProperty('Album') && info.currentsong.hasOwnProperty('Title')) {
                // A normal music track
                this.updateText(info.currentsong['Artist'] + ' - ' + info.currentsong['Title'] + ' (' + info.currentsong['Album'] + ')');
            } else {
                this.updateText('Something, but we don\'t know how to display it');
            }
        } else {
            this.updateText('stop', 'Nothing. Look up "Wifi Hifi" on the Wiki to play something');
        }
    }.bind(this));
}

NowPlaying.prototype.updateText = function(text) {
    this.textElement.textContent = 'Now Playing: ' + text;
}

NowPlaying.prototype.updatePlayIcon = function(playState) {
    var iconClass = playState;
    /* This version of the function is required when using the ympd websocket implementation

    switch (playState) {
        case 1: // stopped
            iconClass = 'stop';
            break;
            
        case 2: // playing
            iconClass = 'play';
            break;

        default: // paused
            iconClass = 'pause';
            break;
    }
    */
    this.iconElement.innerHTML = '<i class="fa fa-' + iconClass + '"></i>';
};
