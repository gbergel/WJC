$(document).ready(function() {


   // Set the Z-Index (used to display images on top while dragging)
   var zindexnr = 1;
   
   // boolean to check if the user is dragging
   var dragging = false;

  // clone the imageViewer for safe keeping
  var $imageViewerTemplate = $("#image-viewer").clone();
  
  var numeric = function(a,b){
    return (a-b);
  }

  var changeImage = function($target) {
    $target.find('img.image-viewer-image').attr('src','../images/monarchs/' + $target.find('.image-viewer-select-one').find('option:selected').val() + '/' + $target.find('.image-viewer-select-two').find('option:selected').val() + '.png');
  };

  var addImageViewer = function($target) {    
    // create the viewer
    var $imageViewer = $imageViewerTemplate.clone();
    // give it a unique Id
    var $imageViewers = $target.find(".image-viewer");
    $imageViewer.attr("id", "image-viewer-" + $imageViewers.length);
    // wire it up
    setupImageViewer($imageViewer);
    // add it to the target
    $target.append($imageViewer);  
    //position it  
    
    if ($imageViewers.length) {
      var targetPos = {top:0, left:0};//$target.position();
      var pos = {top:targetPos.top, left:targetPos.left};
      var topArray = new Array();
      var leftArray = new Array();
      $imageViewers.each(function() {
        topArray.push($(this).position().top);
        leftArray.push($(this).position().left);
      });
      topArray.sort(numeric);
      leftArray.sort(numeric);
      for (var i in topArray) {
        if (topArray[i] - pos.top < 30 && leftArray[i] - pos.left < 30) {
          pos.top = topArray[i] + 30;
          pos.left = leftArray[i] + 30;
        }
        else {
          break;
        }
      }
      $imageViewer.animate({left:pos.left + "px", top:pos.top + "px"}, 100);
      
    }
    var cssObj = {
      'z-index' : zindexnr,
      'position' : 'absolute'
    };
    $imageViewer.css(cssObj);    

  };
  
  var setupImageViewer = function($imageViewer) {
    // wire up the close button
    $imageViewer.find('.image-viewer-close').click(function(){
      $(this).parents(".image-viewer").remove();
    });
    // wire up the selects
    $imageViewer.find('.image-viewer-select-one').change(function(){changeImage($(this).parents(".image-viewer"));});
    $imageViewer.find('.image-viewer-select-two').change(function(){changeImage($(this).parents(".image-viewer"));});    
    // make it draggable
    $imageViewer.draggable({
      cursor: 'move',
      start: function(event, ui) {
         dragging = true;
      },
      stop: function(event, ui) {
         dragging = false;
      }
    });
    
    // put it on the top of the stack on mousedown
    $imageViewer.mousedown(function(){
      zindexnr++;
      cssObj = {
      'z-index' : zindexnr
      };
      $(this).css(cssObj);
    });
    // wire up the slider
    $imageViewer.find('.image-viewer-transparency-slider').slider({
      slide: function(event, ui) {
        $imageViewer.find(".image-viewer-image").animate({opacity:(1 - ui.value/100)}, 0);
              
      }
    });
   // set the default image   
    changeImage($imageViewer);
  }

  var removeImageViewers = function($target) { 
    $target.children(".image-viewer").remove();
    addImageViewer($("#light-table"));
  }   
  
  setupImageViewer($("#image-viewer"));

  $(".add-image-viewer").click(function(){
    addImageViewer($("#light-table"));  
  });

  $(".reset-image-viewers").click(function(){
    removeImageViewers($("#light-table"));  
  });

});