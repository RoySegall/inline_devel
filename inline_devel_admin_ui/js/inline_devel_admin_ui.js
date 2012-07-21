/**
 * @file
 * Show and hide the tabs number when the option is enable/disable.
 */
(function ($) {
  Drupal.behaviors.functionLoad = {
    attach: function(context, settings) {

      // Check what the current value and act as well.
      if (settings.inline_devel.spaces_instead_of_tabs) {
        $("#number_of_spaces").show();
      }
      else {
        $("#number_of_spaces").hide();
      }

      // Show/hide the tabs number with nice jQuery effect.
      var spaces_instead_of_tabs = $("#edit-spaces-instead-of-tabs");
      $("#edit-spaces-instead-of-tabs").change(function() {
        if ($(this).is(':checked')) {
          $("#number_of_spaces").show('slow');
        }
        else {
          $("#number_of_spaces").hide('slow');
        }
      });
    }
  }
})(jQuery);
