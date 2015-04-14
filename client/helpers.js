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


//a = answer = white, q=question=black
Template.playingfield.helpers({

	czar : function() {
		return Meteor.users.findOne(Template.currentData().czar);
	},

	is_czar : function() {
		return (Meteor.userId() === Template.currentData().czar);
	},

	card_pile : function() {
		var room = Template.currentData();

		return Cards.find({
			_id : {$in : room.card_pile}
		});
	},

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
	},

	black_card : function() {
		console.log(Template.currentData());
		return Cards.findOne(Template.currentData().black_card);
	}
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
