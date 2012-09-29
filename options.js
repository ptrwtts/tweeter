// Handle Token
console.log(window.location.hash);
if(window.location.hash) {
	console.log(window.location.hash);
	console.log(window.location.hash.split('#')[1].split('=')[1]);
	localStorage['token'] = window.location.hash.split('#')[1].split('=')[1];
}
$(document).ready(function() {	
	// Setup
	if(localStorage['token']) {
		$("#in").show();
		$("#out").hide();
	} else {
		$("#out").show();
		$("#in").hide();
	}
	if(localStorage['mentions']==1) {
		$("input[type='checkbox']").attr('checked', true);
	}
	$("#logout").click(function(e){
		localStorage.clear();
	})
	$("#login").click(function(e){
		window.close();
	})
	// Handle Changes
	$("input[type='checkbox']").change(function(e){
		if($(this).is(':checked')) { localStorage['mentions']=1; } else { localStorage['mentions']=0; }
		console.log(localStorage['mentions'])
	})
});