/*
if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to FullFrontalPaging.";
  };

  Template.hello.events({
    'click input': function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });
}
*/


var IMAGE_URL_REGEX = /https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpe?g|gif|png)/i;

Chats = new Meteor.Collection("chats");





if (Meteor.isClient) {



  Template.chats.chats = function () {
    return Chats.find();
  }

  Template.image.url = function() {
    return Session.get("currentImageUrl")
  }

  Template.chatsubmit.events({
    'click input#send': function(event) {
      var form = $(event.currentTarget).closest("form");
      var write = form.find('#write');
      var message = write.val();

      Chats.insert({ message: message });

      var imageUrl = findImageUrl(message);
      if (imageUrl) {
        Session.set("currentImageUrl", imageUrl);
          //$('#imagecontainer > img').css("backgroundImage", "url('" + imageUrl + "');");
      }

      write.val('')

      return false;
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

}