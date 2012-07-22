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
// @codekit-prepend "VMM.Timeline.License.js";

// @codekit-prepend "Core/VMM.js";
// @codekit-prepend "Core/VMM.Library.js";
// @codekit-prepend "Core/VMM.Browser.js";
// @codekit-prepend "Core/VMM.FileExtention.js";
// @codekit-prepend "Core/VMM.Date.js";
// @codekit-prepend "Core/VMM.Util.js";
// @codekit-prepend "Core/VMM.LoadLib.js";

// @codekit-prepend "Core/Media/VMM.ExternalAPI.js";
// @codekit-prepend "Core/Media/VMM.MediaElement.js";
// @codekit-prepend "Core/Media/VMM.MediaType.js";
// @codekit-prepend "Core/Media/VMM.Media.js";
// @codekit-prepend "Core/Media/VMM.TextElement.js";

// @codekit-prepend "Core/Slider/VMM.DragSlider.js";
// @codekit-prepend "Core/Slider/VMM.Slider.js";
// @codekit-prepend "Core/Slider/VMM.Slider.Slide.js";

// @codekit-prepend "VMM.Language.js";

// @codekit-prepend "Core/Library/AES.js";
// @codekit-prepend "Core/Library/bootstrap-tooltip.js";


/* Timeline
================================================== */

if(typeof VMM != 'undefined' && typeof VMM.SliderJS == 'undefined') {
	
	VMM.SliderJS = function(_slider_id, w, h) {
		
		var $main,
			$feedback,
			slider,
			timenav,
			version		= "0.1",
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
			type: 					"slider",
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
				height: 			200,
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
				width: 				720,
				height: 			400,
				content: {
					width: 			720,
					height: 		400,
					padding: 		130
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
			config.nav.height			= 200;
			config.feature.width		= config.width;
			config.feature.height		= config.height - config.nav.height;
			VMM.master_config.StoryJS	= config;
			this.events					= config.events;
		}
		
		/* CREATE TIMELINE STRUCTURE
		================================================== */
		function createStructure() {
			$main	= VMM.getElement(main_id);
			
			VMM.Lib.addClass(main_id, "vmm-sliderjs");
			if (config.touch) {
				VMM.Lib.addClass(main_id, "vmm-touch");
			} else {
				VMM.Lib.addClass(main_id, "vmm-notouch");
			}
			
			$feedback	= VMM.appendAndGetElement($main, "<div>", "feedback", "");
			slider		= new VMM.Slider(main_id + " div.slider", config);
			
			if (!has_width) {
				config.width = VMM.Lib.width($timeline);
			} else {
				VMM.Lib.width($timeline, config.width);
			}

			if (!has_height) {
				config.height = VMM.Lib.height($timeline);
			} else {
				VMM.Lib.height($timeline, config.height);
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
		
		function onSliderLoaded(e) {
			config.loaded.slider = true;
			onComponentLoaded();
		};
		
		function onComponentLoaded(e) {
			config.loaded.percentloaded = config.loaded.percentloaded + 25;
			
			if (config.loaded.slider) {
				hideMessege();
			}
		}
		
		function onSlideUpdate(e) {
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
			
			VMM.Date.setLanguage(config.language);
			VMM.master_config.language = config.language;
			
			$feedback = VMM.appendAndGetElement($main, "<div>", "feedback", "");
			
			// EVENTS
			VMM.bindEvent($main, onDataReady, config.events.data_ready);
			VMM.bindEvent($main, showMessege, config.events.messege);
			
			//VMM.fireEvent(global, config.events.messege, VMM.master_config.language.messages.loading_timeline);
			
			/* GET DATA
			================================================== */
			if (VMM.Browser.browser == "Explorer" || VMM.Browser.browser == "MSIE") {
				if ( parseInt(VMM.Browser.version, 10) <= 7 ) {
					ie7 = true;
				}
			}
			
			if (type.of(config.source) == "string" || type.of(config.source) == "object") {
				//VMM.DataObj.getData(config.source);
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
				VMM.fireEvent($main, config.events.data_ready);
			});
		};
		
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
				// CREATE DOM STRUCTURE
				VMM.attachElement($main, "");
				VMM.appendElement($main, "<div class='container main'><div class='feature'><div class='slider'></div></div><div class='navigation'></div></div>");
			
				reSize();
			
				VMM.bindEvent("div.slider", onSliderLoaded, "LOADED");
				VMM.bindEvent("div.navigation", onTimeNavLoaded, "LOADED");
				VMM.bindEvent("div.slider", onSlideUpdate, "UPDATE");
				VMM.bindEvent("div.navigation", onMarkerUpdate, "UPDATE");
			
				//slider.init(data);
			
				// RESIZE EVENT LISTENERS
				VMM.bindEvent($main, reSize, config.events.resize);
				
			}
			
			
		};
		
		function ie7Build() {
			trace("IE7 or lower");

		};
		
		function updateSize() {
			trace("UPDATE SIZE");
			config.width = VMM.Lib.width($main);
			config.height = VMM.Lib.height($main);
			
			config.nav.width = config.width;
			config.feature.width = config.width;
			
			config.feature.height = config.height - config.nav.height - 3;
		};
		
	};
	
};