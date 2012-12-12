// Filename: src/module/home.js
// 首页模块

define([
	'namespace',
	'util',
	
	'jquery',
	'underscore',
	'backbone',
	
	// scripts
	'src/view/blog',
	'src/view/category',
	
	'jqueryTmpl'
	
], function(namespace, util, $, _, Backbone, blogView, categoryView) {
	var App = namespace.App, Home = namespace.module();
	
	Home.Modules.Main = Backbone.View.extend({
		tagName: 'section',
		
		template: '/app/templates/home/main.html',
		
		initialize: function() {
			_.bindAll(this);
			
			this.blog = new blogView.Views.Blog(this.options);
			this.category = new categoryView.Views.Category;
		},
		
		render: function(done) {
			var view = this;
			namespace.tmpl.fetch(this.template, function(tpl) {
				view.el.innerHTML = tpl();
				
				view.$el.addClass('container').prepend($(tpl()).tmpl());
				
				// blogs
				view.blog.render(function(el) {
					view.$el.find('#mainContent').html(el);
				});
				
				// categories
				view.category.render(function(el) {
					view.$el.find('#mainSidebar').html(el);
				});
				
				// callback
				if (_.isFunction(done)) {
					done();
				}
			});
		}
	});
	
	return Home;
});
