$.fn.fromCache = function(url){
  return false;
};

$.fn.showProgress = function(){
};

$.fn.hideProgress = function(){
};

$.fn.populateTrailList = function(data, successCode, jqXHR){
  $(data).each(function(i, trail){
    if(trail.url.match(/.+\.json$/)){
      $().renderTrail(trail.html_url);
    }
  });
};

$.fn.rawifyUrl = function(url){
  var raw_url = url.replace(/trail-map\/blob/,'trail-map');
  raw_url = raw_url.replace(/github\.com/,'raw.github.com');
  return raw_url;
}

$.fn.trailPrerequisitesTemplate = function(trail){
  if('prerequisites' in trail){
    return $("<div class='prerequisites'><span>Prerequisites:</span> ").append(trail.prerequisites.join(' , '))
  }
}

$.fn.renderStepResources = function(step){
  if('resources' in step){
    var output = $('<ul />');
    $.each(step.resources, function(i,resource){
      $(output).append(
        $('<li />').append($('<a target="_blank" />').attr('href', resource.uri).html(resource.title)) 
      );
    })
    return output;
  }
  return '';
}

$.fn.renderStepValidations = function(step){
  if('validations' in step){
    var header = "<h4>You should be able to:</h4>";
    var output = $('<ul class="validations" />');
    $.each(step.validations, function(i, validation){
      $(output).append($('<li/>').html(validation));
    });
    return  [header , output];
  }
  return '';
}

$.fn.renderSteps = function(trail){
  if('steps' in trail){
    var output = $("<div class='steps' />");
    $.each(trail.steps, function(i, step){
      $(output).append(
        $('<div class="step" />').append(
          $("<h3 class='step_header' />").html(step.name),
          $('<div class="step_content" style="display: none;" />').append(
            $.fn.renderStepResources(step),
            $.fn.renderStepValidations(step)
          )
        )
      )
    });
    return output;
  }
}

$.fn.trailTemplate = function(trail){
  console.log(trail);
  var trail_content = $("<div class='trail'/>");
  $(trail_content).append(
    $("<h2/>").html(trail.name),
    $().trailPrerequisitesTemplate(trail),
    $("<div class='description'>").html(trail.description),
    $("<div class='content'/>").append(
      $().renderSteps(trail)
    )
  );
  return trail_content;
}

$.fn.renderTrail = function(trail_url){
  var raw_url = $().rawifyUrl(trail_url);
  $.ajax({
    url: raw_url,
    dataType: 'json',
    success: function(data, successCode, jqXHR){
      $(data).each(function(i, trail){
        $('#trail_container').append(
          $().trailTemplate(trail)
        );
      });
    }
  })
};

$.fn.getTrailUrls = function(){
  var trailListUrl = 'https://api.github.com/repos/thoughtbot/trail-map/contents/trails';
/*  var fromCache = $().fromCache(trailListUrl);
  if(fromCache){
    $().populateTrailList(fromCache);
    return;
  }
  */

  $.ajax({
    url: trailListUrl,
    success: $().populateTrailList
  })

};



$(document).ready(
  function(){
    var trail_urls = $().getTrailUrls();
    $(document).on('click', '.step_header', function(e){
      e.preventDefault();
      $(this).next().slideToggle();
    });
  }
);
