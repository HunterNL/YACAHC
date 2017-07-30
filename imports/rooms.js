import requireDocument from "/imports/require_document.js";
import Players from "/imports/players.js";
import {HAND_SIZE} from "/imports/globals.js";
import Cards from "/imports/cards.js";

var Rooms = (function(){
  var collection = new Mongo.Collection("rooms");
  
  function require(roomId) {
    return requireDocument(roomId,collection);
  }
  
  function create(ownerId) {
    check(ownerId,String);
    
    var room = {
			owner: ownerId,
      users : [ownerId],
			dateCreated : new Date(),
			state: "setup",
			cardSets : [],
			discardedCards : [],
			cardPile : []
		};
    
    return collection.insert(room);
  }
  
  function userCanJoin(room,user) {
    return room.state === "setup";
  }
  
  function addUser(roomId,userId) {
    var room = require(roomId);
    var user = requireDocument(userId,Meteor.users);
    
    if(!userCanJoin(room,user)) {
      throw new Meteor.Error("room_cannot_join");
    }
    
    if(Players.findOne({roomId,userId})) {
      throw new Meteor.Error("player_already_exsists");
    }
    
    return Players.create(roomId,userId);
  }
  
  function hasCardSet(room,cardSet) {
    console.log(room);
    return room.cardSets.includes(cardSet);
  }
  
  function addCardSet(roomId,cardSetId) {
    collection.update({_id:roomId},{
      $push : {
        cardSets : cardSetId
      }
    });
  }
  
  function removeCardSet(roomId,cardSet) {
    collection.update({_id:roomId},{
      $pull : {
        cardsets: setId
      }
    });
  }
  
  function toggleCardSet(roomId,cardSetId) {
    var room = require(roomId);
    
    if(hasCardSet(room,cardSetId)) {
      removeCardSet(roomId,cardSetId);
    } else {
      addCardSet(roomId,cardSetId);
    }
  }
  
  function requireValidRoundStartState(room) {
    if(!["setup","timeout"].includes(room.state)) {
      throw new Meteor.Error("room_invalid_state","Room not in state to state to start",{state:room.state});
    }
  }
  
  function findPlayers(roomId) {
    require(roomId);
    
    return Players.find({roomId}).fetch();
  }
  
  
  function findMissingHandCount(players) {
    return players.reduce(function (last,cur) {
      return last+(HAND_SIZE-cur.hand.lenght);
    },0);
  }
  
  function createHandForPlayer(missingCardCount,cardsToPick) {
    var hand = [];
    _.times(missingCardCount,function () {
      hand.push(removeRandomElementFromArray(cardsToPick));
    });
    
    return {player,hand};
  }
  
  function dealCards(room,players) {
    var missingHandCount = findMissingHandCount(players);
    
    var cards = Cards.gather({
      count:missingHandCount,
      blacklist:room.discardCards,
      inSets:room.cardSets
    });
    
    var cardsToDeal = players.map(function (player) {
      var missingCardCount = HAND_SIZE-player.hand.length;
      return createHandForPlayer(player,missingCardCount,cards);
    });
    
   cardsToDeal.map(function (entry) {
     var {player,hand} = entry;
     
     Players.dealHand(player._id,hand);
   });
    
    
  }
  
  function startRound(roomId) {
    var room = require(roomId);
    var players = findPlayers(roomId);
    
    requireValidRoundStartState(room);
    
    dealCards(room,players);
    
    collection.update({_id:roomId},{
      $set : {
        state : "playing"
      }
    });
    
  }
  function find(...args) {
    return collection.find(...args);
  }
  
  function findOne(...args) {
    return collection.findOne(...args);
  }
  
  return {
    _collection:collection,
    create,
    require,
    toggleCardSet,
    startRound,
    addUser,
    find,
    findOne
  };
  
}());

export default Rooms;




