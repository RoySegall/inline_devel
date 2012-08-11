/**
 * @file
 * This is the js file for the Inline devel text decoder AKA IDTD.
 */

(function ($) {

//-----------------------------------------------
//  API area
//-----------------------------------------------

/**
 * Short function name that will print console.log.
 */
function log(word) {
  console.log(word);
}

/**
 * Return data about the text area we manipulating.
 */
function _inline_devel_textarea_helper(element_id) {

  var elem = document.getElementById(""+ element_id + "");
  var cursor = $("#" + element_id).getCursorPosition();
  var value = $("#" + element_id).val();

  return data = {
    cursor: cursor,
    value: value,
    elem: elem
  };
}

/**
 * Check for special chars that can split sentence for words.
 */
function inline_devel_speical_chars(charecter) {
  if (jQuery.inArray(charecter, $.speicalChars) >= 0) {
    return true;
  }
  else {
    return false;
  }
}

/**
 * Get the current line.
 *
 *  @param element_id
 *    The DOM element id.
 */
function inline_devel_get_current_line(element_id) {
  var data = _inline_devel_textarea_helper(element_id);

  var cursor = data.cursor;

  for (var i = cursor; i >= 0; i--) {
    if (data.value.charCodeAt(i) == 10 || data.value.charCodeAt(i) == NaN) {
      var key_start = i;
      break;
    }
  }

  if (key_start == undefined) {
    key_start = 0;
  }

  for (var i = cursor; i <= data.value.length; i++) {
    if (jQuery.inArray(data.value.charCodeAt(i), Array(NaN, "", "\n"))) {
      var key_end = i;
      break;
    }
  }

  if (key_end == undefined) {
    var key_end = data.value.length;
  }

  return data.value.substr(key_start, key_end);
}

/**
 * Get last the word we watching now. Will be implemented in the next way:
 * from the current marker in the text area until a white space or a new row.
 *
 *  @param element_id
 *    The DOM element id.
 */
function inline_devel_get_last_word(element_id) {
  // Define variables.
  var data = _inline_devel_textarea_helper(element_id);

  var elem = data.elem;
  var cursor = data.cursor;
  var value = inline_devel_get_current_line(element_id);

  var word = '';

  for (var i = cursor; i >= 0; i--) {
    if (inline_devel_speical_chars(value.charAt(i))) {
      var key_start = i;
      break;
    }
  }

  if (key_start == undefined) {
    key_start = 0;
  }

  for (var i = cursor; i <= value.length; i++) {
    if (inline_devel_speical_chars(value.charAt(i))) {
      var key_end = i;
      break;
    }
  }

  if (key_end == undefined) {
    var key_end = value.length;
  }

  // Incase we got on of the spcial chars in the word - remove it.
  var word = value.substr(key_start, key_end);

  for (i = 0; i < $.speicalChars.length; i++) {
    word = word.replace($.speicalChars[i], '');
  }

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
 *
 *  @param type
 *    The type of the element we inserting: function, class iterface or hook.
 */
function inline_devel_insert_element_propperly(element_id, last_word, word, type) {
  var data = _inline_devel_textarea_helper(element_id);

  var start = data.cursor - last_word.length;
  var end = data.cursor;

  if (jQuery.inArray(type, Array('interface', 'variable')) != -1) {
    var chr = '';
    var bck = 0;
  }
  else if (type == 'class_function' ) {
    var variable = last_word.split('->')[0];
    word = variable + '->' + word + '()';
    chr = '';
    bck = 0;
  }
  else {
   var chr = '()';
   var bck = 1;
  }

  $("#" + element_id).val(data.value.slice(0, start) + word + chr + data.value.slice(end));

  // Put the cursor in the after the string we put into the textarea.
  data.elem.selectionStart = data.elem.selectionEnd = start + word.length + 2 - bck;
}

/**
 * suggestor - The window that show the available functions/classes/interfaces
 *  or hooks.
 *
 * Close the suggestor.
 */
function inline_devel_close_suggestor() {
  $("#suggestion").html('');
  $("#suggestion").hide();
}

/**
 * Get the position of a selected function inside the overflow div.
 */
function inline_devel_get_position_in_overflow() {
  var functionHeight = $("#suggestion").attr("scrollHeight");
  var elementsNumber = $("#suggestion div.function").length;
  var currentlocation = $("#suggestion .selected-function").index();
  var ratio = functionHeight/elementsNumber;

  // Reset.
  if (currentlocation <= 0) {
    currentlocation = 1;
  }

  // How much padding we need for the scroller when scrolling up and down.
  if ($.keyNumber == 38) {
    var scrollerMarginTop = 150;
  }
  else {
    var scrollerMarginTop = 75;
  }

  // Set the scroller location near to the selected function.
  $("#suggestion").scrollTop((ratio * currentlocation) - scrollerMarginTop);
}

/**
 * Don't auto complete when there are reserved words.
 *
 *  @param element_id
 *    The DOM element id.
 */
function inline_devel_break_on_reserved(element_id) {
  var line = inline_devel_get_current_line(element_id);

  // Reserved words - after them auto complete will no be available.
  var reserved = Array(
    'abstract', 'and', 'as', 'break', 'case', 'catch', 'clone',
    'const', 'continue', 'declare', 'default', 'do', 'else', 'enddeclare',
    'endfor', 'endforeach', 'endif', 'endswitch', 'endwhile', 'final',
    'global', 'goto', 'implements', 'include', 'include_once',
    'instanceof', 'insteadof', 'interface', 'namespace', 'new', 'or',
    'private', 'protected', 'public', 'require', 'require_once', 'static',
    'var', 'throw', 'trait', 'try', 'unset', 'use', 'var', 'xor'
  );

  var smart_split = line.split(/\s/g);

  $.each(smart_split, function(key, value) {
    if(jQuery.inArray(value, reserved) > -1) {
      return 0;
    }
  });

  for (var i = 0; i < reserved.length; i++) {
    if (line.indexOf(reserved[i], 0) == 0) {
      return 0;
    }
  }
}

/**
 * Return an item push that will be used when displaying the suggeestor.
 *
 *  @param val
 *    An object that contain the parsed data for generation a propper div
 *    inside the suggestor.
 */
function inline_devel_generate_item_push(val) {
  return "<div class='function' name='" + val.name + "' id='" + val.id + "' type='" + val.type + "'>" + val.name + " (" + val.type + ")</div>";
}

function inline_devel_return_classes() {
  // Breaking the rows.
  var rows = $('#edit-code').val().split("\n");
  var classes = new Array();

  $.each(rows, function(key, value) {
    if (value.indexOf('new') != -1) {
      var splited = value.split(/\s/g);
      classes[key] = new Array(splited[0], splited[3].replace('()', ''));
    }
  });

  return classes;
}

//-----------------------------------------------
//  Every second functionality.
//-----------------------------------------------

// Hide the suggestor when there no letters or no functions.
setInterval(function() {
  if (($("#edit-code").val() != null && $("#edit-code").val().length == 0) || $("#suggestion div.function").length == 0) {
    inline_devel_close_suggestor();
    $(".suggestion-wrapper").removeClass('border-up');
  }
}, 1);

//-----------------------------------------------
//  Events handling.
//-----------------------------------------------

// The core of the inline devel js functionality area.
Drupal.behaviors.functionLoad = {
  attach: function() {

    // Save the elements to variables.
    var textarea = $("#edit-code");
    var functionsName = $("#suggestion");
    var haveFunction = false;
    var prevSearch = '';
    var currentFunction = 0;

    // Dividing to two separate keyboard events for two reasons:
    // 1. Keyup detect immediately keypress but not handle with preventDefault
    // 2. Functions that worked well under keydown not working as weel under
    //    keyup event.
    textarea.keyup(function(event) {
      // When browsing in function, don't continue to the next steps.
      if (prevSearch == textarea.val()) {
        return;
      }

      // Start checking from the server the available functions name.
      var keyword = inline_devel_get_last_word('edit-code');
      var address = '?q=devel/php/inline_devel/' + keyword;

      // Check if we need to search in classes.
      if (keyword.indexOf('->') != -1) {
        var variable = keyword.split('->')[0].replace(/^\s+|\s+$/g,"");
        $.each(inline_devel_return_classes(), function(key, value) {
          if (value[0] == variable) {
            var class_name = value[1].replace(';',"").replace('()',"");

            address = '?q=devel/php/inline_devel/get_classes/' + keyword.split('->')[1].replace(/^\s+|\s+$/g,"") + '/' + class_name;
            return true;
          }
        });
      }

      $.getJSON(address, function(data) {
        var items = [];
        haveFunction = true;
        currentFunction = 0;

        // Show the functions name area and add class.
        functionsName.show().addClass('bordered');
        $(".suggestion-wrapper").addClass('border-up');

        // Build the array of function to divs.
        $.each(data, function(key, val) {
          // When you write down the word function - suggest only hooks().
          var exploded_row = inline_devel_get_current_line('edit-code').replace("\n", '').split(/\s/g);
          var row_begining = exploded_row[0];
          var row_middle = exploded_row[2];

          var shown = false;

          // We have the word class/function at the begining.
          if (jQuery.inArray(row_begining, Array('class', 'function')) > -1 || row_begining.indexOf('$') == 0) {
            if (exploded_row[0] == 'function' && val.type == 'hooks') {
              items.push(inline_devel_generate_item_push(val));
            }
            else if ((row_begining == 'class' || row_begining.indexOf('$') == 0) && (jQuery.inArray(row_middle, Array('new', 'extends')) > -1) && val.type == 'class') {
              items.push(inline_devel_generate_item_push(val));
            }

            var shown = true;
          }

          // We didn't shown any thing, present all options.
          if (shown == false) {
            // Show all the available functions.
            items.push(inline_devel_generate_item_push(val));
          }
        });

        // Insert the html.
        functionsName.html(items.join(''));

        // Set the prevSearch variable to this serach. This preventing
        // meaningless refreshing of the suggestor.
        prevSearch = textarea.val();
      });
    }).keydown(function(keyPressed) {
      $.keyNumber = keyPressed.which;
      var selectedDiv = $("#suggestion .selected-function");
      var availableFunctionNumber = $("#suggestion div.function").length;

      if (inline_devel_break_on_reserved('edit-code') == 0 || jQuery.inArray(keyPressed.which, Array(48, 57, 219, 221)) > -1) {
        inline_devel_close_suggestor();
        return;
      }

      // The functions is revealed to the user. When scrolling down with the
      // keyboard need to keep the the courser in the same place for replacing
      // words properly.
      if (($.keyNumber == 38 || $.keyNumber == 40) && availableFunctionNumber > 0) {
        keyPressed.preventDefault();
        inline_devel_get_position_in_overflow($.keyNumber);
      }

      if (($.keyNumber >= 38 || $.keyNumber.which <= 40)) {
        currentFunction = $("#suggestion .selected-function").index();
        if ($.keyNumber == 38) {
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

      if ($.keyNumber == 13 && divElement.html()) {
        // Insert data properly.
        inline_devel_insert_element_propperly('edit-code', inline_devel_get_last_word('edit-code'), divElement.attr('name'), divElement.attr('type'));

        // Don't break row.
        keyPressed.preventDefault();
        $("#suggestion .function").removeClass('selected-function');

        functionsName.html('');
        functionsName.hide();
        return;
      }

      // Hide the functions name area because there is no text.
      if (textarea.val().length == 0) {
        functionsName.removeClass('bordered');
        functionsName.hide();
        return;
      }
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
      inline_devel_insert_element_propperly('edit-code', inline_devel_get_last_word('edit-code'), $("#suggestion .function#" + id).attr('name'), $("#suggestion .function#" + id).attr('type'));

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

// Keyboard events handling: Shortcuts tabs and more things that relate to IDE.
Drupal.behaviors.keyBoardEvents = {
  attach: function(context, settings) {
    var inline_devel_settings = settings.inline_devel;

    // Short cuts.
    $(document).keydown(function(event) {
      // ESC button for closing the suggestor at any time.
      if (inline_devel_settings.esc_enable == true && event.which == 27) {
        inline_devel_close_suggestor();
      }

      // Ctrl + s handling
      if (inline_devel_settings.ctrl_s_enable == true && event.ctrlKey && event.which == 83) {
        $("#devel-execute-form").submit();
        event.preventDefault();
      }
    });

    // When clicking on the tab, insert two spaces. I'm not using the api
    // fuction inline_devel_insert_element_propperly becuase she insert the '('
    // char and i dont want to keep it clean.
    $("#edit-code").keydown(function(event) {
      // spacces instead of tabs option is disable.
      if (inline_devel_settings.spaces_instead_of_tabs == false) {
        return;
      }

      var data = _inline_devel_textarea_helper('edit-code');
      var cursor = data.elem.selectionStart;
      var white_space = '';

      if (event.which == 9) {
        event.preventDefault();

        // Building the whitespaces.
        for (var i = 0; i < inline_devel_settings.number_of_spaces; i++) {
          white_space += ' ';
        }

        // Insert white spaces and string manipulations.
        $("#edit-code").val(data.value.slice(0, data.elem.selectionStart) + white_space + data.value.slice(data.elem.selectionEnd));
        data.elem.selectionStart = cursor + white_space.length;
        data.elem.selectionEnd = cursor + white_space.length;
      }
    });
  }
}

/**
 * General UI handling.
 */
Drupal.behaviors.generalUI = {
  attach: function() {

    if ($(".colored-code").css('display') != undefined && $("#console").css('dislay') == null) {
      $("#console").hide();
    }

    $(".colored-code").hover(function() {
      $(".textarea-link").show();
    },
    function() {
      $(".textarea-link").hide();
    });

    $(".colored-code a.textarea-link").click(function() {
      $("div.colored-code").hide('slow');
      $("#console").show();
    });
  }
}

/**
 * Variable suggestor.
 */
Drupal.behaviors.variableSuggestor = {
  attach: function() {
    $(document).keydown(function(event) {
      if (event.ctrlKey == true  && event.shiftKey == true && event.which == 86) {
        event.preventDefault();

        if ($(".form-type-textfield.form-item-variables").css('display') == 'none') {
          $(".form-type-textfield.form-item-variables").show(500);
        }
        else {
          $(".form-type-textfield.form-item-variables").hide(500);
        }

        $("#edit-variables").val('');
        $("#edit-variables").focus();      }
    });
    
    $("#edit-variables").keydown(function(keyPressed) {
      if (keyPressed.which == 13) {
        keyPressed.preventDefault();
        var data = _inline_devel_textarea_helper('edit-code');
        var cursor = data.elem.selectionStart;

        $("#edit-code").focus();

        $("#edit-code").val(data.value.slice(0, data.elem.selectionStart) + "variable_get('" + $(this).val() + "')" + data.value.slice(data.elem.selectionEnd));
        data.elem.selectionStart = cursor + 14 + $(this).val().length + 2;
        data.elem.selectionEnd = cursor + 14 + $(this).val().length + 2;
        
        $(".form-type-textfield.form-item-variables").hide(500);
      }
    });
  }
}

})(jQuery);
