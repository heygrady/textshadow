# Text Shadow
This library is a `text-shadow` polyfill for Internet Explorer 9 and below. It uses the Microsoft proprietary [blur filter](http://msdn.microsoft.com/en-us/library/ms532979(v=vs.85\).aspx) and the [alpha filter](http://msdn.microsoft.com/en-us/library/ms532967(v=vs.85\).aspx) along with layering to closely approximate `text-shadow`.

* currently only pixel units are supported
* cutting and pasting text will result in doubled text
* the creation of the extra DOM nodes could potentially be faster

# Usage
It is recommended to use this library with a feature detection library such as [Modernizr](http://www.modernizr.com/docs/#textshadow).

    if (!Modernizr.textshadow) {
      // [default] allowing the styles to be applied using CSS
      $('h1').textshadow();

      // reading the current style automatically
      $('h1').textshadow({skipStyles: false});
      
      // normal
      $('h1').textshadow('2px 2px 2px #000');
      
      // multiple shadows
      $('h1').textshadow('2px 2px 2px #0f0, 4px 4px 2px #f00, 6px 6px 2px #00f');
      
      // rgba
      $('h1').textshadow('2px 2px 2px rgba(0, 0, 0, 0.5)');
      
      // hsla
      $('h1').textshadow('2px 2px 2px hsla(0, 0, 0, 0.5)');
    }
    
There is a corresponding css file that provides base styles for the new elements used. It must be included in the document as well.

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

For performance and flexibility reasons, its probably best to use CSS rather than JS to apply the shadow styles. Particularly when there are hover states or nested elements that need a different shadow applied. Overall the browser will perform better applying the filter properties from CSS rather than from JavaScript.

    <!doctype html>
    <html>
    <head>
      ...

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