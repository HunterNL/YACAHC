Utils = (function(){ //module pattern

	//Helper to see if the users is already in the given room
	this.roomContainsUser = function(roomId,userId){
		return (Meteor.users.find({
			_id : userId,
			room : roomId
		}).count() > 0);
	};

	//Get room object from currentlly logged in user
	this.getRoomFromCurrentUser = function() {
		var roomId = Meteor.user().room;
		if(!roomId) {return;} //If no roomID, return nil;

		var room = Rooms.findOne(roomId);
		return room; //Can be nil if nothing found
	};

	this.currentUserIsRoomOwner = function(room){
		return (room.owner === Meteor.userId());
	};

	return this;
})(); //end of module
