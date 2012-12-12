// Filename: src/module/control.js
// 控制台

define([
	'namespace',
	'util',
	
	'jquery',
	'underscore',
	'backbone',
	
	// scripts
	'src/view/control/dashboard'
	
], function(namespace, util, $, _, Backbone, Dashboard) {
	var App = namespace.App, Control = namespace.module();
	
	Control.Modules.Dashboard = Dashboard.Views.Dashboard.extend({/* ... */});
	
	Control.Modules.Main = Backbone.View.extend({
		tagName: 'section',
		
		initialize: function() {
			
		},
		
		render: function(done) {
			var view = this;
			
			view.$el.addClass('container');
			
			if (_.isFunction(done)) {
				done();
			}
		}
	});
	
	return Control;
});
