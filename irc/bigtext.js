function BigMessage() {
    this.hideTimeout = null;
    this.elem = document.getElementById('bigmessage');
    this.textElem = document.getElementById('bigmessage-text');
}

BigMessage.prototype.show = function (text) {
    this.textElem.textContent = text;
    this.elem.className = 'visible';
    clearTimeout(this.hideTimeout);
    this.hideTimeout = window.setTimeout(this.hide.bind(this), 10000);
}

BigMessage.prototype.hide = function() {
    this.elem.className = '';
}

var bigMsg = new BigMessage();

registerIrcCommandHandler('bigtext', function(args) {
    bigMsg.show(args.join(' '));
});
