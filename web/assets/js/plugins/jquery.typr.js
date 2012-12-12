/**
 * @file
 * jQuery Typr Plugin.
 *
 * Typeahead/autocomplete plugin that outputs templated results (via $.tmpl)
 * from the results of an XHR request or searching an object/array.
 *
 * @dependencies
 * jQuery 1.7+ <http://jquery.com>
 * jQuery.tmpl() <https://github.com/jquery/jquery-tmpl>
 *
 * @author
 * Evan Dudla <evan@nextbigsound.com>
 * Next Big Sound <http://nextbigsound.com>
 *
 * @params
 * resultsSelector: Selector to output the results in
 * resultsTmpl: Selector for the template of the entire results container
 * resultsRowSelector: String-style selector to output the actual rows, if undefined it will use resultsSelector
 *		- String-style selectors (i.e. '.my-container' vs. $('.my-container')) is used to search within resultsSelector
 * resultsRowTmpl: Selector for the template of an individual result row
 * appendResults: (boolean) Whether to use $.append or $.html for the results
 * templateEngine: The templating engine used for the results (default: tmpl)
 * selectCallback: Perform an action with the selected item by passing it to this callback
 * dataSource: JSON feed URI or javascript object to search in
 * dataSourceToken: The string to replace with the query text
 * dataProperty: The key of the response to search in
 * searchKeys: Array of keys to perform a search within
 * transforms: Array of transforms to compare with: (default: trim, lowercase)
 *		- nowhite: remove all intermittent whitespace
 *		- lowercase: make all characters lowercase
 *		- uppercase: make all characters uppercase
 *		- word: allows only "word" characters, ignore punctuation, special characters, etc.
 *		- exact: exactly matches input string
 */
(function (document, window, $, undefined) {
	"use strict";

	var requests = [],
		methods = {
		init: function (options) {
			return this.each(function () {
				var $this = $(this),
					data = $this.data('typr');

				// Else, mark it initialized
				if (!data) {
					// Setup our default options and override anything passed in.
					var settings = $.extend({}, {
						templateEngine: 'tmpl',
						appendResults: false,
						resultsSelector: $(),
						resultsTmpl: $(),
						resultsRowSelector: null,
						resultsRowTmpl: $(),
						selectCallback: null,
						dataSource: [],
						dataSourceToken: ':query',
						dataProperty: null,
						searchKeys: null,
						transforms: ['nowhite', 'lowercase'],
						clearInput: true
					}, options);
					$this.data('typr', {target: $this, settings: settings});
				}
				else {
					settings = $this.data('typr').settings;
				}
				$this.addClass('typr');

				// Listen for typing on the input field
				methods.bind.keyup.apply(this);

				// When clicking away, hide the search
				methods.bind.clear.apply(this);

				// Create a cache for this dataSource for faster searching of objects
				if (typeof(settings.dataSource) === 'object') {
					methods.cache.apply(this);
				}
			});
		},

		// Holds all of our event delegation!
		bind: {
			// Bind our processing on keyup of the input field
			keyup: function () {
				var input = this;
				$(this).on('keyup', function (e) {
					var $input = $(e.target);
					switch (e.which) {
						case 13: // Enter key
						case 38: // Up arrow
						case 40: // Down arrow
							e.preventDefault();
							methods.bind.select.apply(input, [e]);
							return false;

						case 27: // Escape key
							methods.clear.apply(input);
							break;

						default:
							// Make our search
							methods.search.apply(input, [methods.transform.apply(input, [$input.val()])]);
							break;
					}
				}).on('keypress', function (e) {
					// Prevent submission when user presses 'enter' on input field
					switch (e.which) {
						case 13:
							e.preventDefault();
							break;
					}
				});
			},

			// When clicking away, hide the search
			clear: function () {
				var $this = $(this);
				var input = this;
				$(document).on("click", function (e) {
					e.stopPropagation();
					var $el = $(e.target).closest('.typr');
					if ($el.length === 0) {
						methods.clear.apply(input);
					}
				});
			},

			// Our key-based selection to the results selector
			select: function (e) {
				var settings = $(this).data('typr').settings;
				var $results = !settings.resultsRowSelector ? settings.resultsSelector : settings.resultsSelector.find(settings.resultsRowSelector);

				// How many results do we have?
				var count = $results.find("li").length;
				
				// If there's no results, no need to continue
				if (count === 0) {
					return false;
				}

				// Get the currently selected element (if there is one)
				var $selected = $results.find(".selected");		
				if ($selected.length < 1) {
					// On down arrow, make first item selected if nothing is already
					if (e.which === 40) {
						var $first = $results.find("li:first");
						$first.addClass("selected");
					}
					return false;
				}

				// Grab the index of the selected element
				var index = $selected.index();
				if (e.which === 40) {
					// On down key, move to the next element unless it is the last
					if (index < count - 1) {
						$selected.removeClass("selected").next('li').addClass("selected");
					}
					return false;
				}
				if (e.which === 38) {
					// On up key, move to the previous element unless it is the first
					if (index > 0) {
						$selected.removeClass("selected").prev('li').addClass("selected");
					}
					return false;
				}
				if (e.which === 13) {
					// If enter key is pressed, call our callback on this element
					if (typeof(settings.selectCallback) === 'function') {
						methods.clear.apply(this);
						settings.selectCallback(e, $selected);
					}
				}
				return false;
			}
		},

		// Clear our input out
		clear: function (focus) {
			if ($(this).length && $(this).data('typr')) {
				var settings = $(this).data('typr').settings;

				// Abort any outstanding XHR requests so the output doesn't get confused
				for (var i = 0, l = requests.length; i < l; i++) {
					requests[i].abort();
				}

				// Clear out our search
				var $this = $(this);
				$this.removeClass('active');
				if (settings.clearInput) {
					$this.val('');
				}
				if (focus !== true) {
					$this.blur();
				}
				settings.resultsSelector.empty().hide();
			}
		},

		// Use transforms to sanitize the query and also transform it (duh!)
		transform: function (input) {
			var settings = $(this).data('typr').settings;

			// Trigger a 'beforeTransform' event, well, before we... transform...
			var $this = $(this);
			var beforeTransform = $this.triggerHandler({type: "typr.beforeTransform"}, input);

			// This event might be used to modify the input further, so if it does, grab the return value
			input = beforeTransform ? beforeTransform : input;

			// Get rid of any leading/trailing whitespace
			var query = $.trim(input);

			// Get our transforms from settings and actually do them!
			for (var i = 0, l = settings.transforms.length; i < l; i++) {
				var t = settings.transforms[i];

				// If we encounter an 'exact' transform, revert any changes already made
				if (t === 'exact') {
					query = $.trim(input);
					break;
				}

				// Perform each transform
				switch (t) {
					case 'nowhite':
						query = query.replace(/\s+/g, '');
						break;
					case 'lowercase':
						query = query.toLowerCase();
						break;
					case 'uppercase':
						query = query.toUpperCase();
						break;
					case 'word':
						query = query.replace(/([^\w])/g, '');
						break;
				}
			}
			return query;
		},

		// Perform our search
		search: function (query) {
			var settings = $(this).data('typr').settings;

			// Trigger a 'beforeSearch' event, well, before we... search...
			var $this = $(this);
			var beforeSearch = $this.triggerHandler({type: "typr.beforeSearch"}, query);

			// This event might be used to modify the query further, so if it does, grab the return value
			query = beforeSearch ? beforeSearch : query;

			// If we don't have a query, don't do anything
			if (!query) {
				methods.clear.apply(this, [true]);
				return false;
			}

			// Switch on the type of source we're searching
			switch (typeof(settings.dataSource)) {
				case "string":
					var input = this;
					// Abort any outstanding XHR requests so the output doesn't get confused
					for (var i = 0, l = requests.length; i < l; i++) {
						requests[i].abort();
					}
					var xhr = $.getJSON(settings.dataSource.replace(new RegExp(settings.dataSourceToken, 'g'), escape(query)), function (response) {
						// Go ahead and parse and template the returned data
						var data = methods.parse.apply(input, [response]);
						methods.template.apply(input, [data, query]);
					});
					// Log this request so it can be aborted (see above)
					requests.push(xhr);

					// Call this intially so the container may load before the results do
					methods.template.apply(this, [null, query]);
					break;
				case "object":
					// Perform a fast search of our object using the cache we built on init
					var data = methods.parse.apply(this, [settings.dataSource]);
					var regex = new RegExp('"(\\d+) ([^"]*' + query + '[^"]*)"', 'g');
					var result, results = [];
					var cache = $this.data('typr').cache;
					var map = {};
					while (result = regex.exec(cache)) {
						if (map[result[1]] !== true) {
							results.push(data[result[1]]);
							map[result[1]] = true;
						}
					}
					methods.template.apply(this, [results, query]);
					break;
			}
		},

		// Get the appropriate object based on options
		parse: function (data) {
			var settings = $(this).data('typr').settings;
			var $this = $(this);

			// Trigger a "beforeParse" event before we go ahead and mess with the response
			var beforeParse = $this.triggerHandler({type: "typr.beforeParse"}, data);

			// This event might be used to modify the response further, so if it does, grab the return value
			data = beforeParse ? beforeParse : data;

			// Move through the response to the appropriate key
			if (settings.dataProperty) {
				// If we pass in a string, make it an array to be iterated
				if (typeof(settings.dataProperty) !== 'object') {
					settings.dataProperty = [settings.dataProperty];
				}
				// Step through each key and get the response value from that nested key
				for (var i = 0, l = settings.dataProperty.length; i < l; i++) {
					data = data[settings.dataProperty[i]];
				}
			}

			return data;
		},

		// Perform a search through the XHR response
		filter: function (query, data) {

			var settings = $(this).data('typr').settings;

			// Search each key for a match, removing elements that do not match
			for (var i = 0, l = data.length; i < l; i++) {
				var result = data[i];
				var remove = true;

				// If no search keys are defined, filter on the row
				if (typeof(result) !== 'undefined') {
					if (!settings.searchKeys || !settings.searchKeys.length) {
						if (methods.transform.apply(this, [result.toString()]).indexOf(query) >= 0) {
							remove = false;
						}
					}
					for (var j = 0, k = settings.searchKeys.length; j < k; j++) {
						var key = settings.searchKeys[j];

						// Search for a match, break on the first result so we include the whole row
						if (methods.transform.apply(this, [result[key].toString()]).indexOf(query) >= 0) {
							remove = false;
						}
					}
				}

				// If we can remove it, remove it
				if (remove) {
					delete data[i];
				}
			}
			return $.grep(data, function (result) {
				// We use $.grep to get rid of any undefined results from this filter method
				return result;
			});;
		},

		// Start templating our results
		template: function (data, query) {
			var settings = $(this).data('typr').settings;
			var $this = $(this);
			$this.addClass('active')

			// Trigger a "beforeTemplate" event before we go ahead and output the results
			var beforeTemplate = $this.triggerHandler({type: "typr.beforeTemplate"}, [data || []]);

			// This event might be used to modify the results further, so if it does, grab the return value
			data = beforeTemplate ? beforeTemplate : data;

			// Make sure it is visible
			settings.resultsSelector.show();

			// Append our results!
			if (!settings.resultsRowSelector) {
				// If no row selector is provided, use the main template
				settings.resultsSelector.html(settings.resultsTmpl[settings.templateEngine](data));
			}
			else {
				// Otherwise, append the results where appropriate
				settings.resultsSelector.html(settings.resultsTmpl[settings.templateEngine]({query: query}));

				// Should we append the results or not?
				if (data) {
					if (settings.appendResults) {
						settings.resultsSelector.find(settings.resultsRowSelector).append(settings.resultsRowTmpl[settings.templateEngine](data));
					}
					else {
						settings.resultsSelector.find(settings.resultsRowSelector).html(settings.resultsRowTmpl[settings.templateEngine](data));
					}
				}
			}

			// Trigger an "afterTemplate" event before we proceed
			var afterTemplate = $this.triggerHandler({type: "typr.afterTemplate"}, [data]);

			// This event might be used to modify the results further, so if it does, grab the return value
			data = afterTemplate ? afterTemplate : data;

			// Bind our click event when something is selected
			// This has to happen after the results are outputted to delegate properly
			var $results = !settings.resultsRowSelector ? settings.resultsSelector : settings.resultsSelector.find(settings.resultsRowSelector);
			var input = this;
			$results.on('click', 'li', function (e) {
				e.preventDefault();
				methods.clear.apply(input);
				settings.selectCallback(e, $(e.target).closest('li'));
			});

			// Bind click on .typr-clear to clear our the results on click
			$(document).off('click', '.typr-clear').on('click', '.typr-clear', function (e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				methods.clear.apply(input);
			});
		},

		// Build a cache for faster searching! (http://stackoverflow.com/a/3976066)
		cache: function () {
			var settings = $(this).data('typr').settings;
			var $this = $(this);

			// This will only work for objects
			if (typeof(settings.dataSource) === 'object') {
				var cache = '';
				var data = methods.parse.apply(this, [$.extend([], settings.dataSource)]);
				for (var i = 0, l = data.length; i < l; i++) {
					var result = data[i];
					if (typeof(result) !== 'undefined') {
						if (!settings.searchKeys || !settings.searchKeys.length) {
							cache += '"' + i + ' ' + methods.transform.apply(this, [result.toString().replace('"', '')]) + '"'
						}
						for (var j = 0, k = settings.searchKeys.length; j < k; j++) {
							var key = settings.searchKeys[j];
							cache += '"' + i + ' ' + methods.transform.apply(this, [result[key].toString().replace('"', '')]) + '"'
						}
					}
				}
			}

			// Throw this cache back into the data property
			var instance = $this.data('typr');
			instance.cache = cache;
			$this.data('typr', instance);
		}
	};

	$.fn.Typr = function (method) {
		// If we are calling a specific method, go ahead and do it!
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}

		// Otherwise, we're most likely initializing the plugin
		if (typeof(method) === 'object' || !method) {
			return methods.init.apply(this, arguments);
		}
		return this;
	};
})(document, document.window, jQuery);
