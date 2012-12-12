// Filename: namespace.js
// 主接口程序

define([	
	// libs
	'jquery',
	'underscore',
	'backbone',
	
	// common
	'util'
], function($, _, Backbone, util) {
	
	var meta = {
		/*
		 * 继承
		 */
		create: function(o) {
			var F = function() {};
			F.prototype = o;
			return new F();
		},
		
		/*
		 * 创建节点
		 */
		add: function() {
			var a = arguments, o = null, d, i, len = a.length;
			for (i=0; i<len; i++) {
				d = ("" + a[i]).split(".");
				var _win = this;
				if (/^(namespace|\*)$/.test(d[0])) {
					var j = 1,
					_win = this;
				} else {
						var j = 0, _win = window;
				}
				for (; j<d.length; j++) {
					if(typeof _win[d[j]] === 'undefined') _win[d[j]] = {};
					_win = _win[d[j]];
				}
			}
			return _win;
		},
		
		/*
		 * mix
		 */
		mix: function(r, s, ov) {
			if (!s || !r) return r;
			if ( typeof ov === 'undefined') ov = true;
			var i;
			for (i in s) {
				if (ov || !(i in r)) {
					r[i] = s[i];
				}
			}
			return r;
		}
	};
	
	var seed = {}, namespace = meta.mix(seed, meta);
	
	namespace.mix(namespace, {
		
		Debug: true,
		
		App: _.extend({}, Backbone.Events),
		
		module: function(additionalProps) {
      		return _.extend({ Modules: {} }, additionalProps);
    	},
    	
    	model: function(additionalProps) {
    		return _.extend({ Models: {}, Collections: {} }, additionalProps);
    	},
    	
    	view: function(additionalProps) {
    		return _.extend({ Views: {} }, additionalProps);
    	},
    	
    	tmpl: {
    		JST: {},
    		
    		jstCallbacks: {},
    		
    		registerCallback: function(path, callback) {
    			this.jstCallbacks[path] = this.jstCallbacks[path] || {
    				callbacks: [],
    				deferredObject: new $.Deferred()
    			};
    			
    			this.jstCallbacks[path].callbacks.push(callback);
    		},
    		
    		sendRequest: function(path) {
    			var that = this, opt = {};
    			
    			opt.url = '/' + path;    			
    			opt.type = 'GET';
    			opt.dataType = 'text';
    			opt.cache = false;
    			opt.global = false;
    			opt.success = function(contents) {    	    							    				
	            	that.JST[path] = _.template(contents);
	
		            _.each(that.jstCallbacks[path].callbacks, function (callback) {
		            	if (_.isFunction(callback)) {
		                	callback(that.JST[path]);
		            	}
		            });
	
	            	that.jstCallbacks[path].deferredObject.resolve(that.JST[path]);	            		    
	         	};
	         	
	         	$.ajax(opt);	         	    			
    		},    		    	
    		
    		path: function(path, callback) {
    			if (_.isFunction(callback)) callback(this.JST[path]);

		        if (this.jstCallbacks[path] &&
		            this.jstCallbacks[path].deferredObject &&
		            this.jstCallbacks[path].deferredObject.resolve) {
		            return this.jstCallbacks[path].deferredObject.resolve(this.JST[path]);
		        } else {
		            var d = new $.Deferred();
		            d.resolve(this.JST[path]);
		            return d.promise();
		        }    			    			
    		}, 
    		
    		fetch: function(path, callback) {
    			if (_.isUndefined(path)) return false;
    			
    			path = path.slice(0,1) === '/' ? path.slice(1) : path;
    			
    			if (this.JST[path]) return this.path(path, callback);
    			
    			if (this.jstCallbacks[path]) {
					this.registerCallback(path, callback);
			        return this.jstCallbacks[path].deferredObject.promise();
				}
				
				this.registerCallback(path, callback);
      			this.sendRequest(path);
      			
      			return this.jstCallbacks[path].deferredObject.promise();
    		},
    		
    		remove: function(path) {
    			if (this.JST[path]) delete this.JST[path];
    			
    			if (this.jstCallbacks[path]) delete this.jstCallbacks[path];
    		}  		
    	}
	});
	
	return namespace;
});
