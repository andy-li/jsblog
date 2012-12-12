// Filename: src/model/comments.js
// 评论模型

define([
	'namespace',
	'util',
	
	'jquery',
	'underscore',
	'backbone'
	
], function(namespace, util, $, _, Backbone) {
	var Comment = namespace.model();
	
	Comment.Models.Comment = Backbone.Model.extend({
		url: function() {
			return util.config.apiHost + 'comments.php?blogId=' + this.get('blogId');	
		},
		
		initialize: function() {
			
		},
		
		fetch: function(options) {								
			if (!this.has('allComments') || !this.get('allComments').hasOwnProperty(this.get('blogId'))) {
				Backbone.Model.prototype.fetch.call(this, options);
			}
			else {
				this.trigger('change');
			}

			return this;
		},
		
		parse: function(resp) {
			var data = util.parseJSON(resp);
			if (data !== false) {
				var comments = {};
				comments[this.get('blogId')] = data;
				
				return {allComments: comments}; 
			}
		}
	});
	
	return Comment;
});
