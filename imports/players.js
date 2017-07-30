import requireDocument from "/imports/require_document.js";

var Players = (function(){
  var collection = new Mongo.Collection("players");
  
  function require(playerId) {
    return requireDocument(playerId,collection);
  }
  
  function create(roomId,userId) {
    check([userId,roomId],[String]);
    
    var player = {
      awesome_points : 0,
      hand: [],
      userId,
      roomId,
      playSet : []
    };
    
    return collection.insert(player);
  }
  
  function dealHand(playerId,cards) {
    require(playerId);
    collection.update({_id:playerId},{
      $addToSet : {hand: {$each : cards}}
    });
    
  }
  
  function findOne(...args) {
    return collection.findOne(...args);
  }
  
  function find(...args) {
    return collection.find(...args);
  }
  
  return {
    _collection : collection,
    dealHand,
    create,
    find,
    findOne
  };

  
}());

export default Players;