Meteor.publish("allChats", function() {
	this.ready();
	return Chats.find();
});

Meteor.publish("allAppSettings", function() {
	return AppSettings.find();
});

Meteor.publish("userIconReclaimed", function() {
	
});

Meteor.publish("haitest", function(className) {
	Meteor._debug("haitest className: " + className);
	Meteor._debug(JSON.stringify(Icons.findOne({className: className})));
	return Icons.find({className: className});
});

Meteor.methods({
	insertChat : function(chatMessage, className) {
		var totalNumberOfChats = Chats.find().count();
		// Meteor._debug("totalNumberOfChats: " + totalNumberOfChats);
		if (totalNumberOfChats >= 50) {
			var oldestChatMessage = Chats.findOne({}, { sort: { timestamp: 1}});
			// Meteor._debug("oldestChatMessage: " + JSON.stringify(oldestChatMessage));
			Chats.remove({_id: oldestChatMessage._id});
			//Chats.findAndModify({ sort: { date: 1}, remove: true });
		}

		Chats.insert({ timestamp: new Date(), message: chatMessage, userIconClassName: className });
	},
	getAvailableIconClassName : function() {

		var allIcons = Icons.find().fetch();
		// Meteor._debug("unusedIcons: " + JSON.stringify(unusedIcons));
		// Meteor._debug("rand: " + rand);

		var now = new Date();
		var unusedIcons = _.filter(allIcons, function(icon) { 
			// return now - icon.lastUsedDateTime > 43200000;   //milliseconds, 12 hours
			return now - icon.lastUsedDateTime > 10000;   //milliseconds, 12 hours

		});

		var rand = Math.floor(Math.random() * unusedIcons.length);

		var selectedIcon = unusedIcons[rand];

		Meteor._debug("selectedIcon: " + selectedIcon);

		Icons.update({ _id: selectedIcon._id }, { className: selectedIcon.className, lastUsedDateTime: now });
		return selectedIcon.className;
	},
	keepalive : function(refreshData) {
		var userIconClassName = refreshData.userIconClassName;

		var userIcon = Icons.findOne({ className: userIconClassName });
		if (userIcon) {
			Icons.update({ _id: userIcon._id }, { className: userIcon.className, lastUsedDateTime: new Date() });
		}
	}
});

Icons = new Meteor.Collection("icons");


Meteor.startup(function() {

	// Meteor._debug(AppSettings.findOne({ name: "lastestImageUrl" }));

	if (!AppSettings.findOne({ name: "lastestImageUrl" })) {
		AppSettings.insert( { name: "lastestImageUrl", value: "http://placehold.it/800x600" } );
	}

	if (Icons.find().count() === 0) {
		var animals = ["bat", "bear", "bee", "cat", "cat_eyes", "cat_face", "cat_walk", "cat_wink", "cow", "crow", "dog", "dragon", "duck", "elephant", "kiwi", "octopus", "rabbit", "shark", "sloth", "squirrel"];
		var colors = ["white", "red", "orange", "yellow", "green", "blue", "purple", "pink"];

		for (var a in animals) {
			for (var c in colors) {
				Icons.insert({ className: animals[a] + "-" + colors[c], lastUsedDateTime: new Date(1900,0,1) });
			}
		}

	}
	
});