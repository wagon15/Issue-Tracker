/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
    // check query param
      let dbInput = {...req.query};
      if(dbInput.hasOwnProperty('_id')) {
        try{
          dbInput._id = ObjectId(dbInput._id);
        } catch(err){
          return res.send('_id error');
        }
      }
        
    //retrive data
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        if(err) console.log('Database error: ' + err);
        else {
          console.log('Successful database connection');
          var cursor = db.collection(project)
            .find(dbInput).toArray( (err, dbRes) => {
              if(err) console.log('Find error');
              res.json(dbRes);
              
            });
        }
      });
      
    })
    
    .post(function (req, res){
      var project = req.params.project;
      // check required fields
      if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by)
        return res.send('required field empty');
    
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        if(err) console.log('Database error: ' + err);
        else {
          console.log('Successful database connection');
          console.log(req.body.issue_title);
          db.collection(project)
            .insertOne({
              issue_title: req.body.issue_title,
              issue_text:  req.body.issue_text,
              created_by:  req.body.created_by,
              assigned_to: req.body.assigned_to||'',
              status_text: req.body.status_text||'',
              created_on:  new Date(),
              updated_on:  new Date(),
              open:        true
              }, (err, dbRes) => {
                return res.json(dbRes.ops[0]);
              });
        }
      });
      
    })
    
    .put(function (req, res){
      var project = req.params.project;
    
      // check if any data provided and filter
      let dbInput = { ...req.body };

      Object.keys(dbInput).forEach(elem => {
          if( dbInput[elem] == '' || elem == '_id')
              delete dbInput[elem];
      })
      // connect to DB
      if(Object.keys(dbInput).length > 0) {
        
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
        if(err) console.log('Database error: ' + err);
        else {
          console.log('Successful database connection');
          let val;
          try {
             val = ObjectId(req.body._id);
          }
          catch(err){
            if(err) return res.send('could not update '+req.body._id);
        }
          db.collection(project)
            .updateOne(
              {
                _id: val 
              }, {$set: {
                ...dbInput,
                updated_on:  new Date()
              }}, (err, dbRes) => {
                if(err) {
                  console.log('Update errot: ' + err);
                  return res.send('could not update '+req.body._id);
                }
                return res.send('successfully updated');
              });
        }
      });
      }
      else
        return res.send('no updated field sent');
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      
    if(req.body._id == '' || req.body._id == undefined)
      return res.send('_id error');
    let val;
    try {
      val = ObjectId(req.body._id);
    } catch(err){
      if(err) return res.send('could not update '+req.body._id);
    }
    
    //delete issue
    MongoClient.connect(CONNECTION_STRING, function(err, db) {
        if(err) console.log('Database error: ' + err);
        else {
          console.log('Successful database connection');
          db.collection(project)
            .deleteOne(
              {_id: val}, 
              (err, dbRes) => {
                if(err) return res.send('could not update '+req.body._id);
                return res.send('deleted '+req.body._id);
              });
        }
      });
    
    });
    
};
