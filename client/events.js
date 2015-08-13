
Template.join_room_warning.events({
	"click [data-intent=room_join]" : function(e,tmp) {
		Meteor.call("roomAddUser",Template.currentData()._id);
	}
});
//For czar
Template.playingfield.events({
	"click .card" : function(e,tmp) {
		cardId = this._id;
		var room = Template.currentData();

		if(room.czar === Meteor.userId()) {
			Meteor.call("cardPick",cardId);
		} else {
			console.warn("Tried to pick card without being czar");
		}
	}
});

//For non-czar
Template.user_hand.events({
	"click .card" : function(e,tmp) {
		cardId = this._id;
		var room = Template.currentData();


		if(Meteor.user().cards_played_this_round.length < room.cards_required_this_round) {
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
