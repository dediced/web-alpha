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
var API_DOMAIN = 'http://0.0.0.0:3001/api';

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
					url: API_DOMAIN+'/users/fb_login.json?'+accessToken+'&email='+data.email+'&first_name='+data.first_name+'&last_name='+data.last_name,
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
		var signout = $('<a href="#" id="signout-link">Log Out</a>');
		$(signout).click(function(e){
			e.preventDefault();
			$.ajax({
				url: API_DOMAIN+'/users/logout.json?token='+$.cookie('token'),
				dataType: 'json',
				beforeSend: function(){
					$('#user-bar').loading();
				},
				success: function(data){
					window.location = window.location
					$.cookie('token',null, { path: '/' });
					userBar.refresh();
					$(root).slideUp();
				}
			})
		})
		$('<li></li>').append(signout).appendTo(root);

		$(root).hide().appendTo('#header .right-column').slideDown();
		
	},
	showLogin: function(){
		var wrapper = $('<div id="login-wrapper"></div>');
		var left = $('<div id="login-left"></div>').appendTo(wrapper);
		var right = $('<div id="login-right"></div>').appendTo(wrapper);
		var login = $('<div id="login-form"></div>').appendTo(left);
		var email = $('<input type="text" placeholder="Email" id="login-email"/>').appendTo(login);
		var password = $('<input type="password" placeholder="Password" id="login-password"/>').appendTo(login);
		var submit = $('<a href="#" id="login-submit"></a>').html('Log In').appendTo(login);
		$(password).keypress(function(e){
			if (e.keyCode==13){
				submitLogin();					
			}
		})		
		$(submit).click(function(e){
			e.preventDefault();
			submitLogin();
		})
		$('<p class="or"></p>').html('or').appendTo(left);
		var fb_wrapper = $('<div id="fb-signin-wrapper"></div>').appendTo(left);
		$('<a></a>').attr('href', 'https://www.facebook.com/dialog/oauth?client_id='+FB_APP_ID+'&redirect_uri='+escape(window.location)+'&scope=email&response_type=token').html('<img src="/assets/f_logo.png">Facebook log in').appendTo(fb_wrapper);		
		
		var signup = $('<div id="login-signup"></div>').appendTo(right);
		var description = $('<div id="login-signup-description"></div>').html('Not a member yet?').appendTo(signup);
		var signup_link = $('<a href="/signup" id="login-signup-link"></a>').html('Sign Up').appendTo(signup);
		
		$(wrapper).onStage();		
		
		
		function submitLogin(){
			var submit_content = $(submit).html();
			$.ajax({
				url: API_DOMAIN+'/users/login.json?email='+escape($(email).val())+'&password='+escape($(password).val()),
				dataType: 'json',
				beforeSend: function(){
					$(submit).loading();
				},
				success: function(obj){
					$(submit).empty().unloading();
					$(submit).html(submit_content);
					if (obj.status=='success'){															
						$.cookie('token', obj.token, {expires: 7, path: '/'});						
						window.location = '/';
					}else{
						$('#stage-layer').fadeOut(function(){$(this).remove()});
						errorMessage(obj.message);
					}
				}
			})
			
		}
	}
}

jQuery.fn.onStage = function(){
	var layer = $('<div id="stage-layer"></div>').hide().appendTo('body').fadeIn('fast');
	var wrapper = $('<div id="stage-wrapper"></div>').appendTo(layer);
	var stage = $(this).addClass('stage').hide().appendTo(wrapper).fadeIn();
	var close = $('<a class="icon close-icon" href="#"></a>').prependTo(stage);
	$(close).click(function(e){
		e.preventDefault();
		$(layer).fadeOut(function(){remove();});
	})
}

function loading(){
	unloading();
	$('<div id="loading"></div>').html('loading').hide().appendTo('body').fadeIn();
}

function unloading(){
	$('#loading').remove();//fadeOut(function(){$(this).remove();});
}

function errorMessage(m){
	$('#message-wrapper').remove();
	$('<div id="message-wrapper" class="error"></div>').append($('<div id="message-content"></div>').html(m)).hide().prependTo($('#content')).slideDown();
}

function resetMessage(){
	$.each($('.invalid-input'), function(i,v){
		$(v).removeClass('invalid-input');
	})
	$('#message-wrapper').remove();
}



// function loading(){
// 	unloading();
// 	var src = "/assets/loading/loading";
// 	i = 0;
// 	var img = $('<img>').attr('src', src+'_'+i+'.png');
// 	
// 	$('<div id="loading"></div>').hide().append(img).append($('<div>Loading...</div>')).appendTo('body').fadeIn();
// 	setInterval(function(){$(img).attr('src', src+'_'+i+'.png'); i = (i+1)%23;}, 100);
// }
// 
// function unloading(){
// 	$('#loading').fadeOut(function(){$(this).remove()});
// }
