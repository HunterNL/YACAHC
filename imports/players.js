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
  
  function findOne(...args) {
    return collection.findOne(...args);
  }
  
  function find(...args) {
    return collection.find(...args);
  }
  
  return {
    _collection : collection,
    create
  };

  
}());

export default Players;