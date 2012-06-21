/**
 * Get last the word we watching now. Will be implemented in the next way:
 * from the current marker in the text area until a white space or a new row.
 */
function inline_devel_get_last_word(element_id) {
  var elem = document.getElementById(""+ element_id + "");

  var cursor = elem.selectionStart;
  var value = (jQuery)("#" + element_id).val();

  var strlen = value.length;
  var word = '';
  for (var i = 0; i <= value.length; i++) {
    var chr = value.charAt((cursor-1)-i);

    if (chr == ' ' || chr == '(' || chr == "\n") {
      break;
    }

    word += chr;
  }

  console.log(word.split("").reverse().join(""));
}

/**
 * Inserting a functin/class/interface name propperyly in the next way:
 *
 * From the current marker in the textarea, delete amount of charecter acording
 * to the last word charecter number.
 */
function inline_devel_insert_element_propperly() {
// later.
}

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
