var userFields = {
	room: 1,
	cards_played_this_round: 1
};

var privateUserFields = {
	hand : 1
};


Meteor.publish("room_single",function(roomId){
	return Rooms.find(roomId);
});

//All users in the given room
Meteor.publish("room_users",function(roomId){
	return Meteor.users.find({
		room: roomId
	},{
		fields: userFields
	});
});

//All cards used in given room
Meteor.publish("room_cards",function(roomId){

	if(!roomId) {
		throw new Meteor.Error("invalid_arguments_roomcards","Invalid arguments to room_cards publish",roomId);
	}

	var room = Rooms.findOne(roomId);

	if(!room) {
		throw new Meteor.Error("room_cards_no_room_found","room_cards publish did not find a room with given roomId",roomId);
	}

	var cardsets = room.cardsets;

	return Cards.find({
		set : {
			$in : cardsets
		}
	});

});

//Publish custom user data
Meteor.publish(null,function(){
	return Meteor.users.find(this.userId,{
		fields : privateUserFields
	});
});

Meteor.publish("cardsets_all",function(){
	return CardSets.find();
});
