(function ($) {

/**
 * Return data about the text area we manipulating.
 */
function _inline_devel_textarea_helper(element_id) {
  var elem = document.getElementById(""+ element_id + "");

  var cursor = elem.selectionEnd;
  var value = $("#" + element_id).val();

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
 * Check for speical chars that can split sentence for words.
 */
function inline_devel_speical_chars(chr) {
  if (chr == '' || chr == ' ' || chr == '(' || chr == ')' || chr == ';' || chr == "\n" || chr == "\t" || chr == "\r") {
    return true;
  }
  else {
    return false;
  }
}

/**
 * Get last the word we watching now. Will be implemented in the next way:
 * from the current marker in the text area until a white space or a new row.
 *
 *  @param element_id
 *    The dom element id.
 */
function inline_devel_get_last_word(element_id, keyNumber) {
  // Define vars.
  var data = _inline_devel_textarea_helper(element_id);

  var elem = data.elem;
  var cursor = data.cursor;
  var value = data.value;
  var key_start = key_end = 0;
  var word = '';

  // Get the key the string start in.
  for (var i = cursor; i <= value.length; i++) {
    var chr = value.charAt(i+1);

    if (inline_devel_speical_chars(chr)) {
      key_end = i;
      break;
    }
  }

  // Get the string that the string end in.
  for (var i = cursor; i >= 0; i--) {
    var chr = value.charAt(i-1);

    if (inline_devel_speical_chars(chr)) {
      key_start = i;
      break;
    }
  }

  // Building string, the function substr wasn't worked here.
  for (i = key_start; i <= key_end; i++) {
    word += value.charAt(i);
  }

  // Check if the word we got contain white species. If so need to check
  if (word.indexOf(" ") != -1) {
    // Check the direction of the cursor - depends on it, we decide whick key
    // the return.
    var key = keyNumber == 39 ? 1 : 0;

    return word.split(" ")[key];
  }

  // Return the current word.
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
  var data = _inline_devel_textarea_helper(element_id);

  var start = data.cursor - last_word.length;
  var end = data.cursor;

  $("#" + element_id).val(data.value.slice(0, start) + word + "(" + data.value.slice(end));
}

// Placeholders link in query log.
Drupal.behaviors.functionLoad = {
  attach: function() {

    // Save the elemnts to variables.
    var textarea = $("#edit-code");
    var functionsName = $("#suggestion");
    var haveFunction = false;
    var prevSearch = '';
    var currentFunction = 0;

    // Each key press.
    textarea.keydown(function(keyPressed) {

      var keyNumber = keyPressed.which;
      var selectedDiv = $("#suggestion .selected-function");
      var availableFunctionNumber = $("#suggestion div.function").length;

      inline_devel_get_last_word('edit-code', keyNumber);

      // The functions is revealed to the user. When scroling down with the
      // keyboard need to keep the the courser in the same place for replacing
      // words propperly.
      if ((keyNumber == 38 || keyNumber == 40) && availableFunctionNumber > 0) {
        keyPressed.preventDefault();
      }

      if ((keyNumber >= 38 || keyNumber.which <= 40)) {
        if (keyNumber == 38) {
            $("#suggestion .function").removeClass('selected-function');
            $("#suggestion .function:nth-child(" + (currentFunction - 1) + ")").addClass('selected-function');

          // Boundaries of the scope.
          if (currentFunction <= 2) {
            currentFunction = 0;
          }
          else {
            currentFunction--;
          }
        }
        else {
          $("#suggestion .function").removeClass('selected-function');
          $("#suggestion .function:nth-child(" + (currentFunction + 1) + ")").addClass('selected-function');

          // Boundaries of the scope.
          if (currentFunction > availableFunctionNumber) {
            currentFunction = 0;
          }
          else {
            currentFunction++;
          }
        }
      }

      // Check if we have only one functoin - if so, when clicking enter the funcction
      // will throw to the function.
      if (availableFunctionNumber == 1) {
        var divElement = $("#suggestion div");
      }
      else {
        var divElement = selectedDiv;
      }

      if (keyNumber == 13 && divElement.html()) {

        // Insert data propperly.
        inline_devel_insert_element_propperly('edit-code', inline_devel_get_last_word('edit-code'), divElement.attr('name'));

        // Don't break row.
        keyPressed.preventDefault();
        $("#suggestion .function").removeClass('selected-function');

        functionsName.html('');
        functionsName.hide();
        return;
      }

      // When browsing in function, don't continue to the next steps.
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
