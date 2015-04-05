//2 functions for easily updating last activity
function updateUserDate(userId) {
	Meteor.users.update(userId,{
		$set : {
			date_last_activity : new Date()
		}
	});
}

function updateRoomDate(roomId) {
	Rooms.update(roomId,{
		$set : {
			date_last_activity : new Date()
		}
	});
}



Meteor.methods({
	//Create a new room with given ID
	roomCreate : function(roomId) {

		if(Rooms.findOne(roomId)){
			throw new Meteor.Error("duplicate_room_id","Room with id "+roomId+" already exists");
		}

		//Insert the new room
		Rooms.insert({
			_id : roomId,
			owner: this.userId,
			date_created : new Date(),
			state: "setup",
			cardsets : []
		});

		//Update user last activity date
		updateUserDate(this.userId);
		updateRoomDate(roomId);

	},

	//Add current user to given room
	roomAddUser : function(roomId) {
		if(!Utils.roomContainsUser(roomId,this.userId)) {
			Meteor.users.update(this.userId,{
				$set : {
					room: roomId,
				}
			});

			updateUserDate(this.userId);
			updateRoomDate(roomId);
		}
	},

	roomToggleCardSet : function(setId) {
		var room = Utils.getRoomFromCurrentUser();
		var roomId = room._id;

		if(room.cardsets.indexOf(setId) === -1) {
			//If cardset ins't used, add it
			Rooms.update(roomId,{
				$push : {
					cardsets : setId
				}
			});

		} else {
			//If cardset IS used, remove it

			Rooms.update(roomId,{
				$pull : {
					cardsets: setId
				}
			});
		}

	}, //End of roomToggleCardSet


	//Starts game if room is in setup
	roomStartGame : function() {
		var room = Utils.getRoomFromCurrentUser();
		if(!room) {
			throw new Meteor.Error("invalid_room_start","User without room tried to start a game",Meteor.user());
		}

		if(!Utils.currentUserIsRoomOwner(room)) {
			throw new Meteor.Error("user_not_admin_startgame","User needs to be admin to start the game",Meteor.user());
		}


		if(room.state === "setup") {
			Rooms.update(room._id,{
				$set : {
					state: "playing"
				}
			});

			updateRoomDate(room._id);
		} else {
			console.warn("Room tried to start while already playing");
		}

	}



});
