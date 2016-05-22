function CamIrcConnector(controller) {
    this.controller = controller;

    registerIrcCommandHandler('cam', function (cmdArgs) {
        console.log('CamIrcConnector handling ', cmdArgs);
        var cmd = cmdArgs[0];
        var args = cmdArgs.slice(1);

        switch (cmd) {
            case 'fix':
                // View a particular camera until told otherwise
                if (args.length === 1) {
                    this.controller.fixOnCam(args[0]);
                }
                break;

            case 'view':
            case 'show':
            case 'switch':
                // Switch to a particular camera temporarily, then resume rotation
                if (args.length === 1) {
                    this.controller.lingerOnCam(args[0]);
                }
                break;

            case 'resume':
            case 'rotate':
                // Resume rotating through cameras
                this.controller.startRotation();
                break;
        }
    }.bind(this));
}

new CamIrcConnector(camController);
