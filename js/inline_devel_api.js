(function ($) {
  jQuery.fn.getCursorPosition = function() {
    var el = $(this).get(0);
    var pos = 0;
    if('selectionStart' in el) {
      pos = el.selectionStart;
    }
    else if('selection' in document) {
      el.focus();
      var Sel = document.selection.createRange();
      var SelLength = document.selection.createRange().text.length;
      Sel.moveStart('character', -el.value.length);
      pos = Sel.text.length - SelLength;
    }

    return pos;
  }

  // Variables.
  $.keyNumber = 0;
  $.cursor = 0;
  $.speicalChars = Array(
    " ", '(', ')', ';'
  );

})(jQuery);
