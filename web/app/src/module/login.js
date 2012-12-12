// Filename: src/modules/login.js
// 登录模块

define([
	'namespace',
	'util',
	
	'jquery',
	'underscore',
	'backbone'
	
], function(namespace, util, $, _, Backbone) {
	var App = namespace.App, Login = namespace.module();
	
	Login.Modules.Main = Backbone.View.extend({
		tagName: 'section',
		
		template: '/app/templates/login/login.html',
		
		events: {
			'click #doLogin': 'doLogin',
			'submit .login-form': 'formSubmit'
		},
		
		initialize: function() {
			_.bindAll(this);						
		},
		
		render: function(done) {
			var view = this;
			
			namespace.tmpl.fetch(this.template, function(tpl) {
				view.el.innerHTML = tpl();
				
				view.$el.addClass('container').prepend($(tpl()).tmpl());
				
				if (_.isFunction(done)) {
					done();
				}
			});
		},
		
		doLogin: function(e) {
			var $el = $(e.currentTarget),
				$email = $('input#email'),
				$passwd = $('input#passwd'),
				email = $email.val(),
				passwd = $passwd.val();			
			
												
			if (email == '' || ! util.isEmail(email)) {				
				$email.parent().addClass('error').find('label').text('需要输入正确的邮箱格式：');
				return false;
			}	
			
			if (passwd == '' || passwd.length < 6) {
				$passwd.parent().addClass('error').find('label').text('需要输入正确的密码：');
				return false;
			}
			
			$el.addClass('disabled').attr('disabled', 'disabled');
			
			var data = {
				email: email,
				passwd: passwd
			};
			
			$.ajax({
				url: util.config.apiHost + 'login.php',
				type: 'POST',
				dataType: 'JSON',
				data: data,
				success: function(resp) {
					
					if (resp.status !== "success") {
						util.message({status: 'error', message: resp.message || '登录失败。'});
						$email.focus();
						$passwd.val('');						
						return false;
					}
					
					util.message({message: '登录成功。'});
					
					// 更新用户信息					
					App.User.set(resp.results, {silent: true});
					
					App.checkIn();
					App.goBack();																																								
				},
				
				complete: function() {
					$el.removeClass('disabled').removeAttr('disabled');
				}				
			});		
		},
		
		formSubmit: function(e) {
			e.preventDefault();
		}
	});
	
	return Login;
});
