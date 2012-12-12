// Filename: src/model/user.js
// 用户模型

define([
	// common
	'namespace',
	'util',
	
	// libs
	'jquery',
	'underscore',
	'backbone'
	
	// scripts
	
	// plugins
	
], function(namespace, util, $, _, Backbone) {
	
	var User = namespace.model();
	
	User.Models.User = Backbone.Model.extend({
		/*
		defaults: {
			uid: 0,
			email: '',
			name: '',
			groupId: -1
		},
		*/
		urlRoot: util.config.apiHost + 'user.php',
		
		parse: function(response) {			
			var data = util.parseJSON(response);
			if (data === false) {				
				util.message({message: '无法读取用户信息', status: 'error'});
			} else {
				return data;
			}
		}
	});
	
	return User;
});
