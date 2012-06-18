(function ($) {


// Placeholders link in query log
Drupal.behaviors.functionLoad = {
  attach: function() {
    $("#edit-code").keyup(function() {

        $.getJSON('php/inline_devel/' + $("#edit-code").val(), function(data) {
          // .html(data);
          var items = [];

          $.each(data, function(key, val) {
            items.push('<li>' + val + '</li>');
          });

          $("#suggestion").html((items.join('')));
        });
    });
  }
}

})(jQuery);