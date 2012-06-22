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
 * Short functio name that will print console.log.
 */
function log(word) {
  console.log(word);
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

    var elem = document.getElementById(""+ element_id + "");

  var cursor = elem.selectionEnd;
  var value = jQuery("#" + element_id).val();

  var strlen = value.length;
  var word = '';


  // Start with the scripting.
  for (var i = 0; i <= value.length; i++) {
    var chr = value.charAt((cursor-1)-i);

    // List of chars that after them a noraml person is typing a new function name.
    if (chr == ' ' || chr == '(' || chr == ')' || chr == ';' || chr == "\n" || chr == '\t' || chr == '\r') {
      continue;
    }

    word += chr;
  }

  // We got a empth word, go back in the cahrs until we find a char and build a
  // new last word. First - find out the index that hold the a char.

  // I got a flip word, let's flip again.
  return word.split("").reverse().join("");
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
  var data = _inline_devel_textarea_helper(element_id);

  var start = data.cursor - last_word.length;
  var end = data.cursor;

  (jQuery)("#" + element_id).val(data.value.slice(0, start) + word + data.value.slice(end));
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
    textarea.keydown(function(keyPressed) {

      var keyNumber = keyPressed.which;
      var selectedDiv = $("#suggestion");

      // The functions is revealed to the user. When scroling down with the
      // keyboard need to keep the the courser in the same place for replacing
      // words propperly. Work in progress.
      if ((keyNumber == 38 || keyNumber.which == 40) && selectedDiv.html()) {
        // keyPressed.preventDefault();
      }

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

      var data = _inline_devel_textarea_helper('edit-code');

      if (keyNumber == 13 && selectedDiv.html()) {

        // Insert data propperly.
        inline_devel_insert_element_propperly('edit-code', inline_devel_get_last_word('edit-code'), selectedDiv.find('.selected-function').attr('name'));

        // Don't break row.
        keyPressed.preventDefault();
        $("#suggestion .function").removeClass('selected-function');

        // textarea.val(selectedDiv.attr('name'));
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
