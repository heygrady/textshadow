(function($, window, undefined) {
	//regex
	var rtextshadow = /([\d+.\-]+[a-z%]*)\s*([\d+.\-]+[a-z%]*)\s*([\d+.\-]+[a-z%]*)?\s*([#a-z]*.*)?/, 
		rcolor= /(rgb|hsl)a?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?(?:\s*,\s*([\.\d]+))?/,
		filter = "progid:DXImageTransform.Microsoft.",
		marker = '\u2063',
		rmarker = /\u2063/g,
		rbreakleft = /([\(\[\{])/g,
		rbreakright = /([\)\]\}%°\!\?\u2014])/g,
		rbreakboth = /([-\u2013])/g,
		rsplit = /[\s\u2063]/,
		rspace = /(\s*)/g;
	
	// create a plugin
	$.fn.textshadow = function(value, options) {
		if (typeof value === 'object' && !options) {
			options = value;
			value = null;
		}
		var opts = options || {};
		var useStyle = opts.useStyle === false ? false : true;
		
		// loop the found items
		return this.each(function() {
			var $elem = $(this), $copy;
			
			// find the copy elements
			$copy = $elem.find('.ui-text-shadow-copy');
			
			// create them if none exist
			if (!$copy.length) {
				// create all of the elements				
				allWords(this);				
				$copy = $elem.find('.ui-text-shadow-copy');
			}
			if (useStyle) {
				applyStyles($copy, value);
			}
		});
	};
	
	//---------------------
	// For splitting words
	//---------------------
	// function for returning al words in an element as text nodes
	function allWords(elem) {
		$(elem).contents().each(function() {
			if (this.nodeType === 3 && this.data) {
				makeWords(this);
				return true;
			}
			
			var $elem = $(this);
			if (this.nodeType === 1 && (!$elem.hasClass('ui-text-shadow') || !$elem.hasClass('ui-text-shadow-original') || !$elem.hasClass('ui-text-shadow-copy'))) {
				allWords(this);
				return true;
			}
		});
	}
	
	// splits text nodes
	function makeWords(textNode) {
		// Split the text in the node by space characters
		var split, length, spaces, node,
			text = textNode.nodeValue,
			lastIndex = 0;

		// Skip empty nodes
		if (!text) {
			return;
		}

		//correct for IE break characters
		//leave a strange unicode character as a marker
		text = text.replace(rbreakleft, marker + '$1')
				.replace(rbreakright, '$1' + marker)
				.replace(rbreakboth, marker + '$1' + marker);

		// split the string by break characters
		split = text.split(rsplit);
		
		// remove our markers
		text = text.replace(rmarker, '');

		// Add the original string (it gets split)
		var fragment = document.createDocumentFragment();
		
		// loop by the splits
		$.each(split, function() {
			length = this.length;

			// IE9 will return empty splits (consecutive spaces)
			if (!length) {
				return true;
			}

			//include the trailing space characters
			rspace.lastIndex = lastIndex + length;
			spaces = rspace.exec(text);			
			
			// slice out our text
			// create a new node with it
			node = wrapWord(text.substr(lastIndex, length + spaces[1].length));
			if (node !== null) {
				fragment.appendChild(node);
			}
			lastIndex = lastIndex + length + spaces[1].length;
		});
		textNode.parentNode.replaceChild(fragment.cloneNode(true), textNode);
	}
	
	var shadowNode = $('<span class="ui-text-shadow" />')[0],
		origNode = $('<span class="ui-text-shadow-original" />')[0],
		copyNode = $('<span class="ui-text-shadow-copy" />')[0];

	function wrapWord(text) {
		if (!text.length) { // IE 9
			return null;
		}
		var shadow = shadowNode.cloneNode(),
			orig = origNode.cloneNode(),
			copy = copyNode.cloneNode();
			
		shadow.appendChild(copy);
		shadow.appendChild(orig);
		
		orig.appendChild(document.createTextNode(text));
		copy.appendChild(document.createTextNode(text));
		return shadow;
	}
	
	//---------------------
	// For Applying Styles
	//---------------------
	function applyStyles($copy, value)  {
		$copy.each(function() {
			var copy = this,
				style = value || copy.currentStyle['text-shadow'],
				$copy = $(copy),
				parent = copy.parentNode;
			
			// ensure we have the correct style
			while ((!style || style === 'none') && parent.nodeName !== 'HTML') {
				style = parent.currentStyle['text-shadow'];
				parent = parent.parentNode;
			}
			
			// don't apply style if we can't find one
			if (!style || style === 'none') {
				return true;
			}
			
			// parse the style
			var values = rtextshadow.exec(style),
				x, y, blur, color, opacity;
									
			// capture the values
			x = parseFloat(values[1]); // TODO: handle units
			y = parseFloat(values[2]); // TODO: handle units
			blur = values[3] !== undefined ? parseFloat(values[3]) : 0; // TODO: handle units
			color = values[4] !== undefined ? toHex(values[4]) : 'inherit';
			opacity = getAlpha(values[4]);
			
			// style the element
			$copy.css({
				color: color,
				left: (x - blur) + 'px',
				top: (y - blur) + 'px'
			});
			
			// add in the filters
			copy.style.filter = [
				filter + "Alpha(",
					"opacity=" + parseInt(opacity * 100, 10),
				") ",
				filter + "Blur(",
					"pixelRadius=" + blur,
				")"
			].join('');
		});
	}
	
	//---------------------
	// For Colors
	//---------------------
	// http://haacked.com/archive/2009/12/29/convert-rgb-to-hex.aspx
	function toHex(color) {
		// handle rgb
		var matches = rcolor.exec(color), rgb;
		
		// handle hsl
		if (matches && matches[1] === 'hsl') {
			rgb = hsl2rgb(matches[2], matches[3], matches[4]);
			matches[2] = rgb[0];
			matches[3] = rgb[1];
			matches[4] = rgb[2];
		}
		
		// convert to hex
		return matches ? '#' + (1 << 24 | matches[2] << 16 | matches[3] << 8 | matches[4]).toString(16).substr(1) : color;
	}
	
	function getAlpha(color) {
		var matches = rcolor.exec(color);
		if (matches) {
			return matches[5] !== undefined ? matches[5] : 1; 
		}
		return 1;
	}
	
	// http://www.codingforums.com/showthread.php?t=11156
	function hsl2rgb(h, s, l) {
		var m1, m2, hue, r, g, b;
		s /=100;
		l /= 100;
		if (s === 0) {
			r = g = b = (l * 255);
		} else {
			if (l <= 0.5) {
				m2 = l * (s + 1);
			} else {
				m2 = l + s - l * s;
			}
			m1 = l * 2 - m2;
			hue = h / 360;
			r = hue2rgb(m1, m2, hue + 1/3);
			g = hue2rgb(m1, m2, hue);
			b = hue2rgb(m1, m2, hue - 1/3);
		}
		return [r, g, b];
	}
	
	function hue2rgb(m1, m2, hue) {
		var v;
		if (hue < 0) {
			hue += 1;
		} else if (hue > 1) {
			hue -= 1;
		}

		if (6 * hue < 1) {
			v = m1 + (m2 - m1) * hue * 6;
		} else if (2 * hue < 1) {
			v = m2;
		} else if (3 * hue < 2) {
			v = m1 + (m2 - m1) * (2/3 - hue) * 6;
		} else {
			v = m1;
		}

		return 255 * v;
	}
})(jQuery, this);