var INITIAL_HAND_SIZE = 10;

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

//Add card to room's blacklist effectivly removing card from possible cards to draw
function discardCard(cardId,roomId) {
	if(!cardId || !roomId) {throw new Meteor.Error("invalid_args_discardCard","Invalid arguments to discardCard",[cardId,roomId]);}
	Rooms.update(roomId,{
		$addToSet : {discarded_cards : cardId} //addtoset prevents duplicates, unlike push
	});
}

//Deal a card to a user, also discard so its not drawn again
function dealCard(cardId,userId,roomId) {
	if(!cardId || !userId || !roomId) {throw new Meteor.Error("invalid_args_dealcard","Invalid arugments to dealcard",[cardId,userId,roomId]);}
	Meteor.users.update(userId,{
		$addToSet : {hand:cardId}
	});

	discardCard(cardId,roomId);
}

function findCardsActiveInRoom(roomId,type) {
	if(!roomId || !type) {
		throw new Meteor.Error("invalid_args_findcardsactiveinroom","Invalid arguments to findcardsactiveinroom",[roomId,type]);
	}

	if(!(type==="q"||type==="a")) {
		console.warn("odd type arugment passed to findCardsActiveInRoom",type);
	}

	var room = Rooms.findOne(roomId);
	if(!room) {
		throw new Meteor.Error("findcardactiveinroom_room_not_found","Did not find specified room in findCardsActiveInRoom",roomId);
	}

	return Cards.find({
		_id : {
			$nin : room.discarded_cards
		},
		set : {
			$in : room.cardsets
		},
		type: type
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
					hand: [] //lets clear the hand to be sure
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


		if(room.state !== "setup") {
			throw new Meteor.Error("room_invalid_state","Tried to start game while already playing");
		}

		Rooms.update(room._id,{
			$set : {
				state: "playing"
			}
		});

		var users = Meteor.users.find({room:room._id}).fetch();
		var cards = findCardsActiveInRoom(room._id,"a").fetch();


		for(var i=0;i<users.length;i++){
			var user = users[i];
			for(var o=0;o<INITIAL_HAND_SIZE;o++) {
				var card = Utils.removeRandomElementFromArray(cards);
				if(!card) {
					throw new Meteor.Error("room_insuficcient_cards_to_deal","Cardsets do not have enough cards to deal",room);//TODO Nicer handling of this case
				}

				dealCard(card._id,this.userId,room._id);
			}


		}


		updateRoomDate(room._id);
		updateUserDate(this.userId);


	},

	cardDiscard : function(cardId) {
		var room = Utils.getRoomFromCurrentUser();
		if(!room) {
			throw new Meteor.Error("user_not_in_room_discardcard","User needs to be in room to discard a card",this.userId);
		}

		if(!cardId) {
			throw new Meter.Error("discardcard_no_id_specifiec","User did not give ID for discardcard",cardId);
		}

		discardCard(cardId,room._id);

		updateUserDate(Meteor.userId());
		updateRoomDate(room._id);
	}



});
