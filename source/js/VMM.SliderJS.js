/**
	* SliderJS
	* Designed and built by Zach Wise at VéritéCo

	* This Source Code Form is subject to the terms of the Mozilla Public
	* License, v. 2.0. If a copy of the MPL was not distributed with this
	* file, You can obtain one at http://mozilla.org/MPL/2.0/.

*/ 

/*	* CodeKit Import
	* http://incident57.com/codekit/
================================================== */
// @codekit-prepend "VMM.SliderJS.License.js";
// @codekit-prepend "Core/VMM.StoryJS.js";


/* SliderJS
================================================== */

if(typeof VMM != 'undefined' && typeof VMM.SliderJS == 'undefined') {
	
	VMM.SliderJS = function(_main_id, w, h) {
		
		var $main,
			$feedback,
			slider,
			timenav,
			version		= "0.11",
			main_id		= "#sliderjs",
			events		= {},
			data		= {},
			config		= {},
			has_width	= false,
			has_height	= false,
			ie7			= false,
			is_moving	= false;
		

		if (type.of(_main_id) == "string") {
			if (_main_id.match("#")) {
				main_id	= _main_id;
			} else {
				main_id	= "#" + _main_id;
			}
		}
		
		trace("VERSION " + version);
		
		/* CONFIG
		================================================== */
		config = {
			embed:					false,
			events: {
				data_ready:			"DATAREADY",
				messege:			"MESSEGE",
				headline:			"HEADLINE",
				slide_change:		"SLIDE_CHANGE",
				resize:				"resize"
			},
			id: 					main_id,
			type: 					"sliderjs",
			touch:					false,
			maptype: 				"toner",
			preload:				4,
			current_slide:			0,
			hash_bookmark:			false,
			start_at_end: 			false,
			start_at_slide:			0,
			start_page: 			false,
			api_keys: {
				google:				"",
				flickr:				"",
				twitter:			""
			},
			interval: 				10,
			width: 					960,
			height: 				540,
			spacing: 				15,
			loaded: {
				slider: 			false,
				navigation:			false,
				percentloaded: 		0
			},
			nav: {
				start_page: 		false,
				interval_width: 	200,
				density: 			4,
				minor_width: 		0,
				minor_left:			0,
				constraint: {
					left:			0,
					right:			0,
					right_min:		0,
					right_max:		0
				},
				zoom: {
					adjust:			0
				},
				multiplier: {
					current: 		6,
					min: 			.1,
					max: 			50
				},
				rows: 				[1, 1, 1],
				width: 				960,
				height: 			0,
				marker: {
					width: 			150,
					height: 		50
				}
			},
			feature: {
				width: 				960,
				height: 			540
			},
			slider: {
				width: 				960,
				height: 			540,
				content: {
					width: 			720,
					height: 		400,
					padding: 		100
				},
				nav: {
					width: 			100,
					height: 		200
				}
			},
			ease: 					"easeInOutExpo",
			duration: 				1000,
			language: 				VMM.Language
		};
		
		if ( w != null && w != "") {
			config.width = w;
			has_width = true;
		} 

		if ( h != null && h != "") {
			config.height = h;
			has_height = true;
		}
		
		if(window.location.hash) {
			 var hash					=	window.location.hash.substring(1);
			 if (!isNaN(hash)) {
			 	 config.current_slide	=	parseInt(hash);
			 }
		}
		
		window.onhashchange = function () {
			var hash					=	window.location.hash.substring(1);
			if (config.hash_bookmark) {
				if (is_moving) {
					goToEvent(parseInt(hash));
				} else {
					is_moving = false;
				}
			} else {
				goToEvent(parseInt(hash));
			}
		}
		
		/* CREATE CONFIG
		================================================== */
		function createConfig(conf) {
			
			// APPLY SUPPLIED CONFIG TO TIMELINE CONFIG
			if (typeof embed_config == 'object') {
				config = embed_config;
			}
			if (typeof conf == 'object') {
				config = VMM.Util.mergeConfig(config, conf);
			}
			
			if (VMM.Browser.device == "mobile" || VMM.Browser.device == "tablet") {
				config.touch = true;
			}
			
			config.nav.width			= config.width;
			config.feature.width		= config.width;
			config.feature.height		= config.height - config.nav.height;
			VMM.master_config.StoryJS	= config;
			this.events					= config.events;
			
		}
		
		/* CREATE TIMELINE STRUCTURE
		================================================== */
		function createStructure() {
			
			// CREATE DOM STRUCTURE
			$main	= VMM.getElement(main_id);
			VMM.Lib.addClass($main, "vmm-sliderjs");
			VMM.Lib.addClass($main, "vmm-storyjs");
			
			$container	= VMM.appendAndGetElement($main, "<div>", "container main");
			$feature	= VMM.appendAndGetElement($container, "<div>", "feature");
			$slider		= VMM.appendAndGetElement($feature, "<div>", "vmm-slider");
			$navigation	= VMM.appendAndGetElement($container, "<div>", "navigation");
			$feedback	= VMM.appendAndGetElement($main, "<div>", "feedback", "");
			
			if (config.touch) {
				VMM.Lib.addClass(main_id, "vmm-touch");
			} else {
				VMM.Lib.addClass(main_id, "vmm-notouch");
			}
			
			slider		= new VMM.Slider($slider, config);
			
			if (!has_width) {
				config.width = VMM.Lib.width($main);
			} else {
				VMM.Lib.width($main, config.width);
			}

			if (!has_height) {
				config.height = VMM.Lib.height($main);
			} else {
				VMM.Lib.height($main, config.height);
			}
			
		}
		
		/* ON EVENT
		================================================== */

		function onDataReady(e, d) {
			trace("onDataReady");
			trace(d);
			data = d;
			
			build();
			
		};
		
		function reSize() {
			updateSize();
			slider.setSize(config.feature.width, config.feature.height);
		};
		
		/* ON LOADED
		================================================== */
		function onSliderLoaded(e) {
			config.loaded.slider = true;
			onComponentLoaded();
		};
		
		function onNavLoaded(e) {
			config.loaded.navigation = true;
			onComponentLoaded();
		};
		
		function onComponentLoaded(e) {
			config.loaded.percentloaded = config.loaded.percentloaded + 25;
			config.loaded.navigation = true;
			if (config.loaded.slider && config.loaded.navigation) {
				hideMessege();
			}
		}
		
		/* ON UPDATE
		================================================== */
		function onSlideUpdate(e) {
			is_moving = true;
			config.current_slide = slider.getCurrentNumber();
			setHash(config.current_slide);
		};
		
		function onNavUpdate(e) {
			is_moving = true;
			config.current_slide = slider.getCurrentNumber();
			setHash(config.current_slide);
		};
		
		function setHash(n) {
			if (config.hash_bookmark) {
				window.location.hash = "#" + n.toString();
			}
		}
		
		/* PUBLIC FUNCTIONS
		================================================== */
		this.init = function(conf, _data, _main_id) {
			trace('INIT');
			
			if (type.of(_main_id) == "string") {
				if (_main_id.match("#")) {
					main_id = _main_id;
				} else {
					main_id = "#" + _main_id;
				}
			}
			
			createConfig(conf);
			createStructure();
			
			if (type.of(_data) == "string") {
				config.source	= _data;
			}
			
			// LANGUAGE
			VMM.Date.setLanguage(config.language);
			VMM.master_config.language = config.language;
			
			// EXTERNAL API
			VMM.ExternalAPI.setKeys(config.api_keys);
			VMM.ExternalAPI.googlemaps.setMapType(config.maptype);
			
			// EVENTS
			VMM.bindEvent($main, onDataReady, config.events.data_ready);
			VMM.bindEvent($main, showMessege, config.events.messege);
			
			VMM.fireEvent($main, config.events.messege, "LOADING");
			
			/* GET DATA
			================================================== */
			if (VMM.Browser.browser == "Explorer" || VMM.Browser.browser == "MSIE") {
				if ( parseInt(VMM.Browser.version, 10) <= 7 ) {
					ie7 = true;
				}
			}
			
			if (type.of(config.source) == "string" || type.of(config.source) == "object") {
				//VMM.DataObj.getData(config.source);
				getData(config.source);
			} else {
				//VMM.DataObj.getData(VMM.getElement(timeline_id));
			}
			
			
		};
		
		this.reload = function(_d) {
			trace("loadNewDates" + _d);
			VMM.fireEvent($main, config.events.messege, config.language.messages.loading_timeline);
			data = {};
			//VMM.DataObj.getData(_d);
		};
		
		/* DATA 
		================================================== */
		function getData(url) {
			VMM.getJSON(url, function(d) {
				//data = VMM.DataObj.getData(d);
				prepareData(d);
				
			});
		};
		
		function prepareData(d) {
			var i	= 0,
				pd	= d.sliderjs;
			
			for(i = 0; i < pd.slides.length; i++) {
				pd.slides[i].uniqueid = VMM.Util.unique_ID(7);
			}
			
			VMM.fireEvent($main, config.events.data_ready, pd);
		}
		/* MESSEGES 
		================================================== */
		function showMessege(e, msg) {
			trace("showMessege " + msg);
			//VMM.attachElement($messege, msg);
			VMM.attachElement($feedback, VMM.MediaElement.loadingmessage(msg)); 
		};
		
		function hideMessege() {
			VMM.Lib.animate($feedback, config.duration, config.ease*4, {"opacity": 0}, detachMessege);
		};
		
		function detachMessege() {
			VMM.Lib.detach($feedback);
		}
		
		/* BUILD DISPLAY
		================================================== */
		function build() {
			
			// START AT SLIDE
			if (parseInt(config.start_at_slide) > 0 && config.current_slide == 0) {
				config.current_slide = parseInt(config.start_at_slide); 
			}
			// START AT END
			if (config.start_at_end && config.current_slide == 0) {
				config.current_slide = _dates.length - 1;
			}
			
			
			// IE7
			if (ie7) {
				ie7 = true;
				VMM.fireEvent($main, config.events.messege, "Internet Explorer " + VMM.Browser.version + " is not supported. Please update your browser to version 8 or higher.");
			} else {
				detachMessege();
				reSize();
				
				// EVENT LISTENERS
				VMM.bindEvent($slider, onSliderLoaded, "LOADED");
				VMM.bindEvent($navigation, onNavLoaded, "LOADED");
				VMM.bindEvent($slider, onSlideUpdate, "UPDATE");
				VMM.bindEvent($navigation, onNavUpdate, "UPDATE");
			
				// RESIZE EVENT LISTENERS
				VMM.bindEvent(global, reSize, config.events.resize);
				
				// INITIALIZE COMPONENTS
				slider.init(data.slides);
			}
			
			
		};
		
		function ie7Build() {
			trace("IE7 or lower");

		};
		
		function updateSize() {
			trace("UPDATE SIZE");
			config.width			= VMM.Lib.width($main);
			config.height			= VMM.Lib.height($main);
			
			config.nav.width		= config.width;
			config.feature.width	= config.width;
			
			config.feature.height	= config.height - config.nav.height - 3;
		};
		
	};
	
};