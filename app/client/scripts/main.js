$(function() {
  //Toggles image size between tall and wide view onclick
  $( "#imagecontainer" ).click(function() {
    $( this ).toggleClass( "wide" );
  });

  //Dragbar resizes chat from http://jsfiddle.net/gaby/Bek9L
  $('#dragbar').mousedown(function(resizeChat){
    resizeChat.preventDefault();
    $(document).mousemove(function(resizeChat){
      $('#imagecontainer').css("width",resizeChat.pageX+2);
      $('#dragbar').css("left",resizeChat.pageX+2);
      $('#chatlog').css("left",resizeChat.pageX+2);
    })
  });
  $(document).mouseup(function(resizeChat){
    $(document).unbind('mousemove');
    //chatBottom(); //fix laters
  });
});
