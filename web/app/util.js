/*
 * Filename: src/util.js
 * 公用
 */

define([
	// libs
	'jquery',
	'underscore'
	
], function($, _) {

	var util = {};
	 
	util.config = {
		apiHost: 'http://api.blogger.com/',
	};
	
	util._slice = [].slice;
	
	util.inArray = function(v, a){
		var o = false;
		for (var i=0, m=a.length; i<m; i++){
			if(a[i] == v){
				o = true;
				break;
			}
		}
		return o;
	};
	
	/*
	 * 验证邮箱
	 * 
	 * @param email 待验证字符串
	 * @return boolean
	 */
	util.isEmail = function(email) {	    
        var re = /^([a-zA-Z0-9]+[_|-|.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|-|.]?)*[a-zA-Z0-9]+.[a-zA-Z]{2,3}$/;
        return re.test(email);
	};
	
	/*
	 * 显示消息
	 *
	 * @param opt
	 *     status: success | error | warning
	 *     message: 消息文字
	 */
	util.message = function(opt) {
		if (_.isUndefined(opt)) return;
				
		if (opt.status == 'refresh') window.location.reload();
				
		var el = $('#growl'), growl = el.find('section.' + (opt.status || 'success')), timer = 3500;

		el.find('section.growl').removeClass('on');

		growl.find('strong').html(opt.message);
		growl.addClass('on');

		setTimeout(function() {
			growl.removeClass('on');
		}, timer);
	};

	/*
	 * 禁止冒泡
	 * 
	 * @param el jQuery el
	 */
	util.unBubble = function(el){
    	el.bind('click', function(e){
	        if(e && e.stopPropagation) e.stopPropagation();
    	    else window.event.cancelBubble = true;
    	});
	};
	
	/*
	 * 判断读取的JSON是否正常
	 * 
	 * @param response 远程读取的数据
	 * @return (boolean || object) 如果数据不合法，返回False, 否则返回处理后的JSON数据
	 */
	util.parseJSON = function(response) {
		var ret;
		
		if (_.isUndefined(response) || _.isUndefined(response.results)) {			
			util.message({message: '数据格式无法解析。', status: 'error'});
			ret = false;			
		}
		
		if (_.isUndefined(response.status) || response.status != 'success') {			
			util.message({message: response.message || '数据读取异常：未发现错误编号。', status: 'error'});
			ret = false;
		}
		
		return ret === false ? false : response.results;		
	};
		
	return util;
});
