// Filename: src/module/about.js
// 关于模块

define([
	'namespace',
	'util',
	
	'jquery',
	'underscore',
	'backbone',
	
	'src/view/category',
	
	'jqueryTmpl'
], function(namespace, uitl, $, _, Backbone, categoryView) {
	var App = namespace.App, About = namespace.module();
	
	About.Modules.Main = Backbone.View.extend({
		tagName: 'section',
		
		template: '/app/templates/about/main.html',
		
		initialize: function() {
			_.bindAll(this);
			
			this.category = new categoryView.Views.Category;
		},
		
		render: function(done) {
			var view = this;
			
			namespace.tmpl.fetch(this.template, function(tpl) {
				view.el.innerHTML = tpl();
				
				view.$el.addClass('container').prepend($(tpl()).tmpl());
				
				// categories
				view.category.render(function(el) {
					view.$el.find('#mainSidebar').html(el);
				});
				
				if (_.isFunction(done)) {
					done();
				}
			});
		}
	});
	
	return About;
});
