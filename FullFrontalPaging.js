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


var imageUrlRegex = /https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpe?g|gif|png)/i;

Chats = new Meteor.Collection("chats");

if (Meteor.isClient) {
    Template.chats.chats = function () {
        return Chats.find();
    }

    Template.image.url = function()
    {
        return "http://placehold.it/350x450"
    }

    Template.chatsubmit.events({
        'click input#send': function(event) {
            var form = $(event.currentTarget).closest("form");
            var write = form.find('#write');
            var message = write.val();

            Chats.insert({ message: message });


            var imageUrl = findImageUrl(message);
            if (imageUrl) {
              $('#imagecontainer > img').attr('src', imageUrl);
            }


            write.val('')


            return false;
        }
    });

    Handlebars.registerHelper("embedUrl", function(text) {
      var matches = text.match(imageUrlRegex);
      matches.forEach(function(match, i) {
        text = surroundWithAnchor(text, url);
      });
      return text;
    });

    function surroundWithAnchor(text, url) {
      return text.replace(url, "<a href='" + url + "'>" + url + "</a>");
    }

    function findImageUrl(text) {
      var matches = text.match(imageUrlRegex);
      if (matches.length > 0) {
        return matches[0];
      } else {
        return null;
      }
    }

    function embedImageUrlIntoText(text) {
      var imageUrl = findImageUrl(text);
      if (imageUrl) {
        return text.replace(imageUrl, "<a href='" + imageUrl + "'>" + imageUrl + "</a>");
      } else {
        return text;
      }
    }
}