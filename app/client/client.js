var IMAGE_URL_REGEX = /https?:\/\/\S+\.(jpe?g|gif|png)/i;
var DEFAULT_IMAGE_URL = "/img/default.png";

Session.set("userGuid", Meteor.uuid()) 

// Startup ///////////////////////////////////////////////////////////////////////////////////////////////
Meteor.startup(function() {
});

// Collections ///////////////////////////////////////////////////////////////////////////////////
AppSettings = new Meteor.Collection("appsettings");
Chats = new Meteor.Collection("chats");
UserIcon = new Meteor.Collection("usericons");

Meteor.subscribe("allAppSettings");

Meteor.subscribe("allChats", {
  onReady: function() {
    scrollToBottom();
  }
});

Meteor.subscribe("userIcon", Session.get("userGuid"));

Chats.find().observe({
  added: function() {
    // Meteor._debug("inside chats.find().observer added, atBottomOfChatWindow: " + isAtBottomOfChatWindow());
    Session.set("atBottomOfChatWindow", isAtBottomOfChatWindow());
  }
});

UserIcon.find().observeChanges({
  added: function(id, fields) {
    var currentUserIcon = UserIcon.findOne( { usedByUserGuid: Session.get("userGuid") } );
    if (currentUserIcon) {
      Session.set("currentUserIconClassName", currentUserIcon.className)
    }
  },
  // changed: function(id, fields) {
  //   console.log("usericon changed id: " + id + " fields: " + JSON.stringify(fields));
  // },
  removed: function(id) {
    Session.set("currentUserIconClassName", "");
  }

});

// Helper Functions - must be first for some reason ///////////////////////////////////////////////

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
  text = surroundWithAnchor(text, matches[0]);
  return text;
});

// Templates ////////////////////////////////////////////////////////////////////////////////////////
Template.chats.chats = function () {
  return Chats.find();
}
Template.chatmessage.rendered = function() {
  if (Session.get("atBottomOfChatWindow")) {
    scrollToBottom();
  }
}
Template.image.url = function() {
  var url = AppSettings.findOne( { name: "lastestImageUrl" });
  return url ? url.value : DEFAULT_IMAGE_URL;
}
Template.infobar.currentUserIconClassName = function() {
  var userIcon = UserIcon.find().fetch();
  // console.log("userIcon", userIcon);
  return userIcon.length > 0 ? userIcon[0].className : "";
}


Template.chatinput.events({
  'keydown textarea#write' : function(event) {
    if (event.which == 13) {
      var write = $(event.currentTarget);
      var message = write.val();
      if (message != '') {
        scrollToBottom();
        processNewChatMessage(message);
        write.val('');
      }
      event.preventDefault();
    }
  }
});

Template.chatsubmit.events({
  'click input#send': function(event) {
    scrollToBottom();
    var write = $(event.currentTarget).closest("form").find('#write');
    var message = write.val();
    if (message != '') {
      processNewChatMessage(message);
      write.val('')
    }
    event.preventDefault();
  }
});


// Functions ///////////////////////////////////////////////////////////////////////////////////////

function isAtBottomOfChatWindow() {
  var chatlog = $('#chatlog');
  var heightOfChatlog = chatlog.height();
  var heightOfChatContent = chatlog[0].scrollHeight;
  var topOfChatContent = chatlog[0].scrollTop;
  return (heightOfChatContent - heightOfChatlog <= topOfChatContent)
}

function scrollToBottom() {
  $(function() {
    $('#chatlog')[0].scrollTop = $('#chatlog')[0].scrollHeight;
  });
}


function processNewChatMessage(message) {
  Meteor.call("insertChat", { message: message, userGuid: Session.get("userGuid") } );

  var imageUrl = findImageUrl(message);
  if (imageUrl) {
    var lastestImageUrl = AppSettings.findOne({ name: "lastestImageUrl" });
    AppSettings.update({ _id: lastestImageUrl._id }, { name: "lastestImageUrl", value: imageUrl });
  }
}

function surroundWithAnchor(text, url) {
  return text.replace(url, "<a href='" + url + "' target='_blank'>image</a>");
}

function findImageUrl(text) {
  var matches = text.match(IMAGE_URL_REGEX);

  if (matches) {
    return matches[0];
  } else {
    return null;
  }
}




