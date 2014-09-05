// Collections //////////////////////////////////////////////////////////////////////////////////////////
AppSettings = new Meteor.Collection("appsettings");
Chats = new Meteor.Collection("chats");
UserIcons = new Meteor.Collection("usericons");

Meteor.publish("allChats", function() {
	return Chats.find({}, { fields: {timestamp: 1, message: 1, userIconClassName: 1 } } );
});

Meteor.publish("allAppSettings", function() {
	return AppSettings.find();
});

Meteor.publish("userIcon", function(userGuid) {
	if (!userGuid) return null;
	if (UserIcons.find( { usedByUserGuid: userGuid }).count() === 0) {
		selectIconForUser(userGuid);
	}
	return UserIcons.find( { usedByUserGuid: userGuid }, { fields: { className: 1 }});
});

// Methods /////////////////////////////////////////////////////////////////////////////////////////////////

Meteor.methods({
	insertChat : function(chatMessage) {
		var totalNumberOfChats = Chats.find().count();
		if (totalNumberOfChats >= 50) {
			var oldestChatMessage = Chats.findOne({}, { sort: { timestamp: 1}});
			Chats.remove({_id: oldestChatMessage._id});
		}

		var icon = UserIcons.findOne({usedByUserGuid: chatMessage.userGuid });
		if (!icon) {
			selectIconForUser(chatMessage.userGuid, function(className) {
				doInsert(new Date(), chatMessage.message, className);
			});
		} else {
			UserIcons.update({ _id: icon._id }, {$set: { lastUsedDateTime: new Date()} });
			doInsert(new Date(), chatMessage.message, icon.className);
		}

		function doInsert(timestamp, message, className) {
			Chats.insert({ timestamp: timestamp, message: message, userIconClassName: className });
		}
	}
});

// Functions ///////////////////////////////////////////////////////////////////////////////////////////////

function selectIconForUser(userGuid, callback) {
	var unusedIcons = UserIcons.find({ usedByUserGuid: null }).fetch();
	if (unusedIcons.length === 0) {
		Meteor._debug("ran out of icons");
		throw "Ran out of icons!";
	}
	var selectedIcon = _.sample(unusedIcons);
	UserIcons.update({ _id: selectedIcon._id }, { $set: { usedByUserGuid: userGuid, lastUsedDateTime: new Date() } }, {}, function() {
		if (typeof callback === "function") {
			callback(selectedIcon.className);
		}
	});
}

// Startup ////////////////////////////////////////////////////////////////////////////////////////////////////////
Meteor.startup(function() {

	if (!AppSettings.findOne({ name: "lastestImageUrl" })) {
		AppSettings.insert( { name: "lastestImageUrl", value: "/img/default.png" } );
	}

	if (UserIcons.find().count() === 0) {
		var animals = ["bear", "bee", "cat", "cat_eyes", "cat_face", "cat_walk", "cat_wink", "cow", "crow", "dog", "dragon", "duck", "elephant", "kiwi", "octopus", "rabbit", "shark", "sloth", "squirrel", "beaver", "butterfly", "chicken", "deer", "donkey", "eagle", "frog", "giraffe", "killerwhale", "ladybug", "lion", "lobster", "moose", "mouse", "narwhale", "pig", "seaturtle", "sheep", "specials", "unicorn", "bat"];
		// var animals = ["bat", "bear", "bee"]
		var colors = ["white", "red", "orange", "yellow", "green", "blue", "purple", "pink"];
		// var colors = ["white", "red"];

		for (var a in animals) {
			for (var c in colors) {
				UserIcons.insert({ className: animals[a] + "-" + colors[c], usedByUserGuid: null, lastUsedDateTime: new Date(1900,0,1) });
			}
		}

	}

	Meteor.setInterval(function() {
		var twelveHoursAgo = (new Date()).addHours(-12);
		// var twelveHoursAgo = (new Date()).addSeconds(-12);
		UserIcons.update( { lastUsedDateTime: { $lt: twelveHoursAgo } } , { $set: { usedByUserGuid: null } } , {multi: true} );
	}, 60000);

});