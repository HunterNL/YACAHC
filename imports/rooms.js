import requireDocument from "/imports/require_document.js";
import Players from "/imports/player.js";
import {HAND_SIZE} from "/imports/globals.js";

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
    return room.cardSets.includes(cardSet);
  }
  
  function addCardSet(roomId,cardSet) {
    collection.update({_id:roomId},{
      $push : {
        cardSets : setId
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
    if(!["startup","timeout"].includes(room.state)) {
      throw new Meteor.Error("room_invalid_state","Room not in state to state to start",{state:room.state});
    }
  }
  
  function findPlayers(roomId) {
    require(roomId);
    
    return Players.find({roomId}).fetch();
  }
  
  
  function findMissingHandCount(players) {
    return layers.reduce(function (last,cur) {
      return last+(HAND_SIZE-cur.hand.lenght);
    },0);
  }
  
  function createHandForPlayer(missingCardCount,cardsToPick) {
    
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
      return createHandForPlayer(missingCardCount,cards);
    })
    
  }
  
  function startRound(roomId) {
    var room = require(roomId);
    var players = findPlayers(roomId);
    
    requireValidRoundStartState(room);
    
    dealCards(room,players)
    
    
    
    
    
    collection.update({_id:roomId},{
      $set : {
        state : "playing"
      }
    });
    
  }
  
  return {
    _collection:collection,
    create,
    require,
    toggleCardSet,
    startRound
  };
  
}());

export default Rooms;




