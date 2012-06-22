/**
 * Return data about the text area we manipulating.
 */
function _inline_devel_textarea_helper(element_id) {
  var elem = document.getElementById(""+ element_id + "");

  var cursor = elem.selectionStart;
  var value = (jQuery)("#" + element_id).val();

  return data = {
    cursor: cursor,
    value: value,
    elem: elem
  };
}

/**
 * Get last the word we watching now. Will be implemented in the next way:
 * from the current marker in the text area until a white space or a new row.
 *
 *  @param element_id
 *    The dom element id.
 */
function inline_devel_get_last_word(element_id) {
  // Define vars.
  var data = _inline_devel_textarea_helper(element_id);
  var elem = data.elem;
  var cursor = data.cursor;
  var value = data.value;
  var strlen = value.length;
  var word = '';

  // Start with the scripting.
  for (var i = 0; i <= value.length; i++) {
    var chr = value.charAt((cursor-1)-i);

    // List of chars that after them a noraml person is typing a new function name.
    if (chr == ' ' || chr == '(' || chr == ')' || chr == ';' || chr == "\n" || chr == '\t' || chr == '\r') {
      break;
    }

    word += chr;
  }

  // I got a flip word, let's flip again.
  word = word.split("").reverse().join("");

  return word;
}

/**
 * Inserting a functin/class/interface name propperyly in the next way:
 *
 * From the current marker in the textarea, delete amount of charecter acording
 * to the last word charecter number.
 *
 *  @param element_id
 *    The dom element id.
 *
 *  @param last_word
 *    The last word that we are standing on.
 *
 *  @param word
 *    The word we need to insert.
 */
function inline_devel_insert_element_propperly(element_id, last_word, word) {
  var data = _inline_devel_textarea_helper();
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
      var keyword = inline_devel_get_last_word('edit-code');

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
