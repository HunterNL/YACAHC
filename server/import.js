function importCards(url) {
	var returns = HTTP.get(url);
	var data = returns.data;
	if(!data) {
		throw new Meteor.Error("cahdb_httP_no_data","No data found at url",url,returns);
	}

	//Strip out list of cards
	var blackcards = data.blackCards;
	var whitecards = data.whiteCards;
	var order = data.order;

	delete data.blackCards;
	delete data.whiteCards;
	delete data.order;
	//data is now just an object with carddsets

	//Clear the database
	Cards.remove({});
	CardSets.remove({});

	//Can take a while, lets show a message
	console.info("Now importing cards, this can take a minute!");

	for(var key in data) {
		if(data.hasOwnProperty(key)) {
			var cardset = data[key];

			CardSets.insert({
				_id : key,
				name: cardset.name,
				icon: cardset.icon
			})

			var cardset_black = cardset.black;
			var cardset_white = cardset.white;

			for(var i=0;i<cardset_black.length;i++) {
				var cardId = cardset_black[i]
				var card = blackcards[cardId];

				Cards.insert({
					text: card.text,
					pick: card.pick,
					type: "q",
					set: key
				});
			}

			for(var i=0;i<cardset_white.length;i++){
				var cardId = cardset_white[i];
				var card = whitecards[cardId];

				Cards.insert({
					text: card,
					type:"a",
					set: key
				});

			}
		}
	}
	console.log("Done importing");
	console.log("Cards now contains",Cards.find().count(),"cards");
	console.log("CardSets now contrains",CardSets.find().count(),"cardsets");

}

Meteor.methods({
	import : function(url) {
		importCards(url);
	}
});
