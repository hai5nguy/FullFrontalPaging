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



Chats = new Meteor.Collection("chats");

if (Meteor.isClient) {

    Template.chats.chats = function () {
        return Chats.find();
    }

    Template.image.url = function()
    {
        return "http://placehold.it/350x450"
    }

    Template.chatinput.events({
        'click input#send': function(event) {
            var form = $(event.currentTarget).parent();
            var write = form.find('#write');
            Chats.insert({message: write.val()});
            write.val('');
            return false;
        }
    });

    function isImageUrl(url) {
        var regex = /^http://.+[
    }
}