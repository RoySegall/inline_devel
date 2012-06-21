(function ($) {


// Placeholders link in query log.
Drupal.behaviors.functionLoad = {
  attach: function() {

    // Save the elemnts to variables.
    var textarea = $("#edit-code");
    var functionsName = $("#suggestion");
    var haveFunction = false;
    var prevSearch = '';
    var currentFunction = 1;

    // Each key press.
    textarea.keyup(function(keyPressed) {

      var keyNumber = keyPressed.which;

      if ((keyNumber >= 38 || keyNumber.which <= 40)) {

        if (currentFunction < 1) {
          currentFunction = 1;
        }

        if (keyNumber == 38) {
            $("#suggestion .function").removeClass('selected-function');
            $("#suggestion .function:nth-child(" + (currentFunction - 1) + ")").addClass('selected-function');
            currentFunction--;
        }
        else {
          $("#suggestion .function").removeClass('selected-function');
          $("#suggestion .function:nth-child(" + (currentFunction + 1) + ")").addClass('selected-function');
          currentFunction++;
        }
      }

     var selectedDiv = $("#suggestion .selected-function");
      if (keyNumber == 13 && selectedDiv.html()) {
        textarea.val(selectedDiv.attr('name'));
        functionsName.hide();
        return;
      }

      if (prevSearch == textarea.val()) {
        return;
      }

      // Hide the functions name area becuase there is no text.
      if (textarea.val().length == 0) {
        functionsName.removeClass('bordered');
        functionsName.hide();
        return;
      }

      // Start checking from the server the availble functions name.
      var keyword = textarea.val().split("\n").slice(-1)[0].split(" ").slice(-1)[0];

      $.getJSON('php/inline_devel/' + keyword, function(data) {
        var items = [];
        haveFunction = true;
        currentFunction = 0;

        // Show the functions name area and add class.
        functionsName.show().addClass('bordered');

        // There is only '...' available? hide the suggestion list.
        if (data.length == 1) {
          functionsName.hide();
        }

        // Build the array of function to divs.
        $.each(data, function(key, val) {
          items.push("<div class='function' name='"+ val.name + "'>" + val.name + ' (' + val.type + ')</div>');
        });

        // Insert the html.
        functionsName.html(items.join(''));

        prevSearch = textarea.val();
      });
    });
  }
}

})(jQuery);
