Template.room.helpers({
	in_setup : function(){
		var room = Template.currentData();

		return (room.state === "setup");
	},

	in_game : function(){
		var room = Template.currentData();
		return (room.state === "playing");
	},

	is_admin : function() {
		return (Meteor.userId() === Template.currentData().owner);
	},

	card_count : function() {
		return Cards.find().count();
	}
});

Template.room.events({
	"click [data-intent=game_start]" : function(e,tmp) {
		Meteor.call("roomStartGame");
	}
});

Template.playingfield.onCreated(function(){
	var room = Template.currentData();
	this.subscribe("room_cards",room._id);
});

//a = answer = white, q=question=black
Template.playingfield.helpers({

	//Find not discarded white (answer) cards
	white_cards : function(){
		var discarded_cards = Template.currentData().discarded_cards;

		return Cards.find({
			type:"a",
			_id : {
				$nin : discarded_cards
			}
		});
	},

	//Find not discared black (question) cards
	black_cards : function(){
		var discarded_cards = Template.currentData().discarded_cards;

		return Cards.find({
			type:"q",
			_id : {
				$nin : discarded_cards
			}
		});
	}
});

//When showing cardset selection, subscribe to all cardssets
Template.cardsetselection.onCreated(function(){
	this.subscribe("cardsets_all");
});

Template.cardsetselection.helpers({
	"cardsets" :  function() {
		return CardSets.find();
	}
});

Template.user_hand.helpers({
	user_hand_cards : function() {
		return Cards.find({
			_id : {
				$in : Meteor.user().hand
			}
		});
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

Template.card.events({
	"click div" : function(e,tmp) {
		var card = Template.currentData();
		Meteor.call("cardDiscard",card._id) ;
	}
});
