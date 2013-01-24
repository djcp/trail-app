$.fn.showProgress = function(){
};

$.fn.hideProgress = function(){
};

$.fn.populateTrailList = function(data, successCode, jqXHR){
  $(data).each(function(i, trail){
    if(trail.url.match(/.+\.json$/)){
      $().getTrail(trail.html_url);
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
        $('<li />').append($('<a target="_blank" />').attr('href', resource.uri).text(resource.title))
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
      $(output).append($('<li />').text(validation));
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
          $("<h3 class='step_header' />").text(step.name),
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
  var trail_content = $("<div class='trail'/>");
  $(trail_content).append(
    $("<h2/>").text(trail.name),
    $().trailPrerequisitesTemplate(trail),
    $("<div class='description'>").text(trail.description),
    $("<div class='content'/>").append(
      $().renderSteps(trail)
    )
  );
  return trail_content;
}

$.fn.initTrail = function(data){
  $(data).each(function(i, trail){
    $('#trail_container').append(
      $().trailTemplate(trail)
    );
  });
}

$.fn.getTrail = function(trail_url){
  var raw_url = $().rawifyUrl(trail_url);
  chrome.storage.local.get(raw_url, function(data){
    if( Object.keys(data).length == 0){
      $.ajax({
        url: raw_url,
        dataType: 'json',
        success: function(data, successCode, jqXHR){
          $().initTrail(data);
          var toStore = {};
          toStore[raw_url] = data;
          chrome.storage.local.set(toStore, function(){});
        }
      })
    } else {
      $().initTrail(data[raw_url]);
    }
  })
};

$.fn.getTrailUrls = function(){
  var trailListUrl = 'https://api.github.com/repos/thoughtbot/trail-map/contents/trails';

  chrome.storage.local.get(trailListUrl, function(data){
    if( Object.keys(data).length == 0 ){
      $.ajax({
        url: trailListUrl,
        success: function(data, successCode, jqXHR){
          $().populateTrailList(data, successCode, jqXHR)
          var toStore = {};
          toStore[trailListUrl] = data;
          chrome.storage.local.set(toStore, function(){});
        }
      })
    } else {
      $().populateTrailList( data[trailListUrl] );
    }
  });

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
