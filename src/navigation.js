function getCurrentMode() {
  var mode = "";
  if ($("a.browse-mode").parent().hasClass("active")) {
    mode = "browse";
  } 
  else if ($("a.compare-mode").parent().hasClass("active")) {
    mode = "compare";
  } 
  else if ($("a.image-mode").parent().hasClass("active")) {
    mode = "image";
  } 

  if ($("a.list-browse-mode").parent().hasClass("active")) {
    mode += "-list";
  } 
  else if ($("a.thumb-browse-mode").parent().hasClass("active")) {
    mode += "-thumb";
  } 
//  else if ($("a.tree-browse-mode").parent().hasClass("active")) {
//    mode += "-tree";
//  }
  return mode;  
}



function panelIndexForWitness(witness) {
  var panelIndex = -1;
  var mssArea = document.getElementById("mssArea");
  var manuscriptsDiv = document.getElementById("manuscripts");
  var mssPanels = getElementsByClass("mssPanel",manuscriptsDiv,"div");
  var totalPanels = mssPanels.length;
  for (var i = 0; i < totalPanels; i++) {
    var witnessSelect = getElementsByClass("witnessMenu",mssPanels[i],"select")[0];
    if (witnessSelect) {
      var selectedIndex = witnessSelect.selectedIndex;
      if (witnessSelect.options.item(selectedIndex).value == witness) {
        panelIndex = i;
        break;
      }
    }
  }

  return panelIndex;
}

function selectWitness(witness) {
  var mssArea = document.getElementById("mssArea");
  var manuscriptsDiv = document.getElementById("manuscripts");
  var mssPanels = getElementsByClass("mssPanel",manuscriptsDiv,"div");
  var totalPanels = mssPanels.length;
  var mode = getCurrentMode();
  if (mode.search("compare") > -1) {
    var panelIndex = panelIndexForWitness(witness);
    if (panelIndex > -1) {
       closePanel(mssPanels[panelIndex]);
       return;
    }
    else {
      openPanel();
      mssPanels = getElementsByClass("mssPanel",manuscriptsDiv,"div");
      totalPanels = mssPanels.length; 
    }     
  }
  if (mode.search("browse") > -1) {
      $(document).removeApp();
  }
  var witnessSelect = getElementsByClass("witnessMenu",mssPanels[totalPanels-1],"select")[0];
  var witnessIndex;
  for (var i = 0; i < witnessSelect.options.length; i++) {
    if (witnessSelect.options.item(i).value == witness) {
      witnessIndex = witnessSelect.options.item(i).index;
      break;
    }
  }
  
  witnessSelect.selectedIndex = witnessIndex;
  changeWitness(witness, mssPanels[totalPanels-1]);
}

function singleWitness() {
  $(document).showVersioningMachine();  
  var mssArea = document.getElementById("mssArea");
  var manuscriptsDiv = document.getElementById("manuscripts");
  var mssPanels = getElementsByClass("mssPanel",manuscriptsDiv,"div");
  var totalPanels = mssPanels.length;
  for (var i = 1; i < totalPanels; i++) {
    closePanel(mssPanels[i]);     
  }
}

function multipleWitnesses() {
  $(document).showVersioningMachine();
  var mssArea = document.getElementById("mssArea");
  var manuscriptsDiv = document.getElementById("manuscripts");
  var mssPanels = getElementsByClass("mssPanel",manuscriptsDiv,"div");
  var totalPanels = mssPanels.length;
  if (totalPanels == 1) {
  $(document).removeApp();
    openPanel();     
  }
}

function allWitnesses() {
  console.log("all witnesses");
  var mssArea = document.getElementById("mssArea");
  var manuscriptsDiv = document.getElementById("manuscripts");
  var mssPanels = getElementsByClass("mssPanel",manuscriptsDiv,"div");
  var totalPanels = mssPanels.length;
  var mode = getCurrentMode();
  var witnessSelect = getElementsByClass("witnessMenu",mssPanels[totalPanels-1],"select")[0];
	var witnessIndex;
	var witness;
  for (var i = 0; i < witnessSelect.options.length; i++) {
    mssPanels = getElementsByClass("mssPanel",manuscriptsDiv,"div");
		totalPanels = mssPanels.length;
    witnessSelect = getElementsByClass("witnessMenu",mssPanels[totalPanels-1],"select")[0];
    console.log(witnessSelect);
    witness = witnessSelect.options[i].value;
	  if (mode.search("compare") > -1) {
	    var panelIndex = panelIndexForWitness(witness);
	    if (panelIndex <= -1) {
	      openPanel();
	      mssPanels = getElementsByClass("mssPanel",manuscriptsDiv,"div");
	      totalPanels = mssPanels.length; 
	    }     
	  }
	  if (mode.search("browse") > -1) {
	      $(document).removeApp();
	  }
	  for (var j = 0; j < witnessSelect.options.length; j++) {
	    if (witnessSelect.options.item(j).value == witness) {
	      witnessIndex = witnessSelect.options.item(j).index;
	      break;
	    }
	  }
	  
	  witnessSelect.selectedIndex = witnessIndex;
	  changeWitness(witness, mssPanels[totalPanels-1]);
  }
	$(document).highlightSelectedWitnessesInAllMenus();
}


function imageMode() {
  $(document).hideVersioningMachine();
}

/**
 *
 * jQuery NAVIGATION
 *
 */

// jCarousel requires a width to be set, and we want it to be variable
// but also take into account static left-side navigation, so we use percentages
// in the CSS, but resize with jquery here for more precision
$(window).resize(function() {
  //$('.jcarousel-container-vertical').width($(window).width() -300);
  //$('.jcarousel-container-horizontal').width($(window).width() -340);
  $('.jcarousel-container-vertical').height($(window).height() -300);
});

$(document).ready(function() {

  $.fn.hideVersioningMachine = function() {
    $("#witness-navigation").hide();
    $("#mainBanner").hide();
    $("#mssArea").hide();
    $("#panel_imageViewer").hide();
    $("#brandingLogo").hide();
  }
  $.fn.showVersioningMachine = function() {
    $("#witness-navigation").show();
    $("#mainBanner").show();
    $("#mssArea").show();
    $("#panel_imageViewer").show();
    $("#brandingLogo").show();
  }
  $.fn.highlightSelectedWitnessesInAllMenus = function() {
    highlightSelectedWitnesses($('#witness-navigation ul'));
  }

  var radioTypeSelect = function() { 
    $(this).parent().siblings().removeClass("active");
    $(this).parent().addClass("active");
    if ($(this).attr("href") == "#") return false; 
  };
  
  var witnessForAnchor = function(a) {
    var onClick = $(a).attr("onClick");
    var witness = onClick.substring(onClick.indexOf("('")+2, onClick.indexOf("')"));
    return witness;
  };
  
  var highlightSelectedWitnesses = function(menu) {
    $('li a', menu).each(function() {
      var witness = witnessForAnchor(this);
      if (panelIndexForWitness(witness) > -1) {
        $(this).parent("li").addClass("active");
      }
      else {
        $(this).parent("li").removeClass("active");
      }
    });
  };
       
  var addEventHandlersToPanel = function(panel) {
  
    // get the witness menu select element
    var witnessSelectMenu = $('select.witnessMenu', panel);
    // first unbind the handler in case it was added previously
    witnessSelectMenu.unbind("change", $(document).highlightSelectedWitnessesInAllMenus);
    // bind the handler to the change event
    witnessSelectMenu.bind("change", $(document).highlightSelectedWitnessesInAllMenus);
    
    // get the close panel image element
    var closePanelButton = $('img.closePanel', panel);
    // first unbind the handler in case it was added previously
    closePanelButton.unbind("click", $(document).highlightSelectedWitnessesInAllMenus);
    // bind the handler to the click event
    closePanelButton.bind("click", $(document).highlightSelectedWitnessesInAllMenus);

  }
 
  
  //create copies of the witness-list for each browse mode and remove unnecessary items
  
  $("#witness-navigation").append('<div id="list-nav"></div>');
  var listNav = $("#list-nav");
  var listWitnessList = $("#witness-navigation-menu").clone();
  listWitnessList.attr("id", "list-witness-menu");
  $("img", listWitnessList).remove();
  listNav.append(listWitnessList);
  listNav.hide();

  $("#witness-navigation").append('<div id="thumb-nav" ></div>');
  var thumbNav = $("#thumb-nav");
  var thumbWitnessList = $("#witness-navigation-menu").clone();
  thumbWitnessList.attr("id", "thumb-witness-menu");
  //$("a", thumbWitnessList).text("");
  thumbNav.append(thumbWitnessList);
  thumbNav.hide();

//  $("#witness-navigation").append('<div id="tree-nav"></div>');
//  var treeNav = $("#tree-nav");
//  var treeWitnessList = $("#witness-navigation-menu").clone();
//  treeWitnessList.attr("id", "tree-witness-menu");
//  $("img", treeWitnessList).remove();
//   treeNav.append(treeWitnessList);
//  treeNav.hide();
  
  // hide the original witness list
  
  $("#witness-navigation-menu").hide(); // remove()?
  
  // create functions for showing each browse mode menu

  var showListNav = function() {
    listNav.show();
    thumbNav.hide();
//    treeNav.hide();
    highlightSelectedWitnesses($('ul', listNav));
  };  
  var showThumbNav = function() {
    listNav.hide();
    thumbNav.show();
//    treeNav.hide();
    highlightSelectedWitnesses($('ul', thumbNav));
  };  
// var showTreeNav = function() {
//    listNav.hide();
//    thumbNav.hide();
//    treeNav.show();
//    highlightSelectedWitnesses($('ul', treeNav));
//  };  
  
  
  // configure the buttons for each browse mode to show/hide the appropriate menu

  $("a.thumb-browse-mode").click(showThumbNav);  
  $("a.list-browse-mode").click(showListNav);  
 // $("a.tree-browse-mode").click(showTreeNav);

  $("a.thumb-compare-mode").click(showThumbNav);  
  $("a.list-compare-mode").click(showListNav);  
  //$("a.tree-compare-mode").click(showTreeNav);

  // configure the Browse/Compare/Image mode elements
  
  var browseModeElements = $('.browse-mode:not(a)');
  var compareModeElements = $('.compare-mode:not(a)');
  var imageModeElements = $('.image-mode:not(a)');
  var allWitnessesLink = $("a.all-witnesses");
  browseModeElements.hide();
  compareModeElements.hide();
  allWitnessesLink.hide();

  

  //create functions for showing each mode

  var showBrowseMode = function() {
    browseModeElements.show();    
    compareModeElements.hide();    
    imageModeElements.hide();
    allWitnessesLink.hide();
    $('#witness-navigation ul').each(function() {
      highlightSelectedWitnesses($(this));
    });
  };
    
  var showCompareMode = function() {
    browseModeElements.hide();    
    compareModeElements.show();
    imageModeElements.hide();
    allWitnessesLink.show();
    $('#witness-navigation ul').each(function() {
      highlightSelectedWitnesses($(this));
    });
  };  

  var showImageMode = function() {
    browseModeElements.hide();
    compareModeElements.hide();
    imageModeElements.show();
  };  
    
  // configure the buttons for each mode to show/hide the appropriate mode elements
  
  $("a.browse-mode").click(showBrowseMode); 
  $("a.compare-mode").click(showCompareMode);
  $("a.image-mode").click(showImageMode);

  // configure the witness Menus
    
  // List Witness Menu 
  var listMenu = $('#list-witness-menu'); 
  //listMenu.addClass("jcarousel-skin-basic");
 /* listMenu.jcarousel({
    itemFallbackDimension : 30,
    start                 : $('#list-witness-menu li.active').index(),
    vertical              : true
  });
  // hack to get the carousel list to display properly:
  listMenu.css("height", "10000px");
  //set the width of our jcarousel to the width of the window - spacing and left nav
  //$('.jcarousel-container-vertical').width($(window).width() -300);
  $('.jcarousel-container-vertical').height($(window).height() -300);
*/

  // Thumb Witness Menu 
   
  var thumbMenu = $('#thumb-witness-menu');
  //thumbMenu.addClass("jcarousel-skin-basic");
/*  thumbMenu.jcarousel({
    itemFallbackDimension : 180,//
    start                 : $('#thumb-witness-menu li.active').index(),
    vertical              : true
  });
  // hack to get the carousel list to display properly:
  thumbMenu.css("height", "10000px");
  //set the width of our jcarousel to the width of the window - spacing and left nav
 // $('.jcarousel-container-horizontal').width($(window).width() -340);
  
  $('.jcarousel-container-vertical').height($(window).height() -300);
*/  

  // Tree Witness Menu  

  var hotspots = [];
  // create a hotspot for each link in #witness-navigation-witness-list
  //  { name    : 'tabby-kitty',
  //  image    : 'images/tabby_on.jpg',
  //    top     : 35,
  //    left    : 212,
  //    width   : 428,
  //    height  : 390,
  //    onClick : function(e) {
  //		alert('clicked ' + e.data.hotspot.attr('rel')); 
  //	}
  //    // OR:
  //    // onClick : 'http://google.com'
  //  }
  $("#witness-navigation-menu li a").each(function(){
    var classes = $(this).attr("class");
    var witness = witnessForAnchor(this);
    hotspots.push({
	  name    : $(this).text(),
	  image    : 'tree-nav-highlight.png',
	  // multiply each of the following by 1 to convert to Number
	  top     : 1*classes.substring(classes.indexOf("t-") + 2, classes.indexOf("px", classes.indexOf("t-"))),
	  left    : 1*classes.substring(classes.indexOf("l-") + 2, classes.indexOf("px", classes.indexOf("l-"))),
	  width   : 1*classes.substring(classes.indexOf("w-") + 2, classes.indexOf("px", classes.indexOf("w-"))),
	  height  : 1*classes.substring(classes.indexOf("h-") + 2, classes.indexOf("px", classes.indexOf("h-"))),
	  onClick : function(e) {
	    selectWitness(witness);
	    }
    });
  });
  var imageMapImage = $("#witness-navigation-tree");
  $("#witness-navigation-tree").remove();
  imageMapImage.appendTo($('#tree-nav'));
  $('#tree-nav').wunderkind({
	height : $("#witness-navigation-tree").attr("height"),
    width : $("#witness-navigation-tree").attr("width"),
    hotspots : hotspots
  });
  
  // 
  
  // apply radio-button like selection to our tab navigation controls
  
  $('#mode-navigation a').each(function() {
    $(this).click(radioTypeSelect);
  });
  $('#mode-sub-navigation a').each(function() {
    $(this).click(radioTypeSelect);
  });

  // whenever a witness link  is clicked, call
  
  $('#witness-navigation a').each(function() {
    $(this).click(function() {
      highlightSelectedWitnesses($(this).parents('ul'));
      // add handlers to the manuscript panels
      $('#manuscripts .mssPanel').each(function(){
        addEventHandlersToPanel(this);
      });
    });
  });

  // add handlers to the manuscript panels
  $('#manuscripts .mssPanel').each(function(){
    addEventHandlersToPanel(this);
  });

  // show whichever elements belongs to the active mode link

  if ($("a.browse-mode").parent().hasClass("active")) {
    showBrowseMode();
  } 
  else if ($("a.compare-mode").parent().hasClass("active")) {
    showCompareMode();
  } 
  else if ($("a.image-mode").parent().hasClass("active")) {
    showImageMode();
  } 
  
  // show whichever menu belongs to the active browse mode link

  if ($("a.list-browse-mode").parent().hasClass("active")) {
    showListNav();
  } 
  else if ($("a.thumb-browse-mode").parent().hasClass("active")) {
    showThumbNav();
  } 
//  else if ($("a.tree-browse-mode").parent().hasClass("active")) {
//    showTreeNav();
//  } 

  // show whichever menu belongs to the active compare mode link

  if ($("a.list-compare-mode").parent().hasClass("active")) {
    showListNav();
  } 
  else if ($("a.thumb-compare-mode").parent().hasClass("active")) {
    showThumbNav();
  } 
// else if ($("a.tree-compare-mode").parent().hasClass("active")) {
//    showTreeNav();
//  } 
  
  // Hide the new version button because our
  // our nav menus make it redundant
  // Important: hide the button, but DO NOT Delete as it is used
  // by closePanel() and breaks that function.
  $('#newPanel').hide();

  // force us to start with a single witness NOTE: we have to do it here
  // and then re-highlightSelectedWitnesses so that the image
  // panel can position itself correctly.
  singleWitness();
  $('#witness-navigation ul').each(function() {
     highlightSelectedWitnesses($(this));
  });
  
});


