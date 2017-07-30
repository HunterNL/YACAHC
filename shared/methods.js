import Rooms from "/imports/rooms.js";
import Players from "/imports/players.js";

var HAND_SIZE = 10;

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
function discardCards(cards,roomId) {
	if(!cards || !roomId) {throw new Meteor.Error("invalid_args_discardCards","Invalid arguments to discardCards", "cards:"+cards+"\nroomId:",roomId);}

	Rooms.update(roomId,{
		$addToSet : {discarded_cards : {$each: cards}} //addtoset prevents duplicates, unlike push
	});
}

//Deal a card to a user, also discard so its not drawn again
function dealCards(cards,userId,roomId) {
	if(!cards || !userId || !roomId) {throw new Meteor.Error("invalid_args_dealcard","Invalid arugments to dealcard",[cardId,userId,roomId]);}
	Meteor.users.update(userId,{
		$addToSet : {hand: {$each : cards}}
	});

	discardCards(cards,roomId);
}

//Returns true if all users played all required cards
function roomAllCardsPlayed(room) {
	if(!room) {
		throw new Meteor.Error("invalid_args_roomallcardsplayed",room);
	}

	var users = Meteor.users.find({
		room: room._id
	}).fetch();

	return users.every(function(user){
		return (user._id === room.czar || user.cards_played_this_round.length == room.cards_required_this_round);
	});
}

function roomStartRound(room) {

	var users = Meteor.users.find({
		room: room._id
	}).fetch();

	var cards_white_q = findCardsActiveInRoom(room._id,"a");
	var cards_black_q = findCardsActiveInRoom(room._id,"q");

	var cards_white = cards_white_q.fetch();
	var cards_black = cards_black_q.fetch();

	console.log("Car Counts q,a",cards_black_q.count(),cards_white_q.count());

	var black_card = Utils.randomElementFromArray(cards_black);

	if(typeof black_card==="undefined") {
		throw new Meteor.Error("Unable to find black card");
	}

	discardCards([black_card._id],
		room._id); //Prevent card from being redrawn

	var new_czar_index;

	if(typeof room.czar_index === "undefined") {
		new_czar_index = 0;
	} else {
		new_czar_index = (room.czar_index+1)%room.czar_order.length;
	}

	var new_czar = room.czar_order[new_czar_index];

	//Reset cards users played
	var q = Meteor.users.update({
		room: room._id
	},{
		$set: {
			cards_played_this_round: []
		}
	},{
		multi: true
	});

	//Reset room
	Rooms.update(room._id,{
		$set : {
			state: "playing",
			black_card: black_card._id,
			cards_required_this_round: black_card.pick,
			czar_index: new_czar_index,
			czar: new_czar,
			card_pile: []
		}
	});


	//(re)fill user hands to to HAND_SIZE
	for(var i=0;i<users.length;i++){
		var user = users[i];
		var missing_cards = HAND_SIZE-user.hand.length;
		var cards_to_deal = [];
		for(var o=0;o<missing_cards;o++) {
			var card = Utils.removeRandomElementFromArray(cards_white);
			if(!card) {
				throw new Meteor.Error("room_insuficcient_cards_to_deal","Cardsets do not have enough cards to deal",room);//TODO Nicer handling of this case
			}
			cards_to_deal.push(card._id);
		}
		dealCards(cards_to_deal,user._id,room._id);
	}

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
	roomCreate : function() {
		if(!this.userId) {
			throw new Meteor.Error("room_create_no_userid");
		}
		
		return Rooms.create(this.userId);
	},

	//Add current user to given room
	roomAddUser : function(roomId) {
		return Rooms.addUser(roomId,this.userId);
	},

	roomToggleCardSet : function(roomId,setId) {
		Rooms.toggleCardSet(roomId,setId);
	}, //End of roomToggleCardSet


	//Starts game if room is in setup state
	roomStartGame : function(roomId) {
		Rooms.startRound(roomId);
		return;
		
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


		var users = Meteor.users.find({room:room._id}).fetch();
		var czar_order = []; //Array with MongoIDs that determine the order of czar-ing

		for(var i=0;i<users.length;i++) {
			czar_order.push(users[i]._id); //Populate czar_order with userIds
		}

		Rooms.update(room._id,{
			$set : {
				czar_order : czar_order,
			}
		});

		room.czar_order=czar_order;//Gotta give this to roomStartRound as well!

		//Start a new round from picking/timeout state
		roomStartRound(room);

		updateRoomDate(room._id);
		updateUserDate(this.userId);
	},
	/*
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
	},*/

	cardPlay : function(cardId) {
		var room = Utils.getRoomFromCurrentUser();
		var user = Meteor.user();

		if(!room) {
			throw new Meteor.Error("user_not_in_room_playcard","User needs to be in room to play a card",this.userId);
		}

		if(!cardId) {
			throw new Meter.Error("playcard_no_id_specified","User did not give ID for play",cardId);
		}

		if(user.hand.indexOf(cardId) === -1) {
			throw new Meteor.Error("playcard_user_doesn't have_card","User does not have given card to play",cardId);
		}

		if(user._id === room.czar) {
			throw new Meteor.Error("playcard_user_is_czar","User is czar but called cardPlay methods",[room,user]);
			//TODO visual effect on the client
		}

		if(user.cards_played_this_round.length >= room.cards_required_this_round) {
			throw new Meteor.Error("playcard_too_many_cards_played","User tried to play more cards than allowed",user);
		}

		if(room.state !== "playing") {
			throw new Meteor.Error("playcard_invalid_room_state","User tried to play card when room state doesn't allow",[user,room]);
		}

		//Add card to room pile
		Rooms.update(room._id,{
			$addToSet : {
				card_pile : cardId
			}
		});

		//And remove from user's hand
		Meteor.users.update(user._id,{
			$pull : {
				hand : cardId //Remove from hand
			},
			$push : {
				cards_played_this_round : cardId //Keep track who played what
			},
		});

		if(roomAllCardsPlayed(room)) {
			Rooms.update(room._id,{
				$set : {
					state: "picking",
				}
			});
		}

		updateUserDate(user._id);
		updateRoomDate(room._id);
	},

	cardPick : function(cardId) {
		var room = Utils.getRoomFromCurrentUser();
		var user = Meteor.user();

		if(!room) {
			throw new Meteor.Error("user_not_in_room_pickcard","User needs to be in room to play a card",this.userId);
		}

		if(!cardId) {
			throw new Meter.Error("pickcard_no_id_specified","User did not give ID for play",cardId);
		}

		if(room.card_pile.indexOf(cardId) === -1) {
			throw new Meteor.Error("pickcard_doesn't have_card","card pile doesn't contain given card",cardId);
		}

		if(user._id !== room.czar) {
			throw new Meteor.Error("pickcard_user_isnt_czar","User is not czar but called cardpick methods",[room,user]);
			//TODO visual effect on the client
		}

		if(room.state !== "picking") {
			throw new Meteor.Error("cardpick_invalid_room_state","Czar tried to pick card when room state doesn't allow",[user,room]);
		}

		//Award awesome point to winner
		console.log("Awarding awesome point in room",room._id);
		Meteor.users.update({
			cards_played_this_round : cardId
		},{
			$inc : {
				awesome_points : 1
			}
		});

		//TODO reset round
		roomStartRound(room);

	},

	setUsername : function(name) {
		var q = Meteor.users.update(this.userId,{
			$set : {
				"profile.username" : name
			}
		});
		console.log("Set username of",q,"users to",name);
	}



});
