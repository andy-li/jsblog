// Filename: src/module/blog.js
// 博文页

define([
	// common
	'namespace',
	'util',
	
	// libs
	'jquery',
	'underscore',
	'backbone',
	
	// scripts
	'src/model/comment',
	'src/view/comment',
	'src/view/category'
	
	// templates
	
	// plugins
	
], function(namespace, util, $, _, Backbone, commentModel, commentView, categoryView) {
	var App = namespace.App, Blog = namespace.module();
	
	Blog.Modules.Comment = commentView.Views.Comment.extend({
		initialize: function() {
			this.commentEl = this.options.commentEl;
			commentView.Views.Comment.prototype.initialize.apply(this, this.options);	
		},
		
		done: function(el) {
			this.commentEl.append(el);
		}
	});
	
	Blog.Modules.Category = categoryView.Views.Category.extend({/* ... */});
	
	Blog.Modules.Main = Backbone.View.extend({
		tagName: 'section',
		
		template: '/app/templates/blog/blog.html',
		
		initialize: function() {
			_.bindAll(this);
						
			this.model.bind('change', this.render);						
		},
		
		render: function(done) {
			var view = this;
			
			namespace.tmpl.fetch(this.template, function(tpl) {
				view.el.innerHTML = tpl();				
				view.$el.prepend($(tpl()).tmpl( view.model.toJSON() ));
				
				// categories
				var category = new Blog.Modules.Category;
				category.render(function(el) {
					view.$el.find('#mainSidebar').html(el);
				});
				
				// comments
				var model = new commentModel.Models.Comment,
					commentEl = view.$el.find('section.blog');
				model.set({blogId: view.model.get('blogId')}, {silent: true});
				
				var comments = new Blog.Modules.Comment({commentEl: commentEl, model: model});
				model.fetch();
				
				if (_.isFunction(done)) {
					done();
				}
				view.$el.addClass('container');
				$('#mainBody').html(view.el);				
			});
		}
	});
	
	return Blog;
});
