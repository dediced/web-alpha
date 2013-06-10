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
	set: function(data){
		link.setTitle(data.link.title);
		link.setImg(data.link.img);
		var share = $('<div class="dicepreview-share"></div>').appendTo(link.dp);
		$('<a class="dicepreview-share-user"> </a> ').html(data.user.name + " ").attr("href",'/@'+data.user.username).appendTo(share);
		$(' <span class="dicepreview-share-note"> </span> ').html(data.note + " ").appendTo(share);
		$(' <span class="dicepreview-share-timestamp"> </span> ').html(data.link.created_at).appendTo(share);
	},
	show: function(){
		loading();
		$('#content').empty();
		var wrapper = $('<div id="link-wrapper"></div>').appendTo('#content');
		$('<div id="link-left"></div>').append(link.dp).hide().appendTo(wrapper).delay(100).show("slide", {direction: "right"}, 500);;
		var iframe = $('<iframe id="link_iframe" width=100% height=100%></iframe').attr('src', 'http://'+link.url);
		
		$('<div id="link-right"></div>').append(iframe).appendTo(wrapper);
		unloading();
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
			dice.dismiss();
		})
		
		var url = $('<div id="dicebar-url"></div>').appendTo(wrapper);
		$('<div></div>').html('Add http://').appendTo(url);
		var url_field = $('<input type="text" size="40" placeholder="domain.com/path">').appendTo(url);
		function getUrl(){
			var uv = $(url_field).val();
			var uvs = uv.split("://");
			if(uvs.length>1){
				uv = uvs[1];
				$(url_field).val(uv);
			}
			return uv;
		}
		$(url_field).keypress(function(e){
			if (e.keyCode==13){
				dice.url = getUrl();
				link.url = getUrl();
				dice.crawl();
			}
		})
		var add = $('<a href="#" id="dicebar-url-add"></a>').html('enter').appendTo(url);
		$(add).click(function(e){
			e.preventDefault();
			dice.url = getUrl();
			link.url = getUrl();
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
					dice.dismiss();
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
		var save = $('<a href="#" id="dice-save-button"></a>').html('save').hide().appendTo(dp).click(function(e){
			e.preventDefault();
			$(this).remove();
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
				loading();
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
				}else{
					dp.fadeIn();
				}
				unloading();
			}
		})
		
	},
	gallery: function(imgs){
		var N = 7;
		link.dp.hide();
		var wrapper = $('<div id="dicepreview-gallery"></div>').empty().hide().appendTo('#dicepreview-wrapper');
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
		console.log("dice dismissed");
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