// Filename: main.js
// author: andy.li

require([	
	// scripts
	'namespace',
	'util',
	
	// libs
	'jquery',
	'underscore',
	'backbone',	
	
	// scripts
	'src/model/user',	
	'src/model/blog',
	'src/model/category',
	
	'src/module/home',
	'src/module/login',
	'src/module/about',
	'src/module/control',
	'src/module/blog'
	
	// plugins

], function(namespace, util, $, _, Backbone, User, Blog, Category, Home, Login, About, Control, blogView) {
	
	var App = namespace.App;	
	
	App.User = new User.Models.User;
	App.Blogs = new Blog.Collections.Blogs;	
	App.Categories = new Category.Collections.Categories;
	
	App.XHR = [];
	
	var Router = Backbone.Router.extend({
		
		initialize: function () {
			
		},
		
		routes: {
			"": "index",
			"login": "login",
			
			"home": "home",
			"home/:categoryId": "home",
			"home/:categoryId/:startIndex":	"home",
			
			"blog": "blog",
			"blog/:blogId": "blog",
			
			"control": "control",
			"control/:module": "control",
			"control/:module/:params": "control",
			
			"about": "about",
			
			"logout": "logout",
			
			// 			
			"*anything": "redirect"		
		},
		
		navigate: function (fragment, options) {
			options = options || {};
			App.currentPage = false;
			
			if (!Backbone.History.started) return false;
			
			if (options.force_router_function) {
				options.trigger = false;	
			}
						
			Backbone.Router.prototype.navigate.call(this, fragment, options);
			
			if (options.force_router_function) {
				Backbone.history.loadUrl();
			}
		},
		
		lightNav: function(curr) {
			$('html, body').animate({ scrollTop: 0 }, 'slow');
			
			$('#nav ul.nav-links li').removeClass('active');
			$('#nav ul.nav-links').find('li.' + curr).addClass('active');
		},
		
		index: function(hash) {
			return App.router.navigate('home', true);		
		},
		
		home: function(categoryId, startIndex, hash) {			
			var route = this;														
			App.currentPage = 'home';
									
			startIndex = parseInt(startIndex);
			if (_.isNaN(startIndex)) startIndex = 0;
			
			var wrapper = new Home.Modules.Main({categoryId: categoryId, startIndex: startIndex});
			wrapper.render(function() {
				$('#mainBody').html(wrapper.el);
				
				$('body').attr('id', 'home');
			});
			
			this.lightNav('home');																			
		},
		
		blog: function(blogId, hash) {
			if (_.isUndefined(blogId) || _.isNaN(parseInt(blogId))) return App.router.navigate('home', true);
			
			var route = this;
			App.currentPage = 'blog';
						
			var blog = new Blog.Models.Blog({blogId: blogId});
			var wrapper = new blogView.Modules.Main({blogId: blogId, model: blog});
			blog.fetch();
			
			this.lightNav('home');					
		},
		
		control: function(module, params, hash) {
			if (!App.User.has('uid') || App.User.get('groupId') < 2) return App.router.navigate('/', true);
			
			var route = this;
			App.currentPage = 'control';
									
			var modules = ['blogs', 'comments', 'settings'];
			if (_.isUndefined(module) || $.inArray(module, modules) == -1) module = 'dashboard';
			
			var wrapper = new Control.Modules.Main();
			wrapper.render(function() {
				$('body').attr('id', 'control');
				$('#mainBody').html(wrapper.el);
				
				if (route.controlView) {
					if (route.controlView.hasOwnProperty('remove')) route.controlView.remove();
					route.controlView = null;
				}
				
				switch(module) {
					case 'blogs':
						
						break;
					case 'comments':
						
						break;
					case 'settings':
						
						break;
					default:
						route.controlView = new Control.Modules.Dashboard;
						break;
				};
				
				route.controlView.render(function(view) {										
					wrapper.$el.append(view.el);
				});
			});
			
			this.lightNav('control');	
		},
		
		login: function(hash) {						
			if (App.User.has('uid')) return App.router.navigate('/', true);
			
			var router = this;
			App.currentPage = 'login';
									
			var wrapper = new Login.Modules.Main();
			wrapper.render(function() {
				$('#mainBody').html(wrapper.el);
				$('input#email').focus();				
				$('body').attr('id', 'login');
			});
			
			this.lightNav('login');	
		},			
		
		about: function(hash) {
			var router = this;
			App.currentPage = 'about';
			
			var wrapper = new About.Modules.Main;
			wrapper.render(function() {
				$('#mainBody').html(wrapper.el);				
				$('body').attr('id', 'about');
			});
			
			this.lightNav('about');
		},
		
		logout: function(hash) {
			App.User = new User.Models.User;
			
			$.ajax({
				url: util.config.apiHost + 'logout.php',
				type: 'GET',
				dataType: 'JSON',
				data: {},
				success: function(resp) {
										
				},
				complete: function() {
					App.checkIn();
					App.goBack();
				}				
			});									
		},
						
		redirect: function(hash) {
			return App.router.navigate('/', {replace: true});
		}
	});
	
	// 公用数据
	var xhrs = [];
	
	xhrs.push($.ajax({
		url: util.config.apiHost + 'user.php',
		dataType: 'JSON',
		success: function(response) {				
			if (response.status === "success" && !_.isUndefined(response.results.uid)) {							
				App.User.set(response.results, {silent: true});
			}
		}
	}));
	
	xhrs.push($.ajax({
		url: util.config.apiHost + 'blogs.php',
		dataType: 'JSON',
		success: function(response) {
			if (response.status === "success") {
				_.each(response.results, function(blog) {
					App.Blogs.add(new Blog.Models.Blog(blog));
				});
			}
		}
	}));
	
	xhrs.push($.ajax({
		url: util.config.apiHost + 'category.php',
		dataType: 'JSON',
		success: function(response) {
			if (response.status === "success") {
				_.each(response.results, function(category) {
					App.Categories.add(new Category.Models.Category(category));
				});
			}
		}
	}));
	
	$.when.apply(null, xhrs).done(function() {
		
		// 登录后的处理
		App.checkIn = function() {			
			var $nav = $('#nav ul.nav-links');	
			if (!App.User.has('uid')) {			
				$nav.find('li.control').hide();
				$nav.find('li.login').show();	
			} else {
				$nav.find('li.login').hide();
				if (App.User.get('groupId') > 1) {
					$nav.find('li.control').show();
				}				
			}
		};
		
		// 返回上一页
		App.goBack = function() {
			if (_.isUndefined(App.routerHistory) || App.routerHistory.length < 2) return App.router.navigate('/', true);
			
			var href = (function(history) {							
				var his;
				for (var i=0, len=history.length; i<len; i++) {
					his = history.pop();
					if (his != 'login' && his != 'logout') break;
				}	
				return his;
			})(App.routerHistory.slice());
														
			return App.router.navigate(href || '/', true);
		};
				
		// jquery document ready
		$(function() {					
			
			App.checkIn();
			
			// 显示 Head & Footer
			$('#main-header, #main-footer').removeAttr('style');
			
			App.router = new Router();
			
			App.router.on('all', function(a,b,c,d,e,f) {
				if (_.isString(a)) {
					a = a.replace('route:','');
				}
				
				var url = _.filter([a,b,c,d,e,f], function(item) { return !_.isUndefined(item); }).join('/');
				
				if (!_.isUndefined(App.routerHistory)) {
					App.routerHistory.push(url);
					if (App.routerHistory.length > 10) App.routerHistory = App.routerHistory.slice(1);				
				} else {
					App.routerHistory = [url];
				}			
			});
			
			// 	
			Backbone.history.start({pushState: true});
			//Backbone.history.start();		
		});
	});
			
	$(document).on("click", "a:not([data-bypass])", function(evt) {		
		var href = $(this).attr("href");
		var protocol = this.protocol + "//";
		
		if (href && href.slice(0, protocol.length) !== protocol && href.indexOf("javascript:") !== 0) {				
			// 禁止事件			
			evt.preventDefault();
			
			// 强制退出所有xhr请求
			_.each(App.XHR, function(xhrObj){				
				if (!_.isUndefined(xhrObj.xhr) && _.isFunction(xhrObj.xhr.abort)) {			
					xhrObj.xhr.abort();
				}
			});	
						
			// 跳转
			App.router.navigate(href, true);
		}
	});
	
	var loader = $('#loading');	
										
	loader.ajaxStart(function() {
		$(this).show();
	});		
	loader.ajaxStop(function() {
		$(this).hide();
	});
		
	loader.ajaxSend(function(evt, xhr, settings) {
		var ajaxUrl = settings.url;

		if (!_.isUndefined(App.ajaxHistory)) {
			App.ajaxHistory.push(ajaxUrl);
			if (App.ajaxHistory.length > 20) App.ajaxHistory = App.ajaxHistory.slice(1);
		}
		else {
			App.ajaxHistory = [ajaxUrl];	
		}		
	});

	// 全局脚本错误
	window.onerror = function(message, url, line) {
		if (!_.isUndefined(App.errorHistory) && _.isArray(App.errorHistory)) {
			if (_.find(App.errorHistory, function(item) { return _.isEqual([message, url, line], item); })) return;
			App.errorHistory.push([message, url, line]);
		} else {
			App.errorHistory = [[message, url, line]];
		}
		
		loader.hide();
		
		if (url !== '' && +line !== 0) {			
			util.message({message: '发生一个错误，请刷新页面！<br>如果错误还存在，请予支持和理解。谢谢！', status: 'error'});
		}
		
		var routerHistoryString = !_.isUndefined(App.routerHistory) ?  App.routerHistory.join(' - ') : '';
		var ajaxHistoryString = !_.isUndefined(App.ajaxHistory) ? App.ajaxHistory.join(' - ') : '';
		
		// 记录错误日志
		var data = {
			message: message,
			url: url,
			line: line,
			currentPage: window.location.href,
			//userEmail: App.User.get('email'),
			//userId: App.User.get('id'),			
			userAgent: navigator.userAgent,			
			routerHistory: routerHistoryString,
			ajaxHistory: ajaxHistoryString
		};
		
		if (namespace.Debug) {
			 console.log(data);
		} else {
			$.post(util.config.apiHost + 'jserror.php', data);
		}		
	};
});