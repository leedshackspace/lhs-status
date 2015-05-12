function NowPlaying(elementId) {
    this.element = document.getElementById(elementId);
    this.socket = io('http://localhost:3030');

    this.socket.on('update', function(info) {
        if (info.status.state == 'play') {
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
            this.updateText('Nothing. Look up "Wifi Hifi" on the Wiki to play something');
        }
    }.bind(this));
}

NowPlaying.prototype.updateText = function(text) {
    this.element.textContent = 'Now Playing: ' + text;
}
