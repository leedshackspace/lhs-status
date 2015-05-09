window.ircCommandHandlers = {};

window.addEventListener('message', function(e) {
    var commandSegments = e.data.split(' ');
    
    if (window.ircCommandHandlers.hasOwnProperty(commandSegments[0].toLowerCase())) {
        window.ircCommandHandlers[commandSegments[0]](commandSegments.slice(1));
    }
});