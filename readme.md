# Text Shadow
This library is a `text-shadow` polyfill for Internet Explorer 9 and below. It uses the Microsoft proprietary [blur filter](http://msdn.microsoft.com/en-us/library/ms532979(v=vs.85).aspx) and the [alpha filter](http://msdn.microsoft.com/en-us/library/ms532967(v=vs.85).aspx) along with layering to closely approximate `text-shadow`.

* currently only pixel units are supported
* currently only a single shadow is supported
* the color must be the last property (even though the [W3C](http://www.w3.org/TR/css3-text/#text-shadow) spec allows it to be first)

# Usage
It is recommended to use this library with a feature detection library such as [Modernizr](http://www.modernizr.com/docs/#textshadow).

    if (!Modernizr.textshadow) {
      // normal
      $('h1').textshadow('2px 2px 2px #000');
      
      // rgba
      $('h2').textshadow('2px 2px 2px rgba(0, 0, 0, 0.5)');
      
      // hsla
      $('h3').textshadow('2px 2px 2px rgba(0, 0, 0, 0.5)');
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
      <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.js"></script>
      <script src="jquery.textshadow.js"></script>
      <script>
      if (!Modernizr.textshadow) {
        $('h1').textshadow('2px 2px 2px #000');
      }
      </script>
    </body>
    </html>