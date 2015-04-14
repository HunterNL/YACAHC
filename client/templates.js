//Subscribe to the card collection when game starts (and cardset selection is final)
Template.playingfield.onCreated(function(){
	var room = Template.currentData();
	this.subscribe("room_cards",room._id);
});

//When showing cardset selection, subscribe to all cardssets
Template.cardsetselection.onCreated(function(){
	this.subscribe("cardsets_all");
});
