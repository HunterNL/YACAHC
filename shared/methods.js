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
			cardsets : [],
			discarded_cards : []
		});

		//Update user last activity date
		updateUserDate(this.userId);
		updateRoomDate(roomId);

	},

	//Add current user to given room
	roomAddUser : function(roomId) {
		if(!Utils.roomContainsUser(roomId,this.userId)) {

			console.log("Adding user",this.userId,"to room",roomId);

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

		updateUserDate(this.userId);
		updateRoomDate(roomId);

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
			updateUserDate(this.userId);
		} else {
			console.warn("Room tried to start while already playing");
		}

	},

	cardDiscard : function(cardId) {
		var room = Utils.getRoomFromCurrentUser();
		if(!room) {
			throw new Meteor.Error("user_not_in_room_discardcard","User needs to be in room to discard a card",this.userId);
		}

		if(!cardId) {
			throw new Meter.Error("discardcard_no_id_specifiec","User did not give ID for discardcard",cardId);
		}

		Rooms.update(room._id,{
			$addToSet : {discarded_cards : cardId} //Addtoset prevents duplicates, unlike push
		});


		updateUserDate(Meteor.userId());
		updateRoomDate(room._id);
	}



});
