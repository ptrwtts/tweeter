if(!localStorage['token']) {
	window.open("/options.html");
}
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    sendResponse({
    	token: localStorage['token'],
    	mentions: localStorage['mentions'] ? localStorage['mentions'] : 0
    });
});