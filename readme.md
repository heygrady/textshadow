# Text Shadow
This library is a `text-shadow` polyfill for Internet Explorer 9 and below. It uses the Microsoft proprietary [blur filter](http://msdn.microsoft.com/en-us/library/ms532979(v=vs.85\).aspx) and the [alpha filter](http://msdn.microsoft.com/en-us/library/ms532967(v=vs.85\).aspx) along with layering to closely approximate `text-shadow`.

* Currently only pixel units are supported
* Cutting and pasting text will result in doubled text
* The creation of the extra DOM nodes could potentially be faster
* Transitional doctypes are not supported in IE 8 or IE 9 because of a weird IE error, [see issue #8](https://github.com/heygrady/textshadow/issues/8) 

## Usage
It is recommended to use this library with a feature detection library such as [Modernizr](http://www.modernizr.com/docs/#textshadow). Please minify the `jquery.textshadow.js` file using [UglifyJS](http://marijnhaverbeke.nl/uglifyjs) (or your favorite JS compressor) before deploying your code in production.

### Options

- **useStyle** *boolean* default: true - When `useStyle` is true the styles will be read using `currentStyle` and applied as an inline style to each element. Setting `useStyle` to false will skip this step and allow the special IE styles to be set in the CSS.
- **numShadows** *integer* default: 1 - Only applies when `useStyle` is false. Will create multiple shadow nodes for use with multiple shadows. At least one shadow node is always created.

### Example Usage
```javascript
if (!Modernizr.textshadow) {
  // [default] reading the current style automatically
  $('h1').textshadow();
  
  // creates the HTML structure but doesn't try to apply the styles
  $('h1').textshadow({useStyle: false});

  // creates the HTML structure but doesn't try to apply the styles
  // creates extra nodes for multiple shadows
  $('h1').textshadow({useStyle: false, numShadows: 4});
  
  // normal
  $('h1').textshadow('3px 3px 2px #000');
  
  // rgba
  $('h1').textshadow('3px 3px 2px rgba(0, 0, 0, 0.5)');
  
  // hsla
  $('h1').textshadow('3px 3px 2px hsla(0, 100%, 54%, .5)');
  
  // multiple shadows
  $('h1').textshadow('1px 1px 2px rgba(255, 0, 0, 0.5), 3px 3px 2px rgba(0, 255, 0, 0.5), 5px 5px 2px rgba(0, 0, 255, 0.5), 7px 7px 2px rgba(0, 0, 0, 0.5)');

  // no blur
  $('h1').textshadow('3px 3px rgba(0, 0, 0, 0.5)');

  // color first
  $('h1').textshadow('rgba(0, 0, 0, 0.5) 3px 3px 2px');

  // no color
  $('h1').textshadow('3px 3px 2px');

  // no color, no blur
  $('h1').textshadow('3px 3px');
}
```

### Example Document

The following document shows the recommended minimum implementation with the required CSS and [Modernizr](http://modernizr.com) in the head and with jQuery and the plugin included at the bottom of the `<body>`. It is important that the initialization of the script be placed at the bottom of the page, below all of the content and just above the closing `</body>` tag.

```html
<!doctype html>
<html>
<head>
  ...
  <link rel="stylesheet" href="jquery.textshadow.css">
  <script src="js/libs/modernizr-2.5.3.min.js"></script>
</head>
<body>
  ...
  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.js"></script>
  <script src="jquery.textshadow.js"></script>
  <script>
  if (!Modernizr.textshadow) {
    $('h1').textshadow();
  }
  </script>
</body>
</html>
```

### Required CSS
There is a corresponding css file that provides base styles for the new elements used. It must be included in the document as well. Optionally, but recommended for ease-of-use, you could use the Compass mixin ([detailed below](#using-sass-and-compass)) instead of the CSS file.

```html
<link rel="stylesheet" href="jquery.textshadow.css">
```

### Specifying Custom CSS By Hand
For performance and flexibility reasons, it's best to use CSS rather than JS to apply the shadow styles. Particularly when there are hover states or nested elements that need a different shadow applied. Overall the browser will perform better applying the filter properties from CSS rather than from JavaScript. For ease-of-use, try the [Compass mixin instructions](#using-sass-and-compass) below.

To calculate the special styles for IE you need to calculate some values based on the [text-shadow values](https://developer.mozilla.org/en/CSS/text-shadow).

- `color` - The hex color, without the alpha. IE 8 and below do not support `rgba` or `hsla` colors.
- *opacity* - The alpha value from your `rgba` or `hsla` color. IE requires the opacity to be an integer value between 0 and 100 (in CSS the alpha is normally a decimal value between 0 and 1).
- *pixelRadius* - The *blur-radius* value of the shadow. This is always the third length value in a shadow. IE requires the *pixelRadius* to be in pixels without the unit.
- `left` - The *offset-x* value of the shadow with the *blur-radius* subtracted. This is always the first length value in a shadow.
- `top` - The *offset-y* value of the shadow with the *blur-radius* subtracted. This is always the second length value in a shadow.

```css
/* normal shadow for supported browsers */
h1 {
  text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.5); /* offset-x offset-y blur-radius color */
}

/* special styles for IE 9 and below */
h1 .ui-text-shadow-copy {
  color: #000; /* color, rgba and hsla not supported */
  filter:
    progid:DXImageTransform.Microsoft.Alpha(opacity=50) /* alpha * 100 */
    progid:DXImageTransform.Microsoft.Blur(makeShadow=false,pixelRadius=2); /* blur-radius, in pixels without unit */
  left: 1px; /* offset-x - blur-radius */
  top: 1px; /* offset-y - blur-radius */
}
```

#### Custom CSS in an example document

```html
<!doctype html>
<html>
<head>
  ...
  <link rel="stylesheet" href="jquery.textshadow.css">
  <style>
    h1 {
      text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.5); /* offset-x offset-y blur-radius color */
    }
    h1 .ui-text-shadow-copy {
      color: #000; /* color, rgba and hsla not supported */
      filter:
        progid:DXImageTransform.Microsoft.Alpha(opacity=50) /* alpha * 100 */
        progid:DXImageTransform.Microsoft.Blur(makeShadow=false,pixelRadius=2); /* blur-radius, in pixels without unit */
      left: 1px; /* offset-x - blur-radius */
      top: 1px; /* offset-y - blur-radius */
    }
  </style>
  <script src="js/libs/modernizr-2.5.3.min.js"></script>
</head>
<body>
  ...
  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.js"></script>
  <script src="jquery.textshadow.js"></script>
  <script>
  if (!Modernizr.textshadow) {
    $('h1').textshadow({useStyle: false});
  }
  </script>
</body>
</html>
```

## Using Sass and Compass
To make it easier to apply the custom CSS, it's recommended to use the Compass mixin provided. The provided Compass mixin will automatically generate the IE-specific styles that are compatible with the generated HTML structure. It also automatically applies the `text-shadow` for the browsers that support it.

- [Sass](http://sass-lang.com)
- [Compass](http://compass-style.org)
- [Getting started with Sass and Compass](http://thesassway.com/beginner/getting-started-with-sass-and-compass)

### Using the Mixin
Your scss file might look similar to the following example:

```scss
// import the mixin
@import "jquery.textshadow";

// output the base CSS classes
@include jquery-text-shadow-base-styles;

// Apply a text-shadow to an element
h1 {
  @include jquery-text-shadow(3px 3px 2px rgba(0, 0, 0, 0.5));
}

// Multiple shadows, up to 10 allowed
h2 {
  @include jquery-text-shadow(1px 1px 2px rgba(255, 0, 0, 0.5), 3px 3px 2px rgba(0, 255, 0, 0.5), 5px 5px 2px rgba(0, 0, 255, 0.5), 7px 7px 2px rgba(0, 0, 0, 0.5));
}
```

### Using the Plugin

When the special IE styles are already in the CSS you can save some rendering time by having the jQuery plugin skip parsing the text-shadow values and setting inline styles.

```js
if (!Modernizr.textshadow) {
  // creates the HTML structure but doesn't try to apply the text-shadow styles
  $('h1').textshadow({useStyle: false});

  // the h2 has 4 shadows! creates the HTML structure with 4 shadow nodes
  $('h2').textshadow({useStyle: false, numShadows: 4});
}
```

### Example Output
As an example, the SCSS code above will generate CSS similar to what is shown below.

```css
.ui-text-shadow, .ui-text-shadow-original {
  position: relative;
}

.ui-text-shadow-original {
  z-index: 1;
  text-shadow: none;
}

.ui-text-shadow-copy {
  position: absolute;
  z-index: 0;
  left: 0;
  top: 0;
  text-shadow: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

h1 {
  text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.5);
}
h1 .ui-text-shadow-copy-1 {
  color: black;
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=50) progid:DXImageTransform.Microsoft.Blur(makeShadow=false,pixelRadius=2);
  left: 1px;
  top: 1px;
}

h2 {
  text-shadow: 1px 1px 2px rgba(255, 0, 0, 0.5), 3px 3px 2px rgba(0, 255, 0, 0.5), 5px 5px 2px rgba(0, 0, 255, 0.5), 7px 7px 2px rgba(0, 0, 0, 0.5);
}
h2 .ui-text-shadow-copy-1 {
  color: red;
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=50) progid:DXImageTransform.Microsoft.Blur(makeShadow=false,pixelRadius=2);
  left: -1px;
  top: -1px;
}
h2 .ui-text-shadow-copy-2 {
  color: lime;
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=50) progid:DXImageTransform.Microsoft.Blur(makeShadow=false,pixelRadius=2);
  left: 1px;
  top: 1px;
}
h2 .ui-text-shadow-copy-3 {
  color: blue;
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=50) progid:DXImageTransform.Microsoft.Blur(makeShadow=false,pixelRadius=2);
  left: 3px;
  top: 3px;
}
h2 .ui-text-shadow-copy-4 {
  color: black;
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=50) progid:DXImageTransform.Microsoft.Blur(makeShadow=false,pixelRadius=2);
  left: 5px;
  top: 5px;
}
```