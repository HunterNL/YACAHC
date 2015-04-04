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

	//Add given user to given room
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
		var roomId = Meteor.user().room;
		if(!roomId) {return;} //If no roomId, return

		var room = Rooms.findOne(roomId);
		if(!room) {return;} //If no roo,, return

		//If user isn't owner, retrun
		if(Meteor.userId() !== room.owner) {return;}

		if(room.cardsets.indexOf(setId) === -1) {
			//If cardset ins't used, add it
			Rooms.update(roomId,{
				$push : {
					cardsets : setId
				}
			})

		} else {
			//If cardset IS used, remove it

			Rooms.update(roomId,{
				$pull : {
					cardsets: setId
				}
			})
		}

	} //End of roomToggleCardSet



});
