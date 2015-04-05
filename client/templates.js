Template.room.helpers({
	in_setup : function(){
		var room = Template.currentData();

		return room.state === "setup";
	},

	is_admin : function() {
		return (Meteor.userId() === Template.currentData().owner);
	},

	card_count : function() {
		return Cards.find().count();
	}
});


Template.cardsetselection.onCreated(function(){
	this.subscribe("cardsets_all");
});

Template.playingfield.onCreated(function(){
	this.subscribe("room_cards");
});

Template.cardsetselection.helpers({
	"cardsets" :  function() {
		return CardSets.find();
	}
});


Template.cardselection_card.helpers({
	activeClass : function() {
		//If room.cardsets contains this card set, return "active", so the css
		//	can make look active
		return ((Template.parentData().cardsets.indexOf(Template.currentData()._id) > -1)?"active":"");
	},

	adminClass : function() {
		//If local user is admin, return "admin" so css can make this look pressable
		return ((Meteor.userId()==Template.parentData().owner)?"admin":"");
	}
});

Template.cardselection_card.events({
	"click .cardsetselection" : function(e,tmp) {
		if(Meteor.userId() === Template.parentData().owner) {
			Meteor.call("roomToggleCardSet",Template.currentData()._id);
		}
	}
});
