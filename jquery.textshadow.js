(function($, window, undefined) {
    "use strict";

    //regex
    var rtextshadow = /(-?\d+px|(?:hsl|rgb)a?\(.+?\)|#(?:[a-fA-F0-9]{3}){1,2}|0)/g,
        rtextshadowsplit = /(,)(?=(?:[^\)]|\([^\)]*\))*$)/,
        rcolortest = /^((?:rgb|hsl)a?|#)/,
        rcolor = /(rgb|hsl)a?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?(?:\s*,\s*([\.\d]+))?/,
        rshadowsplit = /(,)(?=(?:[^\)]|\([^\)]*\))*$)/g,
        filter = "progid:DXImageTransform.Microsoft.",
        marker = '\u2063',
        rmarker = /\u2063/g,
        rbreakleft = /([\(\[\{])/g,
        rbreakright = /([\)\]\}%°\!\?\u2014])/g,
        rbreakboth = /([\-\u2013])/g,
        rsplit = /[\s\u2063]/,
        rspace = /(\s*)/g,
        rspaceonly = /^\s*$/,
        rprespace = /^(\s*)/,
        prefix = "ui-text-shadow";
    
    // create a plugin
    $.fn.textshadow = function(value, options) {
        if (typeof value === 'object' && !options) {
            options = value;
            value = null;
        }
        var opts = options || {};
        var useStyle = opts.useStyle === false ? false : true;
        var numShadows = opts.numShadows || 1;
        
        // loop the found items
        return this.each(function() {
            var $elem = $(this),
                copySelector = '.' + prefix + '-copy',
                $copy;
            
            // find the copy elements
            $copy = $elem.find(copySelector);
            
            // create them if none exist
            if (!$copy.length) {
                // create all of the elements
                allWords(this);
                $copy = $elem.find(copySelector);
            }
            if (useStyle) {
                applyStyles($copy, value);
            } else if (numShadows > 1) {
                $copy.filter(copySelector + '-1').each(function() {
                    var i = 1,
                        $parent = $(this.parentNode),
                        shadowSelector, $elem;
                    while (i < numShadows) {
                        shadowSelector = copySelector + '-' + (i + 1);
                        if (!$parent.find(shadowSelector).length) {
                            $elem = $(this.cloneNode(true))
                                .addClass(shadowSelector.substring(1))
                                .removeClass(prefix + '-copy-1');
                            $parent.prepend($elem);
                        }
                        i++;
                    }
                });
            }
        });
    };
    
    //---------------------
    // For splitting words
    //---------------------
    // function for returning all words in an element as text nodes
    function allWords(elem) {
        $(elem).contents().each(function() {
            if (this.nodeType === 3 && this.data) {
                makeWords(this);
                return true;
            }
            
            var $elem = $(this);
            if (this.nodeType === 1 && (!$elem.hasClass(prefix) || !$elem.hasClass(prefix + '-original') || !$elem.hasClass(prefix + '-copy'))) {
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

        // Skip empty nodes or nodes that are only whitespace
        if (!text || /^\s*$/.test(text)) {
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
        
        // set the "last index" based on leading whitespace
        lastIndex = rprespace.exec(text)[1].length;

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
    
    var shadowNode = $('<span class="' + prefix + '" />')[0],
        origNode = $('<span class="' + prefix + '-original" />')[0],
        copyNode = $('<span class="' + prefix + '-copy ' + prefix + '-copy-1" />')[0];

    function wrapWord(text) {
        if (!text.length) { // IE 9
            return null;
        }
        var shadow = shadowNode.cloneNode(false),
            orig = origNode.cloneNode(false),
            copy = copyNode.cloneNode(false);
            
        shadow.appendChild(copy);
        shadow.appendChild(orig);
        
        orig.appendChild(document.createTextNode(text));
        copy.appendChild(document.createTextNode(text));

        return shadow;
    }
    
    //---------------------
    // For Applying Styles
    //---------------------
    function applyStyles($copy, value) {
        // skip this if there's no currentStyle property
        if ($copy.length && !$copy[0].currentStyle) { return; }

        // this will work in IE
        $copy.each(function() {
            var copy = this,
                style = value || copy.currentStyle['text-shadow'],
                $copy = $(copy),
                parent = copy.parentNode,
                shadows, i = 0;
            
            // ensure we have the correct style using inheritence
            while ((!style || style === 'none') && parent.nodeName !== 'HTML') {
                style = parent.currentStyle['text-shadow'];
                parent = parent.parentNode;
            }
            
            // don't apply style if we can't find one
            if (!style || style === 'none') {
                return true;
            }
            
            // split the style, in case of multiple shadows
            shadows = style.split(rtextshadowsplit);

            // loop by the splits
            $.each(shadows, function() {
                var shadow = this;

                if (shadow == ',') { // IE 9
                    return true;
                }

                // parse the style
                var values = shadow.match(rtextshadow),
                    color = 'inherit',
                    opacity = 1,
                    x, y, blur, $elem;

                // capture the values

                // pull out the color from either the first or last position
                // actually remove it from the array
                if (rcolortest.test(values[0])) {
                    opacity = getAlpha(values[0]);
                    color = toHex(values.shift());
                } else if (rcolortest.test(values[values.length - 1])) {
                    opacity = getAlpha(values[values.length - 1]);
                    color = toHex(values.pop());
                }

                x = parseFloat(values[0]); // TODO: handle units
                y = parseFloat(values[1]); // TODO: handle units
                blur = values[2] !== undefined ? parseFloat(values[2]) : 0; // TODO: handle units
                
                // create new shadows when multiple shadows exist
                if (i == 0) {
                    $elem = $copy;
                } else {
                    $elem = $copy.clone().prependTo($copy.parent())
                        .addClass(prefix + '-copy-' + (i + 1))
                        .removeClass(prefix + '-copy-1');
                }

                // style the element
                $elem.css({
                    color: color,
                    left: (x - blur) + 'px',
                    top: (y - blur) + 'px'
                });
                
                // add in the filters
                if (opacity < 1 || blur > 0) {
                    $elem[0].style.filter = [
                        opacity < 1 ? filter + "Alpha(opacity=" + parseInt(opacity * 100, 10) + ") " : '',
                        blur > 0 ? filter + "Blur(pixelRadius=" + blur + ")" : ''
                    ].join('');
                }
                i++;
            });
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