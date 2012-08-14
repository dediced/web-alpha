// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below..
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require_tree .


var FB_APP_ID = '361605033909866';
// var API_DOMAIN = 'http://engine.dediced.com/api';
var API_DOMAIN = 'http://0.0.0.0:3000/api';

$(document).ready(function(){
	userBar.refresh();
	if (window.location.hash.length>0){
		var accessToken = window.location.hash.substring(1).split('&')[0];
		var url = "https://graph.facebook.com/me?"+accessToken;
		$.ajax({
			url: url,
			dataType: 'json',
			success: function(data){								
				$.ajax({
					url: API_DOMAIN+'/users/fb_signin.json?'+accessToken+'&email='+data.email+'&first_name='+data.first_name+'&last_name='+data.last_name,
					dataType: 'json',
					success: function(obj){						
						$.cookie('token',obj.token, {expires: 7, path: '/'});
						window.location = window.location.toString().split('#')[0]
					}
				})
			}
		})
	}
	
})


var userBar = {
	wrapper: $('#user-bar'),
	refresh: function(){
		var token = $.cookie('token');
		if (token==null){
			var login = $('<li></li>').html('<a href="#" id="login-button"> Log In</a>').appendTo('#user-bar');
			$(login).click(function(e){
				e.preventDefault();
				userBar.showLogin();			
			})			
		}else{
			$.ajax({
				// url: API_DOMAIN + '/users/'
			})
		}
	},
	showLogin: function(){
		var wrapper = $('<div id="login-wrapper"></div>');
		var fb_wrapper = $('<div id="fb-signin-wrapper"></div>').appendTo(wrapper);
		$('<a></a>').attr('href', 'https://www.facebook.com/dialog/oauth?client_id='+FB_APP_ID+'&redirect_uri='+escape(window.location)+'&scope=email&response_type=token').html('<img src="/assets/f_logo.png">Facebook log in').appendTo(fb_wrapper);
		
		$(wrapper).onStage();
		
	}
}

jQuery.fn.onStage = function(){
	var layer = $('<div id="stage-layer"></div>').hide().appendTo('body').fadeIn('fast');
	var wrapper = $('<div id="stage-wrapper"></div>').appendTo(layer);
	var stage = $(this).addClass('stage').hide().appendTo(wrapper).fadeIn();
}