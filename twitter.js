function twitter_fixup(el, stylesheet) {
    function embed(doc, url) {
	var link = doc.createElement("link");
        link.href = url;
        link.rel = "stylesheet";
        link.type = "text/css";

	doc.getElementsByTagName("head")[0]
	    .appendChild(link);
    }

    function do_fixup() {
	var frame=el.getElementsByTagName('iframe')[0];
	if (frame) {
	    embed (frame.contentDocument, stylesheet);
	} else {
	    setTimeout(do_fixup, interval);
	}
    }
    
    var interval = 500;
    setTimeout(do_fixup, interval);
}
