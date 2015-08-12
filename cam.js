var cam = function(el) {
    var cams = [
        'http://gateway.hackspace:8082', // Cam 2, covering car park
        'http://gateway.hackspace:8083', // Cam 3, by soldering station
        'http://gateway.hackspace:8084', // Cam 4, internal door
        'http://wifihifi.hackspace:8081', // Cam 5, on gateway cabinet
        'http://wifihifi.hackspace:8082', // Cam 6, outside door
        'http://3dprinter.hackspace:8081', // Cam 7, 3D printer camera
    ];
    
    var n = 0;
    var backoff = 0;

    function nextCam() {
        n = (n+1) % cams.length;
        var img = new Image();
        img.onload = function() {
	    console.log("success");
            el.replaceChild(img, el.querySelector('img'));
        };
        img.onerror = function() {
            console.error("Camera failed to load: " + img.src);
	    setTimeout(nextCam, backoff);
	    backoff += 1000;
        };

        img.src = cams[n];
    }

    setInterval(nextCam, 15000);
    nextCam();
};
