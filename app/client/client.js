var IMAGE_URL_REGEX = /https?:\/\/\S+\.(jpe?g|gif|png)/i;
var DEFAULT_IMAGE_URL = "/img/default.png";

// Collections ///////////////////////////////////////////////////////////////////////////////////
AppSettings = new Meteor.Collection("AppSettings");
Chats = new Meteor.Collection("Chats");
Icons = new Meteor.Collection("Icons");
// Meteor._debug("initializing Chats and AppSettings on client");

Meteor.subscribe("allAppSettings");

Meteor.subscribe("allChats", {
  onReady: function() {
    // Meteor._debug("inside subscribe allChats onReady");
    scrollToBottom();
  }
});

Meteor.subscribe("allIcons");

Chats.find().observe({
  added: function() {
    // Meteor._debug("inside chats.find().observer added, atBottomOfChatWindow: " + isAtBottomOfChatWindow());
    Session.set("atBottomOfChatWindow", isAtBottomOfChatWindow());
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

// UI.registerHelper("getUserIconClassName",function(iconId) {
//   Meteor._debug("getUserIconClassName iconid: " + iconId);
//   Meteor._debug("getUserIconClassName findOne: " + Icons.findOne(iconId));
//   return Icons.findOne( { _id: iconId }).className;
// });

// Templates ////////////////////////////////////////////////////////////////////////////////////////
Template.chats.chats = function () {
  return Chats.find();
}
Template.chatmessage.rendered = function() {
  if (Session.get("atBottomOfChatWindow")) {
    scrollToBottom();
  }
}
Template.chatmessage.userIconClassName = function() {
  var icon = Icons.findOne(this.iconId);
  return icon ? icon.className : "";
}
Template.image.url = function() {
  var url = AppSettings.findOne( { name: "lastestImageUrl" });
  return url ? url.value : DEFAULT_IMAGE_URL;
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

  //console.log("heightOfChatlog: " + heightOfChatlog);
  // console.log("heightOfChatContent: " + heightOfChatContent);
  // console.log("topOfChatContent: " + topOfChatContent);

  return (heightOfChatContent - heightOfChatlog <= topOfChatContent)
}

function scrollToBottom() {
  $('#chatlog')[0].scrollTop = $('#chatlog')[0].scrollHeight;
}


function processNewChatMessage(message) {
  Meteor.call("insertChat", { message: message, iconId: Session.get("userIcon")._id } );

  var imageUrl = findImageUrl(message);
  if (imageUrl) {
    // Session.set("currentImageUrl", imageUrl);
    var lastestImageUrl = AppSettings.findOne({ name: "lastestImageUrl" });

    AppSettings.update({ _id: lastestImageUrl._id }, { name: "lastestImageUrl", value: imageUrl });
  }
}

function surroundWithAnchor(text, url) {
  return text.replace(url, "<a href='" + url + "' target='_blank'>" + url + "</a>");
}

function findImageUrl(text) {
  var matches = text.match(IMAGE_URL_REGEX);

  if (matches) {
    return matches[0];
  } else {
    return null;
  }
}


// Startup ///////////////////////////////////////////////////////////////////////////////////////////////

Meteor.startup(function() {

  Meteor.call("getAvailableUserIcon", function(error, icon) {
    if (error) { 
      alert("Unable to get available user icon.  Room maxed out or try refreshing.");
    }
    Session.set("userIcon", icon);
  });

});

