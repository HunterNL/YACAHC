Template.room_page.onCreated(function(){
	var roomId = FlowRouter.getParam("roomId");
	this.subscribe("room_single",roomId);
	this.subscribe("room_users",roomId);
});

Template.room_page.onRendered(function(){

});

Template.room_page.events({

});

Template.room_page.helpers({
	roomdata : function () {
		var roomId = FlowRouter.getParam("roomId");
		console.log("roomdata called",roomId);
		return Rooms.find(roomId).fetch()[0];
	}
});
