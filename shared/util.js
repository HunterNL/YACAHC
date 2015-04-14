Utils = (function(){ //module pattern
	self = {};
	//Helper to see if the users is already in the given room
	self.roomContainsUser = function(roomId,userId){
		return (Meteor.users.find({
			_id : userId,
			room : roomId
		}).count() > 0);
	};

	//Get room object from currentlly logged in user
	self.getRoomFromCurrentUser = function() {
		var roomId = Meteor.user().room;
		if(!roomId) {return;} //If no roomID, return nil;

		var room = Rooms.findOne(roomId);
		return room; //Can be nil if nothing found
	};

	self.currentUserIsRoomOwner = function(room){
		return (room.owner === Meteor.userId());
	};

	self.removeRandomElementFromArray = function(array) {
		return array.splice(Math.floor(array.length * Math.random()),1)[0]; //one liner ahoy
	};

	self.randomElementFromArray = function(array) {
		return array[Math.floor(array.length * Math.random())];
	};

	return self;
})(); //end of module
