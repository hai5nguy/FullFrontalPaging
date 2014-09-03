// Collections ///////////////////////////////////////////////////////////////////////////////////
AppSettings = new Meteor.Collection("AppSettings");
Chats = new Meteor.Collection("Chats");
Icons = new Meteor.Collection("Icons");

Meteor.publish("allChats", function() {
	return Chats.find();
});

Meteor.publish("allAppSettings", function() {
	return AppSettings.find();
});

Meteor.publish("allIcons", function() {
	return Icons.find( {}, { fields: { className: 1 }});
});

// Methods ///////////////////////////////////////////////////////////////////////////////////////

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

		Chats.insert({ timestamp: new Date(), message: chatMessage.message, iconId: chatMessage.iconId });
	},
	getAvailableUserIcon : function() {
		var allIcons = Icons.find().fetch();
		var now = new Date();
		var unusedIcons = _.filter(allIcons, function(icon) {
			return now - icon.lastUsedDateTime > 10000;   //milliseconds, 12 hours
		});
		var rand = Math.floor(Math.random() * unusedIcons.length);
		var selectedIcon = unusedIcons[rand];
		Icons.update({ _id: selectedIcon._id }, { className: selectedIcon.className, lastUsedDateTime: now });
		return Icons.findOne( { _id: selectedIcon._id } );
	},
	keepalive : function(refreshData) {
		var userIconClassName = refreshData.userIconClassName;

		var userIcon = Icons.findOne({ className: userIconClassName });
		if (userIcon) {
			Icons.update({ _id: userIcon._id }, { className: userIcon.className, lastUsedDateTime: new Date() });
		}
	}
});



Meteor.startup(function() {

	// Meteor._debug(AppSettings.findOne({ name: "lastestImageUrl" }));

	if (!AppSettings.findOne({ name: "lastestImageUrl" })) {
		AppSettings.insert( { name: "lastestImageUrl", value: "/img/default.png" } );
	}

	if (Icons.find().count() === 0) {
		var animals = ["bat", "bear", "bee", "cat", "cat_eyes", "cat_face", "cat_walk", "cat_wink", "cow", "crow", "dog", "dragon", "duck", "elephant", "kiwi", "octopus", "rabbit", "shark", "sloth", "squirrel", "beaver", "butterfly", "chicken", "deer", "donkey", "eagle", "frog", "giraffe", "killerwhale", "ladybug", "lion", "lobster", "moose", "mouse", "narwhale", "pig", "seaturtle", "sheep", "triforce", "unicorn"];
		var colors = ["white", "red", "orange", "yellow", "green", "blue", "purple", "pink"];

		for (var a in animals) {
			for (var c in colors) {
				Icons.insert({ className: animals[a] + "-" + colors[c], lastUsedDateTime: new Date(1900,0,1) });
			}
		}

	}

});