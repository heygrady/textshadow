# Text Shadow
This library is a `text-shadow` polyfill for Internet Explorer 9 and below. It uses the Microsoft proprietary [blur filter](http://msdn.microsoft.com/en-us/library/ms532979(v=vs.85\).aspx) and the [alpha filter](http://msdn.microsoft.com/en-us/library/ms532967(v=vs.85\).aspx) along with layering to closely approximate `text-shadow`.

* Currently only pixel units are supported
* Cutting and pasting text will result in doubled text
* The creation of the extra DOM nodes could potentially be faster
* Multiple shadows are not supported. Only the first shadow will be rendered.

## Usage
It is recommended to use this library with a feature detection library such as [Modernizr](http://www.modernizr.com/docs/#textshadow).

```javascript
if (!Modernizr.textshadow) {
  // [default] reading the current style automatically
  $('h1').textshadow();
  
  // creates the HTML structure but doesn't try to apply the styles
  $('h1').textshadow({useStyle: false});
  
  // normal
  $('h1').textshadow('2px 2px 2px #000');
  
  // rgba
  $('h1').textshadow('2px 2px 2px rgba(0, 0, 0, 0.5)');
  
  // hsla
  $('h1').textshadow('2px 2px 2px hsla(0, 100%, 54%, .5)');
  
  // multiple shadows (currently not fully supported)
  $('h1').textshadow('2px 2px 2px #0f0, 4px 4px 2px #f00, 6px 6px 2px #00f');
}
```

### Required CSS
There is a corresponding css file that provides base styles for the new elements used. It must be included in the document as well. Optionally, but recommended for ease-of-use, you could use the Compass mixin ([detailed below](#using-sass-and-compass)) instead of the CSS file.

```html
<!doctype html>
<html>
<head>
  ...
  <link rel="stylesheet" href="jquery.textshadow.css">
  <script src="js/libs/modernizr-1.7.min.js"></script>
</head>
<body>
  ...
  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.js"></script>
  <script src="jquery.textshadow.js"></script>
  <script>
  if (!Modernizr.textshadow) {
    $('h1').textshadow();
  }
  </script>
</body>
</html>
```

### Specifying Custom CSS
For performance and flexibility reasons, it's best to use CSS rather than JS to apply the shadow styles. Particularly when there are hover states or nested elements that need a different shadow applied. Overall the browser will perform better applying the filter properties from CSS rather than from JavaScript. For ease-of-use, try the [Compass mixin instructions](#using-sass-and-compass) below.

```html
<!doctype html>
<html>
<head>
  ...
  <link rel="stylesheet" href="jquery.textshadow.css">
  <style>
    h1 {
      text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.5); /* left top blur color */
    }
    h1 .ui-text-shadow-copy {
      color: #000; /* color */
      filter:
        progid:DXImageTransform.Microsoft.Alpha(opacity=50) /* RGBA alpha */
        progid:DXImageTransform.Microsoft.Blur(makeShadow=false,pixelRadius=2); /* blue */
      left: 1px; /* left - blur */
      top: 1px; /* top - blur */
    }
  </style>
  <script src="js/libs/modernizr-1.7.min.js"></script>
</head>
<body>
  ...
  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.js"></script>
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

```scss
// import the mixin
@import "jquery.textshadow";

// output the base CSS classes
@include jquery-text-shadow-base-styles;

// Apply a text-shadow to an element
h1 {
  @include jquery-text-shadow(3px 3px 2px rgba(0, 0, 0, 0.5));
}
```

Then you can save some rendering time by having the jQuery plugin skip parsing and setting styles.

```js
if (!Modernizr.textshadow) {
  // creates the HTML structure but doesn't try to apply the styles
  $('h1').textshadow({useStyle: false});
}
```

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
h1 .ui-text-shadow-copy {
  color: black;
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=50) progid:DXImageTransform.Microsoft.Blur(makeShadow=false,pixelRadius=2);
  left: 1px;
  top: 1px;
}
```