// var domain = 'http://localhost:3000';
var domain = 'http://dediced-alpha.heroku.com';
// var api_domain = 'http://localhost:3001';
var api_domain = 'http://dediced-engine-2.herokuapp.com';
var link = {
	title: null,
	img_src: null,
	url: null,
	dp: $('<div id="dicepreview"></div>'),
	dp_title: $('<div id="dicepreview-title"></div>'),
	dp_img: $('<img id="dicepreview-img">'),
	setup: function(){
		link.dp_title.appendTo(link.dp);
		link.dp_img.appendTo(link.dp);
		return link.dp;
	},
	setTitle: function(title){
		link.title = title;
		link.dp_title.html(title);
	},
	setImg: function(src){
		link.img_src = src;
		link.dp_img.attr('src', src);
	},
	show: function(){
		$('#content').empty();
		var wrapper = $('<div id="link-wrapper"></div>').appendTo('#content');
		$('<div id="link-left"></div>').append(link.dp).hide().appendTo(wrapper).delay(100).show("slide", {direction: "right"}, 500);;
		$('<div id="link-right"></div>').append($('<iframe width=100% height=100%></iframe').attr('src', 'http://'+link.url)).appendTo(wrapper);
	}
}

var dice = {
	url: null,
	launch: function(){
		console.log('dice launced');
		if ($('#header-wrapper').length>0){
			$('#header-wrapper').hide("slide", {direction: "up"}, 300);
		}
		var wrapper = $('<div id="dicebar-wrapper"></div>');
		var control = $('<ul id="dicebar-control"></ul>');
		wrapper.append(control).hide().prependTo('body').delay(300).show("slide", {direction: "up"}, 500);
		var close = $('<a href="#" id="dice-close"></a>').html('close');
		$('<li></li>').append(close).appendTo(control);
		$(close).click(function(e){
			e.preventDefault();
			dice.url = $(url_field).val();
			link.url = $(url_field).val();
			dice.dismiss();
		})
		
		var url = $('<div id="dicebar-url"></div>').appendTo(wrapper);
		$('<div></div>').html('Add http://').appendTo(url);
		var url_field = $('<input type="text" size="40" placeholder="domain.com/path">').appendTo(url);
		$(url_field).keypress(function(e){
			if (e.keyCode==13){
				dice.url = $(url_field).val();
				link.url = $(url_field).val();
				dice.crawl();
			}
		})
		var add = $('<a href="#" id="dicebar-url-add"></a>').html('enter').appendTo(url);
		$(add).click(function(e){
			e.preventDefault();
			dice.crawl();
		})
	},
	save: function(){
		$.ajax({
			url: api_domain+'/links/create.json',
			data: {
				api_token: $.cookie('api_token'),
				title: link.title,
				img_src: link.img_src,
				url: link.url
			},
			type: 'post',
			dataType: 'json',
			beforeSend: function(){
				loading();
			},
			success: function(obj){				
				unloading();
				if(obj.status=='success'){
					dice.dismiss();
					link.show();					
				}else{
					errorMessage(obj.message);
				}
			}
		})
	},
	crawl: function(){
		$('#dicepreview-canvas').fadeOut(function(){$(this).remove();});
		$('#dicepreview-wrapper').fadeOut(function(){$(this).remove();});			
		
		var canvas = $('<div id="dicepreview-canvas"></div>').hide().appendTo('body').fadeIn();
		var wrapper = $('<div id="dicepreview-wrapper"></div>').hide().appendTo('body').fadeIn();
		var dp = link.setup().hide().appendTo(wrapper);
		var save = $('<a href="#" id="dice-save-button"></a>').html('save').hide().appendTo(wrapper).click(function(e){
			e.preventDefault();
			dice.save();			
		});
		$.ajax({
			url: api_domain+'/links/preprocessing.json',
			type: 'post',
			data: {
				url: dice.url,
				r: Math.random()
			},
			dataType: 'json',
			beforeSend: function(){
				// loading();
			},
			success: function(obj){
				if (obj.status=='success'){
					link.setTitle(obj.data.name);
				}else{
					link.setTitle(dice.url);
				}
				if (obj.status=='success' & obj.data.imgs.length > 0){
					link.setImg(obj.data.imgs[0]);
					dp.fadeIn();
					console.log('image search result...'+ obj.data.imgs[0]);
					$(save).fadeIn();
					link.dp_img.click(function(e){
						e.preventDefault();
						dice.gallery(obj.data.imgs);
					})
				}// else{
				// 					console.log('Google image search...');
				// 					$.ajax({
				// 						url: api_domain+'/links/google_imgs.json?name='+encodeURIComponent($('#dicepreview-title').html())+'&r='+Math.random(),
				// 						dataType: 'json',
				// 						beforeSend: function(){
				// 							// loading();
				// 						},
				// 						success: function(obj2){
				// 							// unloading();
				// 							if (obj2.status=='success'){
				// 								console.log('Google image search result...'+ obj2.data[0]);
				// 								link.setImg(obj2.data[0]);
				// 								$(save).fadeIn();
				// 								dp.fadeIn();
				// 								link.dp_img.click(function(e){
				// 									e.preventDefault();
				// 									dice.gallery(obj2.data);
				// 								})
				// 							}else{
				// 								alert('unable to find images');
				// 							}
				// 						}
				// 					})
				// 				}
			}
		})
		
	},
	gallery: function(imgs){
		var N = 5;
		link.dp.hide();
		var wrapper = $('<div id="dicepreview-gallery"></div>').hide().appendTo('#dicepreview-wrapper');
		for (var i=0; i<N; i++){
			$('<div class="dg-col"></div>').attr('id', 'dg-'+i).appendTo(wrapper);
		}
		for (var i=0; i<imgs.length; i++){
			$('<img class="dicepreview-gallery-img">').attr('src', imgs[i]).appendTo('#dg-'+i%N).click(function(e){
				e.preventDefault();
				console.log('changed preview img...: '+$('#dicepreview-img').attr('src'));
				link.setImg($(this).attr('src'));
				$(wrapper).remove();
				link.dp.fadeIn();
				console.log('changed preview img 2 ...: '+$('#dicepreview-img').attr('src'));
			});
		}
		$(wrapper).fadeIn();
	},
	dismiss: function(){
		if ($('#dicebar-wrapper').length>0){
			$('#dicebar-wrapper').hide("slide", {direction: "up"}, 300, function(){$(this).remove();});
		}
		
		if ($('#header-wrapper').length>0){
			$('#header-wrapper').delay(300).show("slide", {direction: "up"}, 500);
		}
		
		$('#dicepreview-canvas').fadeOut(function(){$(this).remove();});
		$('#dicepreview-wrapper').fadeOut(function(){$(this).remove();});
	}
}