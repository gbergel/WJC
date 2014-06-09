/**
 * Plugs into vmachine to add an openLayers map to the image pop-up
 * based on and replaces showImgPanel in vmachine.js
 */

/*
 * Utility function for handling multiple onload events
 */

function addLoadEvent(func) { 
  var oldonload = window.onload; 
  if (typeof window.onload != 'function') { 
    window.onload = func; 
  }
  else { 
    window.onload = function() { 
      if (oldonload) { 
        oldonload(); 
      } 
      func(); 
    } 
  } 
} 

// Global Vars
var folio;
var map;
var mapContainerId = "panZoomImage";
var imagePanelId = "panel_imageViewer";
// imagePanelInline flag will be set by closePanel and openPanel
// we need a global flag because we want new images
// to launch in the inline panel instead of pop-ups
// when there is an inline panel - this is more flexible
// than hard-coding the conditions for inline panel display
// into the showImgPanel function - we let the caller do that
// and set the flag.
var imagePanelInline = false;
// we need to store the original size and location
// of our image panel as defaults because they will change
// when we scroll or resize the window and we'll need to set them back
var originalImagePanelPos = {x:0, y:0};
// do not initialise originalImagePanelSize to a value, so we can test
// whether it has been set been initialised;
var originalImagePanelSize;


// we have to get the original size of the image panel
// after the dom has loaded.
addLoadEvent(function(){
  originalImagePanelSize = getImagePanelSize();
});

// avoid pink tiles
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
OpenLayers.Util.onImageLoadErrorColor = "black";


/**
 * Utility Functions
 */
 
function getImageXML() {
  // load and parse the xml file
  var xmlhttp;
  if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp=new XMLHttpRequest();
  }
  else {// code for IE6, IE5
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.open("GET","../images/" + folio + "/tilemapresource.xml",false);
  xmlhttp.send();
  return xmlhttp.responseXML;
} 

function getImageOptions() {

  var bounds;
  var maxImageResolution;
  var zoomLevels;
  
	var xmlDoc=getImageXML();
  
  if (xmlDoc) {
    var tileSet = xmlDoc.getElementsByTagName("TileSet")[0];
    if (tileSet) {
      zoomLevels = tileSet.length;
      maxImageResolution = parseFloat(tileSet.getAttribute("units-per-pixel"));
    }
    var boundingBox = xmlDoc.getElementsByTagName("BoundingBox")[0];
    if (boundingBox) {
      mapBounds = new OpenLayers.Bounds( boundingBox.getAttribute("maxx"), boundingBox.getAttribute("minx"), boundingBox.getAttribute("maxy"), boundingBox.getAttribute("miny"));
			bounds = mapBounds;
    }
  }
  // if something went wrong create a sensible default in case we couldn't get it from an xml file
  if (!bounds) bounds = new OpenLayers.Bounds(0.00000000000000,-8000.00000000000000,8000.00000000000000,0.00000000000000);
  // if something went wrong create a sensible default in case we couldn't get it from an xml file
  if (!zoomLevels) zoomLevels = 7;
  // if something went wrong create a sensible default in case we couldn't get it from an xml file
  if (!maxImageResolution) maxResolution = 64.0;

  var options = {
    controls: [],
    maxExtent: bounds,
    maxResolution: maxImageResolution,
    numZoomLevels: zoomLevels,
  };
  
  return options;
  
}


function overlay_getTileURL(bounds) {
  var res = this.map.getResolution();
  var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
  var y = Math.round((bounds.bottom - this.maxExtent.bottom) / (res * this.tileSize.h));
  var z = this.map.getZoom();
  if (x >= 0 && y >= 0) {
    return this.url + "../images/" + folio + "/" + z + "/" + x + "/" + y + "." + this.type;				
  }
  else {
    return "http://www.maptiler.org/img/none.png";
  }
}

function folioFromImageSrc(theImgSrc) {
  // strip 'images/' and '.jpg/
  var folio = theImgSrc.replace('images/', '').replace('.jpg', '').replace('.jpeg', '');
  return folio;
}

function getWindowHeight() {
  if (self.innerHeight)
    return self.innerHeight;
  if (document.documentElement && document.documentElement.clientHeight)
    return document.documentElement.clientHeight;
  if (document.body)
    return document.body.clientHeight;
  return 0;
}

function getWindowWidth() {
  if (self.innerWidth)
    return self.innerWidth;
  if (document.documentElement && document.documentElement.clientWidth)
    return document.documentElement.clientWidth;
  if (document.body)
    return document.body.clientWidth;
  return 0;
}

function getWindowScrollX() {
  var scrOfX = 0;
  if( typeof( window.pageXOffset ) == 'number' ) {
    //Netscape compliant
    scrOfX = window.pageXOffset;
  } else if( document.body && document.body.scrollLeft ) {
    //DOM compliant
    scrOfX = document.body.scrollLeft;
  } else if( document.documentElement && document.documentElement.scrollLeft ) {
    //IE6 standards compliant mode
    scrOfX = document.documentElement.scrollLeft;
  }
  return scrOfX;
}

function getWindowScrollY() {
  var scrOfY = 0;
  if( typeof( window.pageYOffset ) == 'number' ) {
    //Netscape compliant
    scrOfY = window.pageYOffset;
  } else if( document.body && document.body.scrollTop ) {
    //DOM compliant
    scrOfY = document.body.scrollTop;
  } else if( document.documentElement && document.documentElement.scrollTop ) {
    //IE6 standards compliant mode
    scrOfY = document.documentElement.scrollTop;
  }
  return scrOfY;
}

function findPosition( oElement ) {
  if( typeof( oElement.offsetParent ) != 'undefined' ) {
    for( var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent ) {
      posX += oElement.offsetLeft;
      posY += oElement.offsetTop;
    }
    return {x:posX, y:posY };
  }
  else {
    return {x:oElement.x, y:oElement.y };
  }
}

function getImagePanelSize() {
  var imagePanel = document.getElementById(imagePanelId);
  return {w:imagePanel.offsetWidth, h:imagePanel.offsetHeight};
}

/**
 * Window Event Handlers
 */

function adjustIfImagePanelIsOffscreen() {
  var imagePanel = document.getElementById(imagePanelId);
  var windowSize = {w:getWindowWidth(), h:getWindowHeight()};
  //right side
  var imagePanelRightEdge = imagePanel.offsetLeft + imagePanel.offsetWidth;
  var originalImagePanelRightEdge = originalImagePanelPos.x + imagePanel.offsetWidth;
  var windowRightEdge = window.getWindowWidth() + getWindowScrollX() - 44;//add a bit of padding for smoother movement when resizing
  if (imagePanelRightEdge > windowRightEdge || imagePanelRightEdge < originalImagePanelRightEdge) {
     imagePanel.style.left = windowRightEdge - imagePanel.offsetWidth + "px";
  }
  // correct if it has moved off screen
  if (imagePanel.offsetLeft < 20) {
    imagePanel.style.left = 20 + "px";    
  }

  // bottom  
  var imagePanelBottomEdge = imagePanel.offsetTop + imagePanel.offsetHeight;
  var originalImagePanelBottomEdge = originalImagePanelPos.y + imagePanel.offsetHeight;
  var windowBottomEdge = window.getWindowHeight() + getWindowScrollY() - 44;//add a bit of padding for smoother movement when resizing
  if (imagePanelBottomEdge > windowBottomEdge || imagePanelBottomEdge < originalImagePanelBottomEdge) {
    imagePanel.style.top = windowBottomEdge - imagePanel.offsetHeight + "px";
  }
  if (imagePanel.offsetTop < 20) {
    imagePanel.style.top = 20 + "px";
  }
}

function scrollPanZoomImage(){
  var mapContainer = document.getElementById(mapContainerId);
  if (mapContainer) {
    var imagePanel = document.getElementById(imagePanelId);
    var offsetTop = originalImagePanelPos.y - getWindowScrollY();
    var offsetLeft = originalImagePanelPos.x - getWindowScrollX();
    var offsetBottom = (imagePanelInline)? 8 : 44;
    if (offsetTop <= 0) {
      offsetTop = 0;
      // set the positioning to fixed rather than setting the top
      // to acheive much smoother motion and prevent
      // the map from continually re-rendering
      imagePanel.style.top = 0;
      imagePanel.style.left = offsetLeft + "px";
      imagePanel.style.position = "fixed";
    }
    else {
      imagePanel.style.top = originalImagePanelPos.y + "px";
      imagePanel.style.left = originalImagePanelPos.x + "px";
      imagePanel.style.position = "absolute";
    }
    if (imagePanelInline) {
      mapContainer.style.height = (getWindowHeight() - offsetTop - offsetBottom - mapContainer.offsetTop) + "px";
    }
  }
}

function resizePanZoomImage() {
  var mapContainer = document.getElementById(mapContainerId);
  if (mapContainer) {
    var imagePanel = document.getElementById(imagePanelId);
    var windowSize = {w:getWindowWidth(), h:getWindowHeight()};
    // need to take scrolling into account
    var offsetTop = findPosition(imagePanel).y - getWindowScrollY();
    if (offsetTop < 0) offsetTop = 0;
    
    // we need to calculate the size differently depending on whether 
    // the image panel is inline or not (resizePanels only resizes the widths of the panels
    var mapContainerWidth;
    var mapContainerHeight;
    if (imagePanelInline) {
      mapContainerWidth = imagePanel.offsetWidth;
      imagePanel.style.height = "auto";
      mapContainerHeight = windowSize.h - offsetTop - mapContainer.offsetTop;
      mapContainerHeight = windowSize.h - offsetTop - mapContainer.offsetTop;
    }
    else {
      adjustIfImagePanelIsOffscreen();
      if (originalImagePanelSize && originalImagePanelSize.w) {
	    var imagePanelWidth = (originalImagePanelSize.w < windowSize.w -40)? originalImagePanelSize.w : windowSize.w -40;
        imagePanel.style.height = imagePanelWidth + "px";
        mapContainerWidth = imagePanel.offsetWidth - mapContainer.offsetLeft;
      }
      if (originalImagePanelSize && originalImagePanelSize.h) {
        var imagePanelHeight = (originalImagePanelSize.h < windowSize.h -40)? originalImagePanelSize.h : windowSize.h -40;
        imagePanel.style.height = imagePanelHeight + "px";
        mapContainerHeight = imagePanel.offsetHeight - mapContainer.offsetTop;
      }
    }

    mapContainer.style.height = mapContainerHeight - 8 + "px";
    mapContainer.style.width = mapContainerWidth - 12 + "px";

    if (map && map.updateSize) {
      map.updateSize();
    }
  }
}


/**
 * Adds an OpenLayers map as our PanZoom image
 */
function addPanZoomImage(id) {
  
  var options = getImageOptions();
  // if we have a map, destroy it before adding a new one
  if (map) map.destroy;
  
  // create the map object
  map = new OpenLayers.Map(id, options);

  // create the image layer
  var layer = new OpenLayers.Layer.TMS( "TMS Layer","", {
    url: '',
    serviceVersion: '.',
    layername: '.',
    alpha: true,
    type: 'png',
    getURL: overlay_getTileURL 
  });
  
  // provide a slight gutter to the tile s to prevent gaps at higher browser zoom levels
  // Note: the openLayers documention specifies an integer here, but providing a float seems to work
  // and prevents misalignment
  //layer.gutter = 0.5;

  // add the layer to the map and set the inital zoom and pan
  map.addLayer(layer);
 
  // The default mapTiler settings create a very small image at level 0
  // we probably do want to allow mapTiler to create
  // that small image in case we ever need a very small window,
  // but lets zoom in one level to start with a larger image.
  map.zoomToExtent( options.maxExtent );
  map.panTo(map.getCenter());
  map.addControl(new OpenLayers.Control.PanZoomBar());
  map.addControl(new OpenLayers.Control.Navigation());
  map.addControl(new OpenLayers.Control.KeyboardDefaults());

}

/**
 * Override Function: showImgPanel in vmachine.js to add our panZoom image instead of the
 * standard image or as a panel inline with the witness Panels
 */

function showImgPanel(e, theInstance, theImgSrc, theWitness, theFolioString, theFolio, x, y, panZoom) {
  
  var offx = (x)? x-0 : 20;
  var offy =  (y)? y-0: 20;
  var theHandle = document.getElementById("handle" + "_" + theInstance);
  var theRoot   = document.getElementById("panel" + "_" + theInstance);
  var theContent   = document.getElementById("content" + "_" + theInstance);
  var theTitle = document.getElementById("title" + "_" + theInstance);
  var theImg = "<img title='Page image' alt='Page image' src='"+ theImgSrc + "'>";
  
  // Override: set our global imagePanelId according to the argument sent
  imagePanelId = "panel" + "_" + theInstance;
  
  // Start Override: change theImg if the panZoom flag has been passed
  if (panZoom) {
    // get the folio from theImgSrc, not from theFolio (which is just the folio number without identifying the witness)
    folio = folioFromImageSrc(theImgSrc);
    theImg = "<div id='" + mapContainerId + "'></div>";
  }
  // End Override: change theImg if the panZoom flag has been passed
 
  Drag.init(theRoot, theRoot);
  /* theRoot.onDragStart=makePanelTop; */
  theRoot.onDrag=pStyleDrag;
  
  // Start Override: we want to reset originalImagePanelPos at the end of dragging
  theRoot.onDragEnd= function() {
    pStyleDragEnd.apply(this);
    //this.style.opacity = '1.0'; 
    //this.style.filter = "alpha(opacity=100)";
 	  originalImagePanelSize = getImagePanelSize();
    originalImagePanelPos.x = theRoot.offsetLeft;
    originalImagePanelPos.y = theRoot.offsetTop;
    
  }    
  
  // Override: set the cursor back to the move cursor (we change it later for inline panel)
  theRoot.root.style.cursor = "move";
  
  panels[panels.length]=theRoot;
  /* panels[panels.length-1].style.zIndex = panels.length - 1; */
  
  // Override: test for e (MouseEvent). If not the panel will be positioned later 
  if (e) {
    positionPanel(e,theRoot,offx,offy);
    originalImagePanelPos.x = theRoot.offsetLeft;
    originalImagePanelPos.y = theRoot.offsetTop;
  }
 
  theContent.innerHTML = theImg;
  
  /*if (theWitness != '' && theFolioString != '' && theFolio != '') {
      theTitle.innerHTML = "Image Viewer [witness " + theWitness + ", " + theFolioString + " " + theFolio + "]";
  }
  else if (theWitness != '' && folio != '') {
      theTitle.innerHTML = "Image Viewer [witness " + theWitness + ", folio " + folio + "]";
  }
  else*/ if (theWitness != '') {
      theTitle.innerHTML = "Image Viewer [witness " + theWitness + "]";   
  }/*
  else if (folio != '') {
      theTitle.innerHTML = "Image Viewer [folio " + folio + "]";   
  }
  else {
    theTitle.innerHTML = "Image Viewer";
  }*/
  theRoot.style.visibility = "visible";
  
  // Start Override:
  // if our panel is to be displayed inline with other panels
  // we need to resize all panels to accommodate, and disable dragging. If not
  // displayed in a panel we need to set the imagePanel's width back to its
  // original width in case it was resized before. Add the PanZoom image
  // and call functions to resize and scroll the panel to the appropriate
  // size and location
  if (imagePanelInline) {
    resizePanels(); 
    // disable Drag - we need to because the imagePanel Object was only hidden 
    // before, and still has these properties if it was previously a pop up
    theRoot.onmousedown	= null;
    theRoot.root.onDragStart	= null;
    theRoot.root.onDragEnd	= null;
    theRoot.root.onDrag		= null;
    theRoot.root.style.cursor = "default";
    // avoid covering popup notes (z-index of 24)
    theRoot.style.zIndex = "10";
   }
  else {
    if (originalImagePanelSize) theRoot.style.width = originalImagePanelSize.w + "px";
    // popup notes are children of the links that pop them, so if our z-index is lower
    // than the popup notes, the links will also be above the image
    theRoot.style.zIndex = "100";
  } 
  if (panZoom) {
    addPanZoomImage(mapContainerId);
    onscroll=function(){ scrollPanZoomImage(); };  
    onresize=function(){ resizePanels(); };
    // if imagePanel is inline we will have already called resizePanZoomImage through resizePanels
    if (!imagePanelInline) resizePanZoomImage();    
    scrollPanZoomImage();
  }
  
  // if the image is in a popup, adjust its position
  // if it is partially offscreen
  if (!imagePanelInline) {
    adjustIfImagePanelIsOffscreen();
  }
  // end Override
  
}

/**
 * Function: addImagePanelIfOnlyOneWitness 
 * calls showPanZoomImagePanelForWitness to add a PanZoom image
 * as an inline Panel if there is only a single witness being displayed
 */
function addImagePanelIfOnlyOneWitness() {
  var mssArea = document.getElementById("mssArea");
  var mssPanels = getElementsByClass("mssPanel", mssArea, "div");
  if (mssPanels.length == 1) {
    showPanZoomImagePanelForWitness(mssPanels[0]);
  }
}

/**
 * Function: showPanZoomImagePanelForWitness
 * adds a PanZoom image as an inline Panel by calling the onclick handler
 * for the first image link in the witness
 */
function showPanZoomImagePanelForWitness(witnessPanel) { 
  var imageLinks = getElementsByClass("imageLink", witnessPanel);
  var firstImageLinkOnClick;
  // if there are multiple witnesses we need to find out which one is selected (they are all in the panel but just hidden)
  var witnessMenus = getElementsByClass("witnessMenu",witnessPanel,"select")[0];
  if (witnessMenus) {
    var witnessIndex = getElementsByClass("witnessMenu",witnessPanel,"select")[0].selectedIndex;
    // I am assuming here that the order of witnesses in the select matches the order of imagelinks
    firstImageLinkOnClick = imageLinks[witnessIndex].getAttribute("onclick");//,'images/w57v.jpg',
  }
  else {
    // there is no witness menu, grab the first ImageLink
    firstImageLinkOnClick = imageLinks[0].getAttribute("onclick");//,'images/w57v.jpg',
  }
  //ie returns a function instead of a string
  firstImageLinkOnClick = firstImageLinkOnClick.toString();
    
  var onClickFunction = firstImageLinkOnClick.substring(firstImageLinkOnClick.indexOf("showImgPanel"), firstImageLinkOnClick.indexOf(";"));
  //onClickFunction += ", true);";
  onClickFunction += ";";
  //set our global flag to display inline
  imagePanelInline = true;
  var event = '';//document.createEvent("MouseEvents");
  eval(onClickFunction);
}

/**
 * Function Override: init in vmachine.js to call addImagePanelIfOnlyOneWitness() 
 * when there is only one witness and no 'witnessMenu' (normally addImagePanelIfOnlyOneWitness()
 * is called in changeWitness, but that isn't called if there is no witnessMenu - the
 * function just fails silently before reaching that point`)
 */

function init() {
   var mssArea = document.getElementById("mssArea");
   var mssPanels = getElementsByClass("mssPanel",mssArea,"div");
   // Start Override: allow for cases in which there is not a witnessMenu
   // ie: there is only a single witness and it doesn't make sense to put a select
   // element in the panel. If there is only one witness
   // we dont call changeWitness (which also requires the select element to 
   // determine the currently selected witness and makes no sense if there is
   // only one witness). We still want to add an imagePanel though, so we call
   // addImagePanelIfOnlyOneWitness(). But since this function will call
   // resizePanels (through showImgPanel), we need to set a flag so that
   // we dont call resizePanels again. Phew!
   // Also, Chrome does not get our original panel size onload,
   // so try to get it here
   originalImagePanelSize = getImagePanelSize();
   var panelsNeedResizing = true;
   for (i = 0; i < mssPanels.length; i++) {
      var currentPanel = mssPanels[i];
      var witnessMenu = getElementsByClass("witnessMenu",currentPanel,"select")[0];
      if (witnessMenu) {
        witness = witnessMenu.value;
        changeWitness(witness,currentPanel);
      } 
      else {
         panelsNeedResizing = false;
         addImagePanelIfOnlyOneWitness();
      }
   }
   if (panelsNeedResizing) resizePanels();
      // end Override
}

/**
 * Function Override: openPanel in vmachine.js to set the imagePanelInline Flag to False
 * and to hide the image panel when a new witness Panel is added.
 * these represent the default state.
 * note: this function later calls changeWitness, which will add
 * the panel if there is only one panel
 */

function openPanel() {
  
  // Start Override: set the flag to false and hide the image panel
  imagePanelInline = false;
  hidePanel('imageViewer');
  // End Override: set the flag to false and hide the image panel
  
   var mssArea = document.getElementById("mssArea");
   var manuscriptsDiv = document.getElementById("manuscripts");
   var panelButton = document.getElementById("newPanel");
   var mssPanels = getElementsByClass("mssPanel",manuscriptsDiv,"div");
   var totalPanels = mssPanels.length;

   if (totalPanels + 1 >= maxPanels) {
      panelButton.disabled = true;
   }
   if (totalPanels >= maxPanels) {
      alert("Sorry, but the number of visible versions may not exceed the total number of available witnesses.");
   } else {
      var witnessIndex = getElementsByClass("witnessMenu",mssPanels[totalPanels - 1],"select")[0].selectedIndex;
      var newPanel = mssPanels[totalPanels - 1].cloneNode(true);
      var newMenu = getElementsByClass("witnessMenu",newPanel,"select")[0];
      var newWitnessIndex = witnessIndex + 1;
      if (newWitnessIndex >= newMenu.length) newWitnessIndex = witnessIndex;
      newMenu.selectedIndex = newWitnessIndex;
      manuscriptsDiv.appendChild(newPanel);
      resizePanels();
      changeWitness(newMenu.value,newPanel);
   }
}

/**
 * Function Override: closePanels in vmachine.js to include our image panel when there is only one Panel left
 */

function closePanel(panel) { 
  var mssArea = document.getElementById("mssArea");
  var manuscriptsDiv = document.getElementById("manuscripts");
  var mssPanels = getElementsByClass("mssPanel",manuscriptsDiv,"div");
  var panelButton = document.getElementById("newPanel");
  var totalPanels = mssPanels.length;
  if (totalPanels == 1) {
    alert("Sorry, but you cannot close all versions.");
  }
  else {
    manuscriptsDiv.removeChild(panel);
    
    // Override: add our image panel if there is only one panel left
    addImagePanelIfOnlyOneWitness();    
    resizePanels();
    
    presentInlineNotes();
    if (panelButton.disabled == true) {
      panelButton.disabled = false;
    }
  }
  

}

/**
 * Function Override: hidePanels in vmachine.js to resize panels when our image panel
 * is displayed inline and closed
 */

function hidePanel(theInstance) { 
  if (!document.getElementById) {
    return null;
  }

  document.getElementById("panel" + "_" + theInstance).style.visibility = "hidden";
  
  // Start Override: if we are hiding the imageViewer and it was displayed Inline, resizePanels
  if (theInstance == "imageViewer" && imagePanelInline) {
    resizePanels();
  }
}
/**
 * Function Override: resizePanels in vmachine.js to include our image panel when it is displayed inline
 */

function resizePanels() {
  var mssArea = document.getElementById("mssArea");
  var panels = getElementsByClass("mssPanel",mssArea,"div");
  var notesPanel = document.getElementById("notesPanel");
  var bibPanel = document.getElementById("bibPanel");
  
  // Override: Get our image panel
  var imagePanel = document.getElementById(imagePanelId);
 
  var numPanels = panels.length;
  if (notesPanel.style.display != "none") numPanels++;
  if (bibPanel.style.display != "none") numPanels++;
  
  // Override: add our image panel to the panel count
  if (imagePanel.style.display != "none" && imagePanel.style.visibility != "hidden" && imagePanelInline) numPanels++;

  var borderWidth = 2;

  // Set a minimum page width equal to the width of the main banner / control bar
  var minPageWidth = document.getElementById("mainBanner").offsetWidth;
  
  // Calculate viewport width
  var pageWidth = windowWidth();//_BAK_vmachine.js: var pageWidth = windowWidth() - 15;
   //take into consideration the left side navigation
   pageWidth = pageWidth - document.getElementById("navigation").offsetWidth - 40;

  if (pageWidth < minPageWidth) pageWidth = minPageWidth;
  
  // Start Override: take borders into consideration
  pageWidth = pageWidth - borderWidth * numPanels;
  
  // Set a minimum panel width of 300px
  var minPanelWidth = 300 - borderWidth;
  
  // Calculate panel width
  var panelWidth = Math.floor(pageWidth / numPanels);
  if (panelWidth < minPanelWidth) panelWidth = minPanelWidth;
  
  //var leftPos = 0; Override: this variable is never used
  
  if (bibPanel.style.display != "none") {
    bibPanel.style.width = panelWidth + "px";
  }
  for (l = 0; l < panels.length; l++) {
    panels[l].style.width = panelWidth + "px";
  }
 
  if (notesPanel.style.display != "none") {
    notesPanel.style.width = panelWidth + "px";
  }
  
  // Start Override: size the image panel appropriately
  if (imagePanel.style.display != "none") {
    if (imagePanelInline) {
      originalImagePanelPos.x = findPosition(panels[0]).x + panelWidth + borderWidth;
      originalImagePanelPos.y = findPosition(panels[0]).y;
      imagePanel.style.width = panelWidth + "px";
      imagePanel.style.left = originalImagePanelPos.x + "px";
      imagePanel.style.top = originalImagePanelPos.y  + "px";
      resizePanZoomImage();
      if (getWindowScrollX() || getWindowScrollY()) {
        scrollPanZoomImage();
      }
    }
    else {
      if (originalImagePanelSize) {
        imagePanel.style.width = originalImagePanelSize.w  + "px";
        imagePanel.style.height = originalImagePanelSize.h  + "px";
      }
      resizePanZoomImage();
    }    
    
  }
  // End Override: size the image panel appropriately

  mssArea.style.width = numPanels * (panelWidth + borderWidth) + "px";//_BAK_vmachine.js: mssArea.style.width = ((panelWidth + borderWidth) * numPanels) + "px";
}

/**
 *  Function Override: changeWitness in vmachine.js to change to the appropriate image
 *  when there is only one witness
 */

function changeWitness(witness,panel) {

  var lines = getElementsByClass("line",panel,"div");
  var rdgTags = getElementsByClass("reading",panel,"span");
  var rdgGroups = getElementsByClass("rdgGrp",panel,"span");
  var images = getElementsByClass("imageLink",panel,"img");
  
  // Override: added the ability to use links instead of img's (without breaking img's)
  var links = getElementsByClass("imageLink",panel,"a");
  
  var stanzas = getElementsByClass("stanzabreak",panel,"br");
  var pagebreaks = getElementsByClass("pagebreak",panel,"hr");
  var notesPanel = document.getElementById("notesPanel");
  var notes = getElementsByClass("noteContent",notesPanel,"div");
  var matching = witnesses[witness].split(';');

  // Show/hide any reading or lemma tags relevant to chosen witness
  for (m = 0; m < rdgTags.length; m++) {
    rdgTags[m].style.display = "none";
    for (n = 0; n < matching.length; n++) {
      var pattern = new RegExp('(^|\\s)' + matching[n] + '(\\s|$)');
      if (pattern.test(rdgTags[m].className)) {
        rdgTags[m].style.display = "inline";
      }
    }
  }
 
  // Show/hide any reading group tags relevant to chosen witness
  for (m = 0; m < rdgGroups.length; m++) {
    rdgGroups[m].style.display = "none";
    for (n = 0; n < matching.length; n++) {
      var pattern = new RegExp('(^|\\s)' + matching[n] + '(\\s|$)');
      if (pattern.test(rdgGroups[m].className)) {
        rdgGroups[m].style.display = "inline";
      }
    }
  }

  // Show/hide witness-specific images
  for (p = 0; p < images.length; p++) {
    if (images[p].className != "imageLink") {
      images[p].style.display = "none";
      for (q = 0; q < matching.length; q++) {
        var pattern = new RegExp('(^|\\s)' + matching[q] + '(\\s|$)');
        if (pattern.test(images[p].className)) {
          images[p].style.display = "block";
        }
      }
    }
  }
 
  // Start Override: added the ability to use links instead of img's (without breaking img's)
  // Show/hide witness-specific links
  for (p = 0; p < links.length; p++) {
    if (links[p].className != "imageLink") {
      links[p].style.display = "none";
      for (q = 0; q < matching.length; q++) {
        var pattern = new RegExp('(^|\\s)' + matching[q] + '(\\s|$)');
        if (pattern.test(links[p].className)) {
          links[p].style.display = "block";
        }
      }
    }
  }
 // End Override: added the ability to use links instead of img's (without breaking img's)

  for (r = 0; r < stanzas.length; r++) {
    stanzas[r].style.display = "none";
    for (s = 0; s < matching.length; s++) {
      var pattern = new RegExp('(^|\\s)' + matching[s] + '(\\s|$)');
      if (pattern.test(stanzas[r].className)) {
        stanzas[r].style.display = "block";
      }
    }
  }

  for (t = 0; t < pagebreaks.length; t++) {
    pagebreaks[t].style.display = "none";
    for (u = 0; u < matching.length; u++) {
      var pattern = new RegExp('(^|\\s)' + matching[u] + '(\\s|$)');
      if (pattern.test(pagebreaks[t].className)) {
        pagebreaks[t].style.display = "block";
      }
    }
  }

  // Hide lines that have no visible content (which should, therefore, have
  // a display height of zero)
  for (o = 0; o < lines.length; o++) {
    lines[o].style.display = "block";
    if (lines[o].offsetHeight == 0) {
      lines[o].style.display = "none";
    }
  }

  presentInlineNotes();
  // Override: add our image panel if there is only one panel left
  addImagePanelIfOnlyOneWitness();

 }
