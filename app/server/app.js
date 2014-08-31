Meteor.publish("allChats", function() {
	this.ready();
	return Chats.find();
});

Meteor.startup(function () {
    //Chats.insert({message: "yo yo yo"});
});
