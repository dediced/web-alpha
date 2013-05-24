var FB_APP_ID = '361605033909866';
// var API_DOMAIN = 'http://localhost:3000';
// var OLD_API_DOMAIN = 'http://localhost:3001';
var API_DOMAIN = 'http://dediced-engine-2.herokuapp.com';
var OLD_API_DOMAIN = 'http://dediced.heroku.com';

$(document).ready(function(){
	userBar.refresh();
	// loading();
	$('#footer').animate({opacity: "0.7", marginBottom: "-70px"}, 1000).hover(
		function(){
			$(this).animate({opacity: "1.0", marginBottom: "0px", height:"+=20"}, 1000);
		},
		function(){
			$(this).animate({opacity: "0.7", marginBottom: "-70px", height:"-=20"}, 1000);
	});
		// if (window.location.hash.length>0){
		// 	var params = window.location.hash.substring(1).split('&');
		// 	var accessToken = params[0].split('=')[1];
		// 	var expires_in = params[1].split('=')[1];
		// 	var now = new Date().getTime();
		// 	var expires = now + parseInt(expires_in)*1000;
		// 	$.cookie('fb_access_token', accessToken, {expires: 7, path: '/'});
		// 	$.cookie('expires', expires, {expires: 7, path: '/'});
		// 	var url = "https://graph.facebook.com/me?access_token="+accessToken;
		// 	$.ajax({
		// 		url: url,
		// 		dataType: 'json',
		// 		success: function(data){				
		// 			$.ajax({
		// 				url: API_DOMAIN+'/users/fb_signin.json?'+accessToken,
		// 				dataType: 'json',
		// 				type: 'post',
		// 				data: data,
		// 				success: function(obj){						
		// 					$.cookie('token',obj.token, {expires: 7, path: '/'});
		// 					$.cookie('username',obj.data.username, {expires: 7, path: '/'});
		// 					track(ANALYTICS_URL+'&category=username&event=fb-login&token='+obj.data.username);				
		// 					setTimeout(function(){window.location = '/user/'+obj.data.username}, 500);	
		// 				}
		// 			})
		// 		}
		// 	})
		// }else{
		// 	if ($.cookie('expires')!=null){
		// 		if (parseInt($.cookie('expires')) < (new Date().getTime())){
		// 			// window.location = 'https://www.facebook.com/dialog/oauth?client_id='+FB_APP_ID+'&redirect_uri='+DOMAIN+'&scope=email,user_checkins,xmpp_login&response_type=token';				
		// 		}
		// 	}
		// }
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
		var api_token = $.cookie('api_token');
		if (api_token==null){
			var login = $('<li></li>').html('<a href="#" id="login-button"> Log In</a>').appendTo('#user-bar');
			$(login).click(function(e){
				e.preventDefault();
				userBar.showLogin();			
			})			
		}else{
			$.ajax({
				url: API_DOMAIN + '/users/tiny/'+$.cookie('username')+'.json',
				type: 'get',
				dataType: 'json',
				beforeSend: function(){
					loading();
				},
				success: function(obj){
					unloading();
					if (obj.status=='success'){
						var add = $('<a href="#" id="add"></a>').html('add +');
						$('<li></li>').append(add).appendTo('#user-bar');
						$(add).click(function(e){
							e.preventDefault();
							dice.launch();
						})
						
						var name = $('<a href="#" id="name-link" name="'+obj.user_tiny.username+'"></a>').html(obj.user_tiny.name);
						$('<li></li>').append(name).appendTo('#user-bar');

						$(name).click(function(e){
							e.preventDefault();							
							if ($('#user-nav').length>0){
								$('#user-nav').slideUp('normal', function(){ $(this).remove();});
							}else{
								userBar.showUserNav(obj.user_tiny.name);
							}

						})
					}else{
						if (obj.status=='fail'){
							alert('Did you log in somewhere else?');
						}else{
							alert('Oops, this is embarrassing. We will work on this error asap!');
						}						
						userBar.refresh();
						$.cookie('api_token',null, {path:'/'});
					}
				}
			})
		}
	},
	showUserNav: function(name){
		var root = $('<ul id="user-nav"></ul>');
		$('<li></li>').html('<a id="user-nav-profile" href="/@'+$.cookie('username')+'">Profile</a>').appendTo(root);
		var logout = $('<a href="#" id="signout-link">Log Out</a>');
		$(logout).click(function(e){
			e.preventDefault();
			$.ajax({				
				url: API_DOMAIN+'/users/logout.json',
				type: 'post',
				data: {
					api_token: $.cookie('api_token')
				},
				dataType: 'json',
				beforeSend: function(){
					loading();
				},
				success: function(data){					
					unloading();
					$.cookie('api_token',null, { path: '/' });
					$.cookie('username',null, { path: '/' });
					$.cookie('name',null, { path: '/' });
					$.cookie('email',null, { path: '/' });
					userBar.refresh();
					$(root).slideUp();
					window.location = window.location
				}
			})
		})
		$('<li></li>').append(logout).appendTo(root);	
		$(root).hide().appendTo('#user-bar').slideDown();
		
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
				url: API_DOMAIN+'/users/login.json',
				type: 'post',
				data: {
					email: escape($(email).val()),
					password: escape($(password).val())
				},
				dataType: 'json',
				beforeSend: function(){
					loading();
				},
				success: function(obj){
					$(submit).empty();					
					$(submit).html(submit_content);
					if (obj.status=='success'){	
						// alert(JSON.stringify(obj));
						$.cookie('api_token', obj.api_token, {expires: 7, path: '/'});
						$.cookie('username', obj.user_tiny.username, {expires: 7, path: '/'});						
						$.cookie('name', obj.user_tiny.name, {expires: 7, path: '/'});
						$.cookie('email', obj.email, {expires: 7, path: '/'});
						window.location = '/';
					}else{
						$('#stage-layer').fadeOut(function(){$(this).remove()});
						errorMessage(obj.message);
					}
					unloading();
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

var loadingInterval;

function loading(){
	// alert("loading");
	if($("#loading").length==0){		
		var loading = $('<div id="loading"></div>').hide().prependTo("body").fadeIn();
		var src = "/assets/loading/loading";
		var i = 1;
		var img = $('<img>').attr('src', src+'_'+i+'.png').appendTo(loading);
		loadingInterval = setInterval(function(){$(img).attr('src', src+'_'+i+'.png'); i = (i+1)%26+1;}, 120);		
	}else{
		unloading();
	}
}

function unloading(){
	window.clearInterval(loadingInterval);
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
