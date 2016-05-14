window.ircCommandHandlers = {};

function registerIrcCommandHandler(cmdName, handler) {
    window.ircCommandHandlers[cmdName] = handler;
}

window.addEventListener('message', function(e) {
    /*
    e.data looks like this:

    {
        sender: 'lhs-status',
        type: 'highlight',
        text: 'some message that was sent by mentioning us'
    }

    or

    {
        sender: 'lhs-status',
        type: 'message',
        text: 'some message that was sent either as a PM or as a message to the main channel (no way to tell which)'
    }
    */

    if (!(typeof e.data === 'object' && e.data.hasOwnProperty('sender') && e.data.sender === 'lhs-status')) {
        // this message wasn't for us
        return;
    }

    switch (e.data.type) {
        case 'highlight':
            handleMessageLine(e.data.text);
            break;

        case 'message':
            if (e.data.text[0] === '^') {
                handleMessageLine(e.data.text.slice(1));
            }
            break;
    }

});

function handleMessageLine(line) {
    var commandSegments = line.split(' ');
    
    if (window.ircCommandHandlers.hasOwnProperty(commandSegments[0].toLowerCase())) {
        window.ircCommandHandlers[commandSegments[0]](commandSegments.slice(1));
    }
}
