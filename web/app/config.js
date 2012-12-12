// author: andy.li <andy.li@teein.com>
// 2012.08.23 13:31

require.config({
	deps: ["main"],
	
	paths: {
		libs: "../assets/js/libs",
		plugins: "../assets/js/plugins",
		
		// Libraries
		jquery: "../assets/js/libs/jquery",
		underscore: "../assets/js/libs/underscore",
		backbone: "../assets/js/libs/backbone",		
		d3: "../assets/js/libs/d3",
		
		// Plugins
		text: 	"../assets/js/plugins/require.text",
		
		jqueryTmpl: "../assets/js/plugins/jquery.tmpl",
		jqueryUI: "../assets/js/plugins/jquery.ui",
		jqueryDatePicker: "../assets/js/plugins/jquery.datepicker",
		jqueryTableSorter: "../assets/js/plugins/jquery.tablesorter",
		jqueryScrollTo: "../assets/js/plugins/jquery.tablesorter",
		jqueryTypr: "../assets/js/plugins/jquery.typr"		
	},
	
	shim: {
		backbone: {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},			
		
		underscore: {
			exports: '_'
		},
		
		d3: {
			exports: 'd3'
		},
			
		jqueryTmpl: {
			deps: ['jquery']
		},

		jqueryTypr: {
			deps: ['jquery', 'jqueryTmpl']			
		},
		
		jqueryUI: {
			deps: ['jquery']
		},
			
		jqueryDatePicker: {
			deps: ['jquery', 'jqueryUI']
		},
		
		jqueryTableSorter: {
			deps: ['jquery', 'jqueryUI']
		},
		
		jqueryScrollTo: {
			deps: ['jquery', 'jqueryUI']
		}
	},
	
	waitSeconds: 30
});

require.onError = function (err) {
    if (err.requireType === 'timeout') {
        console.log('modules: ' + err.requireModules);
    }
	console.log(err);
    throw err;
};

