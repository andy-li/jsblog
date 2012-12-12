// Filename: src/view/blog.js
// 博客视图

define([
	'namespace',
	'util',
	
	// libs
	'jquery',
	'underscore',
	'backbone',
	
	'src/model/comment',
	
	'src/view/comment',
	
	'jqueryTmpl'
], function(namespace, util, $, _, Backbone, commentModel, commentView) {
	var App = namespace.App, Blog = namespace.view();
	
	Blog.Views.Blog = Backbone.View.extend({
		
		tagName: 'section',
		
		template: '/app/templates/home/blogs.html',
		
		events: {
			'click .comments': 'comments'
		},
		
		initialize: function() {
			_.bindAll(this);
			
			this.categoryId = this.options.categoryId;
			this.startIndex = this.options.startIndex;
			this.pagesize = 5;
		},
		
		render: function(done) {
			var view = this;
			
			namespace.tmpl.fetch(this.template, function(tpl) {
				view.el.innerHTML = tpl();
								
				if (_.isUndefined(view.startIndex) || !view.startIndex || view.startIndex < 0) view.startIndex = 0;
				if (_.isUndefined(view.categoryId) || !view.categoryId || view.categoryId < 0 || view.categoryId == "0") view.categoryId = 0;
				
				var blogs = App.Blogs.toJSON();
				if (view.categoryId) {
					blogs = _.filter(blogs, function(blog) {return blog.categoryId == view.categoryId;});
				}
				
				var json = {
					blogs: blogs,
					startIndex: view.startIndex,
					pagesize: view.pagesize,
					categoryId: view.categoryId
				};								
															
				var html = $(tpl()).tmpl( json );
				
				view.$el.addClass('blog-list').prepend(html);
				
				if (_.isFunction(done)) {
					done(view.el);
				}								
			});
		},
		
		comments: function(e) {			
			var $el = $(e.currentTarget), blogId = $el.attr('value'), blogEl = $el.parents('section.blog');
			
			if (_.isUndefined(blogId) || blogId == "0") return false;
			
			var commentEl = blogEl.find('section.comments');
			if (commentEl[0]) {
				commentEl.toggle();
				return false;
			}
			
			var model = new commentModel.Models.Comment;
			model.set({blogId: blogId}, {silent: true});
				
			var view = new Blog.Views.Comment({blogEl: blogEl, model: model});
			model.fetch();
						
		}
	});
	
	Blog.Views.Comment = commentView.Views.Comment.extend({
		
		initialize: function() {
			this.blogEl = this.options.blogEl;
			commentView.Views.Comment.prototype.initialize.apply(this, this.options);	
		},
		
		done: function(el) {
			this.blogEl.append(el);
		}
	});
	
	return Blog;
});
