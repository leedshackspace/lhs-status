var ws;
function get(url,cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
	switch (xhr.readyState) {
	case 4:
	    cb(JSON.parse(xhr.responseText));
	}
    }
    xhr.send();
}
var users={};
var bots={};
var ws_url;
var backoff;
function start_ws() {
    backoff = 1000;
    var socket = new WebSocket(ws_url);
    socket.addEventListener('message', function (event) {
	var ob = JSON.parse(event.data);
	switch(ob.type) {
	case 'message':
	    msg(ob);
	    break;
	case 'user_change':
	    users[ob.user.id] = ob.user;
	    break;
	case 'bot_added':
	    bots[ob.bot.id]=ob.bot;
	    break;
	case 'reconnrect_url':
	    ws_url = ob.url;
	    break;
	}
	console.log(event);
    });
    socket.onclose = () => window.setTimeout(()=>start_ws(ws_url),backoff*=2);
}
function start_cb(ob) {
    console.log(ob);
    ob.users.map((u)=>users[u.id]=u);
    ob.bots.map((b)=>bots[b.id]=b);
    ws_url = ob.url;
    start_ws();
    get("https://slack.com/api/channels.history?token="+token+"&channel="+chan, populate_history); // do this *after* getting the userlist
}
function user(ob) {
    var name=ob.username;
    if (ob.user && users[ob.user]) {
	return '<span style="color:#'+users[ob.user].color+'">'+(name||users[ob.user].name)+'</span>';
    } else {
	if (ob.bot_id && bots[ob.bot_id])
	    return name||bots[ob.bot_id].name;
	return name||'??'+JSON.stringify(ob)+'??';
    }
}

function munge(text) {
    //https://api.slack.com/docs/message-formatting
    text=text.replace(/<(.*?)(\|([^>]+))?>/g,
		      function (m,m1,m2,m3) {
			  //if (m1.match(/^#C/))
			  var e;
			  if (e=m1.match(/^@[UB]/)) {
			      return user({user:m1.replace(/@/,''),username:m3})
			  } else if (e=m1.match(/^@C/)) {
			      //return channels[m1]||m3;
			      return m3||m1;
			  } else if (e=m1.match(/^!/)) {
			      return m3;
			  } else {
			      return "<a href="+m1+">"+(m3||m1)+"</a>";
			  }
		      }
		     );

//    text=text.replace(/<@(U[^>]+)(\|([^>]+))?>/g,
//		      (m,m1,m2,m3)=>user({user:m1,username:m3}));

    //text=text.replace(/([^<])\//g,'$1/&#8203;');// allow breaking on slashes
    text=text.replace(/\/(![^<]*?>)/g,'qqq/&#8203;');// allow breaking on slashes
    text=text.replace(/```([^]*?)```/g,(m,m1)=>"<pre>"+m1+"</pre>");
    if (text.match(/```/)) console.log(JSON.stringify(text));
    return text;
}

var sameday = (function() {
    var lastdate=new Date(0);
    return function(date) {
	var same = true;
	if (!date) return true;
	[ 'getYear', 'getMonth', 'getDate' ].map (
	    (i) => ((date[i].call(date) !== lastdate[i].call(lastdate)) && (same = false))
	);
	lastdate=date;
    	return same;
    }
})();

function separator(date) {
    var el=document.body.lastChild;
    if (!el || el.className!=="separator") {
	el = document.createElement("div");
	el.className="separator";
	document.body.appendChild(el);
    }
    el.innerHTML=date.toDateString();
}

function attachment(a) {
    var text = '';
    console.log(a);
    if (a.image_url) {
	text += "<img src='"+a.image_url.replace(/^http:/,'https:')+"'></img>";//width="+a.thumb_width+" height="+a.thumb_height
    }
    if (a.thumb_url) {
	text += "<img src='"+a.thumb_url.replace(/^http/,'https')+"'></img>";//width="+a.thumb_width+" height="+a.thumb_height
    }
    if (a.title)
	text += "<h3>"+a.title+"</h3>";
    if (!a.image_url) 
	text += munge((typeof a.text !== 'undefined') ? a.text : (a.fallback || ''));
    return "<div class=att>"+text+"</div>";
}

function msg(ob) {
    if (ob.user_profile) users[ob.user]=ob.user_profile;
    if (ob.channel && ob.channel!=chan) return;
    console.log(ob);
    var ts=new Date(parseFloat(ob.ts)*1e3);
    if (!sameday(ts))
	separator(ts);
    var text=munge(ob.text);
    if (ob.file && ob.file.thumb_720)
	text+="<img src='"+ob.file.thumb_720+"'>";
    var el = document.createElement("div");
    el.className='line';
    el.innerHTML="<span class=ts>"+(ts.toString('HH:mm:ss'))+"</span> <span class=user>"+user(ob)+" </span> "+"<div class=msg>"+text+"</div>";
    if (ob.attachments) ob.attachments.map((x)=>el.innerHTML+=attachment(x));
    document.body.appendChild(el);
    if (0) {
	var el = document.createElement("div");
	el.innerHTML=JSON.stringify(ob);
	document.body.appendChild(el);
    }
    el.scrollIntoView();
}

function populate_history(ob) {
    console.log(ob);
    ob.messages.reverse().map((x)=>msg(x));
}
get("https://slack.com/api/rtm.start?token="+token,start_cb);
