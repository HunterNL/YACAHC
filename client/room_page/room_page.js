Template.room_page.onCreated(function(){
	this.subscribe("room_single");
	this.subscribe("room_users");
});

Template.room_page.onRendered(function(){

});

Template.room_page.events({

});

Template.room_page.helpers({
	roomdata : function () {
		console.log("roomdata called");
		return Rooms.find(FlowRouter.getParam("roomId")).fetch()[0];
	}
});
