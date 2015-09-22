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
                    this.fixCam(args[0]);
                }
                break;

            case 'view':
                // Switch to a particular camera temporarily, then resume rotation
                if (args.length === 1) {
                    this.viewCam(args[0]);
                }
                break;

            case 'resume':
                // Resume rotating through cameras
                this.rotateCams();
                break;
        }
    }.bind(this));
}

CamIrcConnector.prototype.fixCam = function (camName) {
    this.controller.stopRotation();
    this.controller.switchTo(camName);
}

CamIrcConnector.prototype.viewCam = function (camName) {
    if (this.restartRotationTimeout) {
        clearTimeout(this.restartRotationTimeout);
    }
    this.controller.stopRotation();
    this.controller.switchTo(camName);
    this.restartRotationTimeout = setTimeout(function () {
        this.restartRotationTimeout = null;
        this.controller.startRotation();
    }.bind(this), 30000);
}

CamIrcConnector.prototype.rotateCams = function () {
    this.controller.startRotation();
    if (this.restartRotationTimeout) {
        clearTimeout(this.restartRotationTimeout);
    }
}

new CamIrcConnector(camController);
