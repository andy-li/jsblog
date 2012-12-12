// Filename: src/view/comment.js
// 评论试图

define([
	'namespace',
	'util',
	
	'jquery',
	'underscore',
	'backbone',
	
	'jqueryTmpl'
	
], function(namespace, util, $, _, Backbone) {
	var Comment = namespace.view();
	
	Comment.Views.Comment = Backbone.View.extend({		
		tagName: 'section',
		
		template: '/app/templates/comment/comments.html',
		
		events: {
			'click button[type=submit]': 'add',
			'submit .add-comment-form': 'formSubmit'	
		},
		
		initialize: function() {
			_.bindAll(this);
			
			this.model.bind('change', this.render);
		},
		
		render: function() {
			var view = this;
			namespace.tmpl.fetch(this.template, function(tpl) {
				view.el.innerHTML = tpl();
				
				var json = view.model.toJSON();

				var html = $(tpl()).tmpl( json );
				
				view.$el.addClass('comments').attr('blogId', json.blogId);
				view.$el.append(html);
				
				if (_.isFunction(view.done)) {
					view.done(view.el);
				}
			});
		},
		
		add: function(e) {
			var $el = $(e.currentTarget), 
				commentEl = $el.parents('section.comments'),
				blogId = parseInt(commentEl.attr('blogId')),
				nicknameEl = commentEl.find('#nickname'),
				nickname = nicknameEl.val(),
				contentEl = commentEl.find('#content'),
				content = contentEl.val();
			
			if (_.isNaN(blogId)) return util.message({status: 'error', message: '缺少博文ID。'});
			if (nickname == "") return util.message({status: 'error', message: '请填写一个昵称。'});
			if (content == "" || content.length < 2)  return util.message({status: 'error', message: '评论内容太短啦！'});
			
			var data = {
				blogId: blogId,
				nickname: nickname,
				content: content	
			};
			
			$.ajax({
				url: util.config.apiHost + 'addComment.php',
				type: 'POST',
				data: data,
				success: function(resp) {
					if (resp.status !== "success") {
						util.message({status: 'error', message: resp.message || '发布评论失败。'});						
					} else {
						util.message({message: '发布评论成功。'});
						
						var tpl = commentEl.find('#addCommentTmpl'),
							ul =  commentEl.find('ul.comment-list'),
							add = {
								nickname: nickname,
								content: content,
								timer: '1秒钟前'
							};
						// 插入刚发布的评论	
						ul.prepend($(tpl).tmpl({add: add}));
						// 更新视频次数
						var countEl = commentEl.parent().find('em.commentsCount'),
							count = parseInt(countEl.text());
													
						count = _.isNaN(count) ? 1 : count + 1;						
						countEl.text(count);
						
						// 清空  input框
						nicknameEl.val('');
						contentEl.val('');
						
						// 清空empty标记
						var emptyEl = ul.find('li.empty');
						if (emptyEl[0]) emptyEl.remove(); 
					}
				}
			});
		},
		
		formSubmit: function(e) {
			e.preventDefault();
		}
	});
	
	return Comment;
});
