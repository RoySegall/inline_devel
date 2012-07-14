(function ($) {
//-----------------------------------------------
//  API area
//-----------------------------------------------

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
 * Short function name that will print console.log.
 */
function log(word) {
  console.log(word);
}

/**
 * Check for special chars that can split sentence for words.
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
 *    The DOM element id.
 */
function inline_devel_get_last_word(element_id, keyNumber) {
  // Define variables.
  var data = _inline_devel_textarea_helper(element_id);

  var elem = data.elem;
  var cursor = data.cursor;
  var value = data.value;
  var key_start = key_end = 0;
  var word = '';

  // Get the string that the string end in.
  for (var i = cursor; i <= value.length; i++) {
    var chr = value.charAt(i+1);

    if (inline_devel_speical_chars(chr)) {
      key_end = i;
      break;
    }
  }

  // Get the key the string start in.
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
    // Check the direction of the cursor - depends on it, we decide which key
    // the return.
    var key = keyNumber == 39 ? 1 : 0;

    return word.split(" ")[key];
  }

  // Return the current word.
  return word;
}

/**
 * Inserting a function/class/interface name properly in the next way:
 *
 * From the current marker in the textarea, delete amount of character according
 * to the last word character number.
 *
 *  @param element_id
 *    The DOM element id.
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

  // Put the cursor in the after the string we put into the textarea.
  data.elem.selectionStart = data.elem.selectionEnd = start + word.length + 1;
}

/**
 * Close the window that show the available functions/classes/interfaces/hooks.
 */
function inline_devel_close_suggestor() {
  $("#suggestion").html('');
  $("#suggestion").hide();
}

//-----------------------------------------------
//  Events handling.
//-----------------------------------------------

// Hide the suggestor when there no letters.
setInterval(function() {
  if ($("#edit-code").val() != null && $("#edit-code").val().length == 0) {
    inline_devel_close_suggestor();
  }
}, 1);

// The core of the inline devel js functionality area.
Drupal.behaviors.functionLoad = {
  attach: function() {

    // Save the elements to variables.
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

      // The functions is revealed to the user. When scrolling down with the
      // keyboard need to keep the the courser in the same place for replacing
      // words properly.
      if ((keyNumber == 38 || keyNumber == 40) && availableFunctionNumber > 0) {
        keyPressed.preventDefault();
      }

      if ((keyNumber >= 38 || keyNumber.which <= 40)) {
        currentFunction = $("#suggestion .selected-function").index();
        if (keyNumber == 38) {
            $("#suggestion .function").removeClass('selected-function');
            $("#suggestion .function:nth-child(" + (currentFunction) + ")").addClass('selected-function');

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
          $("#suggestion .function:nth-child(" + (currentFunction + 2) + ")").addClass('selected-function');

          // Boundaries of the scope.
          if (currentFunction > availableFunctionNumber) {
            currentFunction = 0;
          }
          else {
            currentFunction++;
          }
        }
      }

      // Check if we have only one function - if so, when clicking enter the
      // function will throw to the function.
      if (availableFunctionNumber == 1) {
        var divElement = $("#suggestion div");
      }
      else {
        var divElement = selectedDiv;
      }

      if (keyNumber == 13 && divElement.html()) {

        // Insert data properly.
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

      // Hide the functions name area because there is no text.
      if (textarea.val().length == 0) {
        functionsName.removeClass('bordered');
        functionsName.hide();
        return;
      }

      // Start checking from the server the available functions name.
      var keyword = inline_devel_get_last_word('edit-code');

      $.getJSON('?q=devel/php/inline_devel/' + keyword, function(data) {
        var items = [];
        haveFunction = true;
        currentFunction = 0;

        // Show the functions name area and add class.
        functionsName.show().addClass('bordered');

        // Build the array of function to divs.
        $.each(data, function(key, val) {
          items.push("<div class='function' name='"+ val.name + "' id='" + val.id + "'>" + val.name + ' (' + val.type + ')</div>');
        });

        // Insert the html.
        functionsName.html(items.join(''));

        prevSearch = textarea.val();
      });
    });
  }
}

/**
 * Handling all sort of .live method.
 *
 * When use it? when doing a js functions on events that was added after page
 * was loaded.
 *
 * I used it so i won't need to put inline js function like:
 *   <tag onmouseover="functoin();">text</tag>
 */
Drupal.behaviors.liveEvents = {
  attach: function() {

    // Handling when clicking on function.
    $("#suggestion .function").live("click", function(event) {
      var id = (event).srcElement.id;
      // Insert data propperly.
      inline_devel_insert_element_propperly('edit-code', inline_devel_get_last_word('edit-code'), $("#suggestion .function#" + id).attr('name'));

      // Don't break row.
      $("#suggestion .function").removeClass('selected-function');

      inline_devel_close_suggestor();
    });

    // Handling when hovering above function.
    $("#suggestion .function").live("hover", function(event) {
      var id = (event).srcElement.id;
      $("#suggestion .function").removeClass('selected-function');
      $("#suggestion .function#" + id).addClass('selected-function');
    });
  }
}

// Keyboard events handling.
Drupal.behaviors.keyBoardEvents = {
  attach: function() {

    $(document).keydown(function(event) {
      // ESC button for closing the suggestor at any time.
      if (event.which == 27) {
        inline_devel_close_suggestor();
      }

      // Ctrl + s handling
      if (event.ctrlKey && event.which == 83) {
        $("#devel-execute-form").submit();
        event.preventDefault();
      }
    });
  }
}

})(jQuery);
