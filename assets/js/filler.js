// ------ Setting height of filler div ----- (from admin_edit)
var fillerDiv = document.getElementById('filler');

var topHeight = document.getElementById('info-events').offsetHeight;
var bottomHeight = document.getElementById('footer').offsetHeight;
var windowHeight = window.innerHeight;
var headerHeight = document.getElementById('header').offsetHeight;      // try removing this if not perfectly aligned

var heightFiller = windowHeight - topHeight - bottomHeight - headerHeight + 5;

fillerDiv.style.height = heightFiller+'px';

// console.log('Winheight =', windowHeight, 'Topheight =', topHeight, 'Bottom =', bottomHeight, 'Filter =', heightFiller);