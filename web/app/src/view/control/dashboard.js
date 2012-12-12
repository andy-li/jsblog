// Filename: src/view/control/dashboard.js
// 控制台 > 首页 

define([
	// common
	'namespace',
	'util',
	
	// libs
	'jquery',
	'underscore',
	'backbone'
	
	// scripts
	
	// templates
	
	// plugins
	
], function(namespace, util, $, _, Backbone) {
	var App = namespace.App, Dashboard = namespace.view();
	
	Dashboard.Views.Dashboard = Backbone.View.extend({
		
		tagName: 'section',
		
		template: '/app/templates/control/dashboard.html',
		
		initialize: function() {
			
		},
		
		render: function(done) {
			var view = this;			
			namespace.tmpl.fetch(this.template, function(tpl) {
				view.el.innerHTML = tpl();
				
				view.$el.prepend($(tpl()).tmpl({user: App.User.toJSON()}));
				
				if (_.isFunction(done)) {
					done(view);
				}
			});						
		}
	});
	
	return Dashboard;
});
