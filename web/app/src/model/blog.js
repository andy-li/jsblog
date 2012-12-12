// Filename: src/model/blog.js
// 博文模型

define([
	'namespace',
	'util',
	
	'jquery',
	'underscore',
	'backbone'
], function(namespace, util, $, _, Backbone) {
	var Blog = namespace.model();
	
	Blog.Models.Blog = Backbone.Model.extend({
		defaults: {
			blogId: 0
		},
		
		url: function() {
			return util.config.apiHost + 'blog.php?blogId=' + this.get('blogId');
		},
		
		initialize: function() {
			
		},
		
		parse: function(resp) {
			var data = util.parseJSON(resp);
			if (data !== false) return data;
		}
	});
	
	Blog.Collections.Blogs = Backbone.Collection.extend({
		url: util.config.apiHost + 'blogs.php',
		
		model: Blog.Models.Blog,
		
		initialize: function() {
			
		},
		
		parse: function(resp) {
			var data = util.parseJSON(resp);
			if (data === false) return [];
			else return data;
		}
	});
	
	return Blog;
});
