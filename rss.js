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
    ['getYear', 'getMonth', 'getDate'].map(function(i) {
        //console.log("now:"+now[i].call(now)+" date:"+date[i].call(date)+" str="+indate+" i="+i);
        if (now[i].call(now) !== date[i].call(date))
            sameday = false;
    });
//    return date.toLocaleFormat(sameday ? '%X' : '%x');
    return date.toString(sameday ? 'HH:mm' : 'd MMM');
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
    function parse() {
        var xml = request.responseXML;
        var items = xml.evaluate('//channel/item', xml, null,
                        XPathResult.ORDERED_NODE_ITERATOR_TYPE,
                        null);

        var item;
        var threads={};
        /* The idea here is as follows:
           (a) for each post, we have only subject, author, date and permalink to work with
           (b) a thread is all the posts with a given subject (ignoring a possible "Re: " prefix)
           (c) a thread's date is the date of its last post
           (d) threads are sorted by their date
           (d) within a thread, authors are listed in chronological order of their posts
           (e) a thread links to its last post
        */
        while (item = items.iterateNext()) {
            var j = xml2json(item);

            var date = new Date(j.pubdate);
            var title = j.title.replace(/^Re: /,'');
            var author = j.author;
            var t = threads[title];
            if (!t)
                t = { authors:[], link: j.link };

            if (!t.date || t.date < date)
                t.date = date;

            t.authors.unshift(author);
            threads[title] = t;
        }

        var threadlist = [];
        for (var i in threads) {
            if (!threads.hasOwnProperty(i))
                continue;

            var t = threads[i];
            t.title = i;
            threadlist.push(t);
        }

        threadlist.sort(function(a,b) { return b.date-a.date; });

	while (el.hasChildNodes())
	    el.removeChild(el.lastChild);

        for (var i=0; i<threadlist.length; i++) {
            var j=threadlist[i];
            var ctr = el_with_class("div", el, "rss");
            el_with_class("span", ctr, "rss-date", fmtdate(j.date));
            var link = el_with_class("a", ctr);
            link.href = j.link;
            el_with_class("span", link, "rss-title", j.title);
            el_with_class("div", ctr, "rss-author", j.authors.join(", "));
        }
    }

    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.onload = parse;
    request.send();
}
