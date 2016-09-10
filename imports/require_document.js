export function requireDocument(id,collection) {
  var doc = collection.find({_id:id});
  if(!doc) {
    throw new Meteor.Error("document_not_found","Document could not be found",{id,collection});
  }
  return doc;
}