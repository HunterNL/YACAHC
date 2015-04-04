Meteor.publish("room_single",function(roomId){
	return Rooms.find(roomId);
});

Meteor.publish("room_users",function(roomId){
	return Meteor.users.find({
		room: roomId
	});
});

Meteor.publish("room_cards",function(roomId){
	//TODO code me!
});

Meteor.publish("cardsets_all",function(){
	return CardSets.find();
});
