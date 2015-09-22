function drawstatus(st) {
    console.log(st);
    console.log(time);
    var temp = st.sensors.temperature[0];
    document.getElementById('temp').innerHTML = temp.value+temp.unit;
    var open = st.state.open;
    if (open) {
	var people = st.sensors.people_now_present.names;
	document.getElementById('here').innerHTML = "Here ("+people.length+"): "+people.join(', ');
	document.getElementById('here').style.display = 'inline';
    } else {
	document.getElementById('here').style.display = 'none';
    }
    document.getElementById('state').innerHTML = open?'<span style="color:lime">OPEN':'<span style="color:red">CLOSED';
    document.getElementById('status').style.display = 'inline';
    var sp=document.getElementById('space');
    sp.innerHTML = sp.innerHTML.replace(/\?+/,'');
}

function drawtime() {
    var time = Date.now().toString('HH:mm:ss');
    document.getElementById('time').innerHTML = time;
}

function getstatus() {
//    var url='statfus.php'
    var url='http://www.leedshackspace.org.uk/status.php';
    var backoff=10;
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.onload = function() {
	backoff=10;
	setTimeout(getstatus, 30*1000);
	drawstatus(JSON.parse(request.response));
    };
    request.onerror = function() { 
	setTimeout(getstatus, backoff*1000);
	backoff *= 2;
	document.getElementById('status').style.display = 'none';
	//document.getElementById('space').innerHTML+='?';
    };
    request.send();
}

setInterval(drawtime, 1000);
