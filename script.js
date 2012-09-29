var token;
var mentions = 0;
var adnposts = {};
var tweets = $("#stream-items-id .stream-item").length;
earliest = 99999999999999999999999999999999;
chrome.extension.sendMessage({greeting: "hello"}, function(response) {
	console.log(response);
	if(!response.token) { window.open("chrome-extension://dflobolbhfgolimgfmddgdifipfomkib/options.html"); }
  	else {
  		token = response.token;
  		mentions = response.mentions;
  		start();
  		$(".appnet a").live('click',function(e){
  			e.stopPropagation();	
  		});
  		$(".appnet").live('click',function(e){
  			if($(this).is('div')) {
  				e.stopPropagation();
  				window.open($(this).attr('permalink')); 
  			}		
  		});
  		$(".new-tweets-bar").live('click',function(e){
  			fetchLatest();
  		});
  	}
});
String.prototype.parseUsername = function() {
	return this.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
		var username = u.replace("@","")
		return '<a href="https://alpha.app.net/'+username+'" target="_blank">'+u+'</a>';
	});
};
String.prototype.parseURL = function() {
	return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
		return '<a href="'+url+'" target="_blank">'+url+'</a>';
	});
};
function start() {
	fetchLatest();
	setInterval(checkNew,1000);
}
function checkNew() {
	if(window.location.href.split('/')[3]=="" || !window.location.href.split('/')[3]) {
		var found = $("#stream-items-id .stream-item").length;
		if(found>tweets) {
			tweets = found;
			fetchLatest();
			insertPosts();
			lastTweet = $("#stream-items-id .stream-item").last().find("._timestamp").attr('data-time').substr(0,10);
			lastPost = (new Date(adnposts[earliest].created_at).getTime()/1000);
			if(lastPost>lastTweet){
				fetchEarlier();
			}
		}
	}
}
function fetchLatest() {
	$.getJSON('https://alpha-api.app.net/stream/0/posts/stream?include_directed_posts='+mentions+'&access_token='+token,function(posts){
		$.each(posts.data,function(i,post){
			adnposts[post.id] = post;
			if(post.id<earliest) { earliest = post.id; }
		});
		insertPosts();
	});
}
function fetchEarlier() {
	$.getJSON('https://alpha-api.app.net/stream/0/posts/stream?include_directed_posts='+mentions+'&before_id='+earliest+'&access_token='+token,function(posts){
		$.each(posts.data,function(i,post){
			adnposts[post.id] = post;
			if(post.id<earliest) { earliest = post.id; }
		});
		insertPosts();
	});
}
function insertPosts() {
	if(window.location.href.split('/')[3]=="" || !window.location.href.split('/')[3]) {
		$.each(adnposts,function(i,post){
			if($("#appnet-"+post.id).html()==null && post.text) {
				var timestamp = (new Date(post.created_at).getTime()/1000);
				var prevTweet = null;
				prevTweet = $("#stream-items-id .stream-item").filter(function(){
					if($(this).find(".context").html() && $(this).find(".context").html().trim().length>0) {
						return false;
					} else if(!$(this).find("._timestamp").attr('data-time').substr(0,10)) {
						return false;
					} else {
						return $(this).find("._timestamp").attr('data-time').substr(0,10) < timestamp;
					}
			    }).first();
			    if(prevTweet.length>0) { 
			    	prevTweet.before(templated(post));	    	
			    } 			    
			} 
		});
	} 	
	tweets = $("#stream-items-id .stream-item").length;
}
function templated(post) {
	var t = new Date(post.created_at.replace(/ /,'T'));
	var now = new Date();
	var ago = (now.getTime()-t.getTime())/60000; 	// minutes since post
	if(ago<60*24) {									// less than a day old
		if(ago<1) {								// less than a minute old
			var timestamp = Math.floor((now.getTime()-t.getTime())/1000)+"s";
		} else if(ago<60) {								// less than an hour old
			var timestamp = Math.floor(ago)+"m";
		} else {
			var timestamp = Math.floor(ago/60)+"h";
		}
	} else if(ago<60*24*335) {		
		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var timestamp = t.getDate()+" "+months[t.getMonth()];
	} else {
		var timestamp = t.getFullYear();
	}
	return '<div class="appnet stream-item" id="appnet-'+post.id+'" permalink="https://alpha.app.net/'+post.user.username+'/post/'+post.id+'">'+
			  '<div class="tweet original-tweet">'+
			    '<div class="content">'+
			      '<div class="stream-item-header">'+
			        '<small class="time">'+
			            '<a href="https://alpha.app.net/'+post.user.username+'/post/'+post.id+'" target="_blank" class="tweet-timestamp js-permalink js-nav" title="'+timestamp+'">'+
			              '<span class="_timestamp js-short-timestamp js-relative-timestamp" data-time="'+(new Date(post.created_at).getTime()/1000)+'" data-long-form="true">'+timestamp+'</span>'+
			            '</a>'+
			        '</small>'+
			        '<a class="account-group" href="https://alpha.app.net/'+post.user.username+'" target="_blank">'+
			          '<img class="avatar" src="'+post.user.avatar_image.url+'" alt="'+post.user.name+'">'+
			          '<strong class="fullname">'+post.user.name+'</strong>'+
			          '<span>‏</span> <span class="username"><s>a@</s><b>'+post.user.username+'</b></span>'+
			        '</a>'+
			      '</div>'+            
			      '<p class="js-tweet-text">'+post.text.replace(/>/g, '&gt;').replace(/</g, '&lt;').parseURL().parseUsername()+'</p>'+   
			    '</div>'+
			  '</div>'+
			'</div>';
}