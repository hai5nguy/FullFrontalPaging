Meteor.publish("allChats", function() {
	this.ready();
	return Chats.find();
});

Meteor.methods({
	insertChat : function(chatMessage) {
		var totalNumberOfChats = Chats.find().count();
		// Meteor._debug("totalNumberOfChats: " + totalNumberOfChats);
		if (totalNumberOfChats >= 50) {
			var oldestChatMessage = Chats.findOne({}, { sort: { timestamp: 1}});
			// Meteor._debug("oldestChatMessage: " + JSON.stringify(oldestChatMessage));
			Chats.remove({_id: oldestChatMessage._id});
			//Chats.findAndModify({ sort: { date: 1}, remove: true });
		}

		Chats.insert({ message: chatMessage, timestamp: new Date() });
	}
});