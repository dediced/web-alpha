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
				url: API_DOMAIN + '/users/'+token+'/avatar.json',
				dataType: 'json',
				beforeSend: function(){
					$('#user-bar').loading();
				},
				success: function(obj){
					$('#user-bar').unloading();
					if (obj.status=='success'){									
						var name = $('<a href="#" id="name-link" name="'+obj.data.name+'"></a>').html(obj.data.fullname);
						$('<li></li>').append(name).appendTo('#user-bar');

						$(name).click(function(e){
							e.preventDefault();
							if ($('#user-nav').length>0){
								$('#user-nav').slideUp('normal', function(){ $(this).remove();});
							}else{
								userBar.showUserNav(obj.data.name);
							}

						})
					}else{
						if (obj.status=='fail'){
							alert('Did you log in somewhere else?');
						}else{
							alert('Oops, this is embarrassing. We will work on this error asap!');
						}						
						userBar.refresh();
						$.cookie('token',null, {path:'/'});
					}
				}
			})
		}
	},
	showUserNav: function(name){
		var root = $('<ul id="user-nav"></ul>');
		$('<li></li>').html('<a id="user-nav-profile" href="/@'+name+'">Profile</a>').appendTo(root);
		var signout = $('<a href="#" id="signout-link">Sign Out</a>');
		$(signout).click(function(e){
			e.preventDefault();
			window.location = window.location
			$.cookie('token',null, { path: '/' });
			userBar.refresh();
			$(root).slideUp();
		})
		$('<li></li>').append(signout).appendTo(root);

		$(root).hide().appendTo('#header .right-column').slideDown();
		
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

jQuery.fn.loading = function(){
	$(this).html('Loading...').addClass('loading');
}

jQuery.fn.unloading = function(){
	$(this).empty().removeClass('loading');
}