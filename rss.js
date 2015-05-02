function req(method, uri, headers, cb, body) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, uri, true);
    for (var i in headers) {
        xhr.setRequestHeader(i, headers[i]);
    }
    xhr.onreadystatechange = function () {
        switch (xhr.readyState) {
            case 4: /* done */
            var status = xhr.status.toString();
            if (xhr.aborted) /* don't show errors for cancelled requests */
                return;
            if (status < 200 || status > 299)
                alert("Error: "+method+" request for "+uri+(status?(" returned \""+xhr.statusText+"\" ("+status+")"):" could not be sent"));
            else
                cb(uri, xhr);
            break;
        }
    }
    xhr.send(body || null /* for IE */);
    return xhr;
}

function xml2json(xml) { /* minimalist version, no arrays */
    var obj = {};
    
    for(var i = 0; i < xml.childNodes.length; i++) {
        var item = xml.childNodes.item(i);
	obj[item.nodeName.toLowerCase()] = item.textContent.trim();
    }
    return obj;
}

function fmtdate(indate) {
    var date=new Date(indate);
    var sameday = true;
    var now = new Date();
    [ 'getYear', 'getMonth', 'getDate' ].map (function(i) {
	//console.log("now:"+now[i].call(now)+" date:"+date[i].call(date)+" str="+indate+" i="+i);
	if (now[i].call(now) !== date[i].call(date))
	    sameday = false;
    });
//    return date.toLocaleFormat(sameday ? '%X' : '%x');
    return date.toString(sameday ? 'hh:mm' : 'd MMM');
}

function el_with_class(type, parent, className, text) {
    var el = document.createElement(type);
    if (className)
	el.className = className;
    if (text)
	el.appendChild(document.createTextNode(text));
    parent.appendChild(el);
    return el;
}

function rss(url, el) {
    function parse(base,xhr) {
	var xml = xhr.responseXML;
	var items = xml.evaluate('//channel/item', xml, null, 
				 XPathResult.ORDERED_NODE_ITERATOR_TYPE,
				 null);
	var item;
	while (item = items.iterateNext()) {
	    var j = xml2json(item);
	    var ctr = el_with_class("div", el, "rss");
	    el_with_class("span", ctr, "rss-date", fmtdate(j.pubdate))
	    var link = el_with_class("a", ctr);
	    link.href = j.link;
	    el_with_class("span", link, "rss-title", j.title);
	    el_with_class("div", ctr, "rss-author", j.author);
	}
    }
    
    req("GET",
	url,
	[],
	parse);
}
