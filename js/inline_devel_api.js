(function ($) {
  jQuery.fn.getSelectionStart = function(){
    if (this.lengh == 0) {
      return -1;
    }

    input = this[0];
   
    var pos = input.value.length;
   
    if (input.createTextRange) {
      var r = document.selection.createRange().duplicate();
      r.moveEnd('character', input.value.length);
      if (r.text == '') {
        pos = input.value.length;
        pos = input.value.lastIndexOf(r.text);
      }
      else if (typeof(input.selectionStart)!="undefined") {
        pos = input.selectionStart;
      }
    }

    return pos;
  }

  jQuery.fn.getCursorPosition = function(){
    if(this.lengh == 0) {
      return -1;
    }

    return $(this).getSelectionStart();
  }

  // Variables.
  $.keyNumber = 0;
  $.cursor = 0;
  $.speicalChars = Array(
    " ", '(', ')', ';'
  );
})(jQuery);
