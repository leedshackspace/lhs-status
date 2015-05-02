var cam = function(el) {
    var cams = [//'https://www.leedshackspace.org.uk/cam1.jpg',
//	'https://www.leedshackspace.org.uk/livecam2.jpg',
//	'https://www.leedshackspace.org.uk/livecam3.jpg',
//	'https://www.leedshackspace.org.uk/livecam4.jpg',
	'http://gateway.hackspace:8082',
	'http://gateway.hackspace:8083',
	'http://gateway.hackspace:8084',
//	'http://wifihifi.hackspace:8081',
//	'http://wifihifi.hackspace:8082',
	'http://3dprinter.hackspace:8081',
//	'https://www.leedshackspace.org.uk/livecam5.jpg',
//	'https://www.leedshackspace.org.uk/livecam6.jpg',
//	'https://www.leedshackspace.org.uk/livecam7.jpg',
	       ];
    var n = 0;
    function next() { 
	n=(n+1)%cams.length;
	var img = new Image();
	img.onload = function() { el.replaceChild(img, el.querySelector('img')); };
	img.onerror = function() { console.log("error: "+img.src); next(); };
	img.src=cams[n];
    }
    setInterval(next, 15000);
    next();
};
