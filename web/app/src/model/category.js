// Filename: src/model/category.js
// 博文类别模型

define([
	'namespace',
	'util',
	
	// libs
	'jquery',
	'underscore',
	'backbone'
	
], function(namespace, util, $, _, Backbone) {
	var Category = namespace.model();
	
	Category.Models.Category = Backbone.Model.extend({
		url: util.config.apiHost + 'category.php',
		
		initialize: function() {
			
		},
		
		parse: function(resp) {
			var data = util.parseJSON(resp);
			if (data !== false) return data;
		}
	});
	
	Category.Collections.Categories = Backbone.Collection.extend({
		url: util.config.apiHost + 'category.php',
		
		model: Category.Models.Category,
		
		initialize: function() {
			
		},
		
		parse: function(resp) {
			var data = util.parseJSON(resp);
			if (data === false) return [];
			else return data;
		}
	});
	
	return Category;
});
