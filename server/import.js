function importCards(url) {
	var result = HTTP.get(url);
	// var data = returns.data;
	// if(!data) {
	// 	throw new Meteor.Error("cahdb_httP_no_data","No data found at url",url,returns);
	// }
	if(result.statusCode !== 200) {
		throw new Meteor.Error("import_invalid_code","server responded with statuscode "+result.statusCode+" ,expected 200");
	}
	
	var content = result.content;
	
	if(!content) {
		throw new Meteor.Error("import_no_data","server did not return data");
	}
	
	var cardData = JSON.parse(content);
	
	if(!cardData) {
		throw new Meteor.Error("import_parse_error","Could not parse card json");
	}
	
	

	//Strip out list of cards
	var blackcards = cardData.blackCards;
	var whitecards = cardData.whiteCards;
	var order = cardData.order;

	delete cardData.blackCards;
	delete cardData.whiteCards;
	delete cardData.order;
	//cardData is now just an object with carddsets

	//Clear the cardDatabase
	Cards.remove({});
	CardSets.remove({});

	//Can take a while, lets show a message
	console.info("Now importing cards, this can take a minute!");

	for(var key in cardData) {
		if(cardData.hasOwnProperty(key)) {
			var cardset = cardData[key];
			
			console.log(cardset);

			var cardset_black = cardset.black;
			var cardset_white = cardset.white;

			CardSets.insert({
				_id : key,
				name: cardset.name,
				icon: cardset.icon,
				black_count: cardset_black.length,
				white_count: cardset_white.length
			});
			
			var cardId;
			var card;
			var i;

			for(i=0;i<cardset_black.length;i++) {
				cardId = cardset_black[i];
				card = blackcards[cardId];

				Cards.insert({
					text: card.text,
					pick: card.pick,
					type: "q",
					set: key
				});
			}

			for(i=0;i<cardset_white.length;i++){
				cardId = cardset_white[i];
				card = whitecards[cardId];

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
