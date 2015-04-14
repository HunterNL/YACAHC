Template.room.events({
	"click [data-intent=game_start]" : function(e,tmp) {
		Meteor.call("roomStartGame");
	}
});

Template.join_room_warning.events({
	"click [data-intent=room_join]" : function(e,tmp) {
		Meteor.call("roomAddUser",Template.currentData()._id);
	}
});

Template.user_hand.events({
	"click .card" : function(e,tmp) {
		cardId = this._id;

		if(Meteor.user().cards_played_this_round < 1) {
			Meteor.call("cardPlay",cardId);
		} else {
			console.log("Already played a card "); //TODO Handle this nicer
		}
	}
});

Template.cardselection_card.events({
	"click .cardsetselection" : function(e,tmp) {
		if(Meteor.userId() === Template.parentData().owner) {
			Meteor.call("roomToggleCardSet",Template.currentData()._id);
		}
	}
});
