// Filename: src/view/category.js
// 首页视图

define([
	'namespace',
	'util',
	
	'jquery',
	'underscore',
	'backbone',
	
	// scripts	
	
	// plugins
	'jqueryTmpl'
	
], function(namespace, util, $, _, Backbone) {
	var App = namespace.App, Category = namespace.view();
			
	Category.Views.Category = Backbone.View.extend({
		tagName: 'section',
		
		template: '/app/templates/home/categories.html',
		
		initialize: function() {
			_.bindAll(this);
		},
		
		render: function(done) {
			var view = this;
			
			if (App.Categories.length == 0) {
				App.Categories.bind('reset', this.render);
				App.Categories.fetch();
			}
			
			namespace.tmpl.fetch(this.template, function(tpl) {
				view.el.innerHTML = tpl();
				
				var html = $(tpl()).tmpl({categories: App.Categories.toJSON()});
				view.$el.addClass('category-list').append(html);
				
				if (_.isFunction(done)) {
					done(view.el);
				}
			});
		}
	});
	
	return Category;
});
