var IMAGE_URL_REGEX = /https?:\/\/\S+\.(jpe?g|gif|png)/i;

Chats = new Meteor.Collection("chats");


if (Meteor.isClient) {

  Template.chats.chats = function () {
    return Chats.find();
  }

  Template.image.url = function() {
    return Session.get("currentImageUrl")
  }

  Template.chatinput.events({
    'keydown textarea#write' : function(event) {
      if (event.which == 13) {
        var write = $(event.currentTarget);
        var message = write.val();
        processNewChatMessage(message);
        write.val('');
        event.preventDefault();
      }
    }
  });

  Template.chatsubmit.events({
    'click input#send': function(event) {
      var write = $(event.currentTarget).closest("form").find('#write');
      var message = write.val();
      processNewChatMessage(message);
      write.val('')
      event.preventDefault();
    }
  });

  UI.registerHelper("embedUrl", function(text) {
    var matches = text.match(IMAGE_URL_REGEX);
    if (!matches) return text;
    matches.forEach(function(match, i) {
      text = surroundWithAnchor(text, match);
    });
    return text;
  });

  function processNewChatMessage(message) {
    Chats.insert({ message: message });

    var imageUrl = findImageUrl(message);
    if (imageUrl) {
      Session.set("currentImageUrl", imageUrl);
    }
  }

  function surroundWithAnchor(text, url) {
    return text.replace(url, "<a href='" + url + "'>" + url + "</a>");
  }

  function findImageUrl(text) {
    var matches = text.match(IMAGE_URL_REGEX);

    if (matches) {
      return matches[0];
    } else {
      return null;
    }
  }


  ///////////////////////////

  Meteor.startup(function() {

    //Toggles image size between tall and wide view onclick
    $( "#imagecontainer" ).click(function() {
      $( this ).toggleClass( "wide" );
    });

    //Shows bottom of chatlog on page load.
    $(document).ready( function chatBottom() {
      $('#chatlog')[0].scrollTop = $('#chatlog')[0].scrollHeight;
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

}