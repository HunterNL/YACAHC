Template.room.onCreated(function(){
	console.log("room_data",this);
});

Template.room.onRendered(function(){

});

Template.room.events({
	"click [data-intent=game_start]" : function(e,tmp) {
		Meteor.call("roomStartGame");
	}
});


Template.room.helpers({
	in_setup : function(){
		var room = Template.currentData();

		return (room.state === "setup");
	},

	in_game : function(){
		var room = Template.currentData();
		return (room.state !== "setup");
	},

	is_admin : function() {
		return (Meteor.userId() === Template.currentData().owner);
	},

	card_count : function() {
		return Cards.find().count(); //MAYBE dont rely on client >only< having room cards?
	},

	in_other_room : function(){
		return Meteor.user().room !== Template.currentData()._id;
	}
});
