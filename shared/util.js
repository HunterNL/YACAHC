Utils = (function(){ //module pattern

	//Helper to see if the users is already in the given room
	this.roomContainsUser = function(roomId,userId){
		return (Meteor.users.find({
			_id : userId,
			room : roomId
		}).count() > 0);
	};

	return this;
})(); //end of module
