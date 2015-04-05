var userFields = {
	room: 1
};

Meteor.publish("room_single",function(roomId){
	return Rooms.find(roomId);
});

Meteor.publish("room_users",function(roomId){
	return Meteor.users.find({
		room: roomId
	},{
		fields: userFields
	});
});

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

Meteor.publish(null,function(){
	return Meteor.users.find(this.userid,{
		fields : userFields
	}); //Make sure to publish custom data
});

Meteor.publish("cardsets_all",function(){
	return CardSets.find();
});
