var IMAGE_URL_REGEX = /https?:\/\/\S+\.(jpe?g|gif|png)/i;

Chats = new Meteor.Collection("chats");


if (Meteor.isClient) {
  Meteor.subscribe("allChats", {
    onReady: function() {
      console.log("ready");
      scrollToBottom();
    }
  });

  Template.chats.chats = function () {
    return Chats.find();
  }

  Chats.find().observe({
    added: function() {
      //console.log("added");
      Session.set("atBottomOfChatWindow", isAtBottomOfChatWindow());


    }
  });

  function isAtBottomOfChatWindow() {
    var chatlog = $('#chatlog');
    var heightOfChatlog = chatlog.height();
    var heightOfChatContent = chatlog[0].scrollHeight;
    var topOfChatContent = chatlog[0].scrollTop;

    // console.log("heightOfChatlog: " + heightOfChatlog);
    // console.log("heightOfChatContent: " + heightOfChatContent);
    // console.log("topOfChatContent: " + topOfChatContent);

    return (heightOfChatContent - heightOfChatlog <= topOfChatContent)
  }

  function scrollToBottom() {
    // console.log("scrolling");
    $('#chatlog')[0].scrollTop = $('#chatlog')[0].scrollHeight;
  }

  Template.chats.rendered = function() {
    // console.log("chats rendered");
    scrollToBottom();
  }

  Template.chatmessage.rendered = function() {
    // console.log("rendered");
    if (Session.get("atBottomOfChatWindow")) {
      // console.log("renedreed at bottom");
      scrollToBottom();
    }
  }

  //5941 Westbury North Dr, Apt D
  Template.image.url = function() {
    return Session.get("currentImageUrl")
  }

  Template.chatinput.events({
    'keydown textarea#write' : function(event) {
      if (event.which == 13) {
        scrollToBottom();
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
      scrollToBottom();
      var write = $(event.currentTarget).closest("form").find('#write');
      var message = write.val();
      processNewChatMessage(message);
      write.val('')
      event.preventDefault();
    }
  });

  UI.registerHelper("formatTimestamp", function(isoDateTime) {
    var d = new Date(isoDateTime);
    var hh = d.getHours();
    var m = d.getMinutes();
    var dd = "AM";
    var h = hh;
    if (h >= 12) {
        h = hh-12;
        dd = "PM";
    }
    if (h == 0) {
        h = 12;
    }
    m = m<10?"0"+m:m;

    return h + ":" + m + " " + dd;
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
    Meteor.call("insertChat", message);

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
