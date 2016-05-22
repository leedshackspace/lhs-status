function CamController(camElem, camNameElem, camRefElem, rotateDelay) {
    this.imgElement = camElem;
    this.nameElem = camNameElem;
    this.refElem = camRefElem;
    this.rotateDelay = rotateDelay;
    this.shouldRotate = false;

    this.cams = {
        'carpark': {title: 'Car park', url: 'http://gateway.hackspace:8082'},
        'main1': {title: 'Main room 1', url: 'http://gateway.hackspace:8083'}, // by soldering station
        'door': {title: 'Internal door', url: 'http://gateway.hackspace:8084'},
        'main2': {title: 'Main room 2', url: 'http://wifihifi.hackspace:8081'}, // on gateway cabinet
        'outside': {title: 'Outside door', url: 'http://wifihifi.hackspace:8082'},
        '3dprinter': {title: '3D printer', url: 'http://3dprinter.hackspace:8081'}
    };

    this.rotateCams = ['carpark', 'outside', '3dprinter'];
    this.currentCam = 0;

    this.nextCam();
};

CamController.prototype.nextCam = function() {
    this.currentCam = (this.currentCam+1) % this.rotateCams.length;
    this.switchTo(this.rotateCams[this.currentCam], function (err) {
        if (err) {
            this.rotateTimeout = window.setTimeout(this.nextCam.bind(this), 1000);
        } else if (this.shouldRotate) {
            this.rotateTimeout = window.setTimeout(this.nextCam.bind(this), this.rotateDelay);
        }
    }.bind(this));
}

CamController.prototype.startRotation = function() {
    if (this.rotateTimeout) {
        window.clearTimeout(this.rotateTimeout);
    }
    
    console.log('Starting camera rotation');
    this.shouldRotate = true;
    this.nextCam();
}

CamController.prototype.stopRotation = function() {
    console.log('Stopping camera rotation');
    window.clearTimeout(this.rotateTimeout);
    this.rotateTimeout = null;
    this.shouldRotate = false;
}

CamController.prototype.switchTo = function(cameraName, cb /* err */) {
    if (!this.cams.hasOwnProperty(cameraName)) {
        console.log('Nonexistent camera ' + cameraName);
    }
    console.log('Switching to cam ' + this.cams[cameraName].title);
    window.clearTimeout(this.rotateTimeout);
    this.rotateTimeout = null;

    var img = new Image();
    img.addEventListener('load', function() {
        console.log('Loaded cam ' + this.cams[cameraName].title);
        this.imgElement.replaceChild(img, this.imgElement.querySelector('img'));
        this.nameElem.innerHTML = this.cams[cameraName].title;
        this.refElem.innerHTML = cameraName;

        cb && cb(null);
    }.bind(this));

    img.addEventListener('error', function() {
        console.log('Camera failed to load: ' + img.src);

        cb && cb('Camera failed to load: ' + img.src);
    }.bind(this));

    img.src = this.cams[cameraName].url;
}

CamController.prototype.fixOnCam = function(camName) {
    this.stopRotation();
    this.switchTo(camName);
}

CamController.prototype.lingerOnCam = function(camName) {
    this.stopRotation();
    this.switchTo(camName, function (err) {
        if (err) {
            return this.startRotation();
        }

        this.rotateTimeout = window.setTimeout(this.startRotation.bind(this), 30000);
    }.bind(this));
}
