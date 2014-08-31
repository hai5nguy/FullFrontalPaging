Meteor.publish("allChats", function() {
	this.ready();
	return Chats.find();
});

Meteor.methods({
	insertChat : function(chatMessage) {
		Chats.insert({ message: chatMessage, timestamp: new Date() });
	}
});