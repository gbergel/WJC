$(document).ready(function() {

  var $critapp = $('<div class="critical-apparatus"></div>');
  var $selected;
  
  var witnessForApparatus = function(app) {
    return witness;
  };
  
  var highlightCurrentWitnessInApparatus = function(app, witnessListSelector) {
  	console.log("foo");
    var $appWitnesses =  $(app).find(witnessListSelector);
    var $witnessSelectMenu = $(app).closest(".mssPanel").find("select.witnessMenu");
    var currentWitness = $witnessSelectMenu.children("option:selected").val();
    // remove the current class from all lines and witnesses
    $appWitnesses.removeClass("current");
    $(app).find('li').removeClass("current");
    // iterate through the witnesses looking for the current one
  	for (var j = 0; j < $appWitnesses.length; j++) {
  		if ($appWitnesses[j] != undefined) {      	  
      	if ($($appWitnesses[j]).hasClass(currentWitness)) {
	      	$($appWitnesses[j]).closest('li').addClass("current");
	      	$($appWitnesses[j]).addClass("current");
      	}
    	}
  	}
  	$witnessSelectMenu.unbind("change", function(){highlightCurrentWitnessInApparatus(app, witnessListSelector);});
    // bind the handler to the change event
    $witnessSelectMenu.bind("change", function(){highlightCurrentWitnessInApparatus(app, witnessListSelector);});

  }
  
  $.fn.removeApp = function() {
    $(".critical-apparatus").empty();
    $(".critical-apparatus").remove();
    if ($selected) {
      $selected.removeClass("selected");
      $selected.parent().find('.linebreak').show();  	  
    }
  }
    
  $.fn.getApp = function(id) {
  
    $(".critical-apparatus").empty();
    $(".critical-apparatus").remove();
    $(".critical-apparatus").siblings(".selected").each().removeClass("selected");
    if (!$(this).hasClass("selected")) {
      if ($selected) {
        $selected.removeClass("selected");
        $selected.parent().find('.linebreak').show();  	  
      }
      $selected = $(this);
  	  $selected.addClass("selected");
      $(this).parent().after($critapp);
      $critapp.removeClass("critical-apparatus-line");
      $(this).parent().find('.linebreak').hide();
      $critapp.load('../WJC/WJC-critapp.html #'+id, function() {
				highlightCurrentWitnessInApparatus(this, ".sigil");
      });
    }
    else {
      $(this).removeClass("selected");
      $(this).parent().find('.linebreak').show();
    }
  };

  $.fn.getLine = function(id) {

		$(".critical-apparatus").empty();
		$(".critical-apparatus").remove();
    $(".critical-apparatus").siblings(".selected").each().removeClass("selected");
    if (!$(this).parent().hasClass("selected")) {
      if ($selected) {
        $selected.removeClass("selected");
        $selected.parent().find('.linebreak').show();  	  
      }
  	  $selected = $(this).parent();
  	  $selected.addClass("selected");

      $(this).parent().after($critapp);
      $critapp.addClass("critical-apparatus-line");
      $critapp.load('../WJC/WJC-app.html #'+id, function() {
				highlightCurrentWitnessInApparatus(this, ".sigil");
      });
       $(this).parent().find('.linebreak').hide();
    }
    else {
      $(this).parent().removeClass("selected")
      $(this).parent().find('.linebreak').show();
    }
  };

});