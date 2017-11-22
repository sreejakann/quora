"use strict";
// NPM install mongoose and chai. Make sure mocha is globally
// installed
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const chai = require('chai');
const expect = chai.expect;
// Create a new schema that accepts a 'name' object.
const User = require('../../model/user');
const Ques = require('../../model/question');
const Ques_user = require('../../model/question_user');
const Ques_ans = require('../../model/question_answer');
const Ans = require('../../model/answer');
const Ans_user = require('../../model/answer_user');
const UserUtil = require('../../data/users');
const QuesUtil = require('../../data/questions');
const AnsUtil = require('../../data/answers');
//Create a new collection called 'Name'
describe('Database Tests', function() {
  //Before starting the test, create a sandboxed database connection
  //Once a connection is established invoke done()
  before(function (done) {
    mongoose.connect('mongodb://localhost:27017/testDatabase', { useMongoClient: true });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', function() {
    //   console.log('We are connected to test database!');
      done();
    });
  });
  
  describe('Test Database', function() {
    it('Database is connected.', function(done) {
        done();
    });
    //Save object with 'name' value of 'Mike"
    it('New user saved to test database', function(done) {
      var testName = User({
        name: 'Mike',
        username: 'mika',
        email: 'mika@ufl.edu',
        password: 'mikamike'
      }); 
      UserUtil.addUser(testName, done);
    });

    it('Should authenticate the above added user', function(done){
      UserUtil.getUserbyname('mika', function(err, user){
        UserUtil.comparePassword('mikamike', user.password,err => {
          if(err) { throw new Error('Should generate error!'); }
          done();
        });
      });
      
    });

    it('Should retrieve user details from test database', function(done) {
        //Look up the 'Mike' object previously saved.
        User.findOne({name: 'Mike'}, (err, user) => {
          if(err) {throw err;}
          if(user.length === 0) {throw new Error('No data!');}
          done();
        });
    });

    it('Check unique key constraint on username', function(done) {
      //Attempt to save with wrong info. An error should trigger
      var wrongSave = User({
        name: 'Mike1',
        username: 'mika',
        email: 'mika1@ufl.edu',
        password: 'mikamike1'
      });
      UserUtil.addUser(wrongSave, err => {
        if(err) { return done(); }
        throw new Error('Should generate error!');
      });
    });
    
    it('Check unique key constraint on email', function(done) {
        //Attempt to save with wrong info. An error should trigger
        var wrongSave = User({
          name: 'Mike1',
          username: 'mika1',
          email: 'mika@ufl.edu',
          password: 'mikamike1'
        });
        UserUtil.addUser(wrongSave, err => {
          if(err) { return done(); }
          throw new Error('Should generate error!');
        });
      });
      
    it('Test find all method in users', function(done) {
      //Look up the 'Mike' object previously saved.
      User.find({}, (err, user) => {
        if(err) {throw err;}
        if(user.length === 0) {throw new Error('No data!');}
        // console.log(user.email);
        done();
      });
    });

    //it('New question saved to test database', function(done){
    //  var q1 = Ques();
    //  q1.is_anonymous = false;
    //  q1.votes = 0;
    //  q1.created_on = new Date();
    //  q1.updated_on = new Date();
 
    //  QuesUtil.askQuestion(q1, 'Is question api working?', done);
    //}); 

    it('Ask a question', function(done){
      var q1 = Ques({
        user_id: '12',
        is_anonymous: 'true',
        name: 'When did the great war start?'
      }); 
      QuesUtil.askQuestion(q1,'When did the great war start?',done);
    });

    it('Check for question in database', function(done){
      var q1 = Ques({
        user_id: '12',
        is_anonymous: 'true',
        name: 'When did the great war start?'
      }); 
      QuesUtil.askQuestion(q1,'When did the great war start?',function(err,resp){
        var id = resp.id;
        Ques.findById(id, (err, ques) => {
          //console.log("QUESTION OBJ is: "+ques);
          //check for null ans object!!!!!!
          if(err) {throw err;}
          if(ques==null || ques.length === 0) {throw new Error('No data!');}
          done();
        });
      });
    });

    it('Check for question mapping in question_users schema', function(done){
      var q1 = Ques({
        user_id: '12',
        is_anonymous: 'true',
        name: 'When did the great war start?'
      }); 
      QuesUtil.askQuestion(q1,'When did the great war start?',function(err,resp){
        var id = resp.id;
        Ques_user.findOne({q_id:id}, (err, ques) => {
          //console.log("QUESTION OBJ is: "+ques);
          //check for null ans object!!!!!!
          if(err) {throw err;}
          if(ques==null || ques.length === 0) {throw new Error('No data!');}
          done();
        });
      });
    });

    it('Edit a question', function(done){

      var q1 = Ques({
        user_id: '12',
        is_anonymous: 'true',
        name: 'When did the great war start?'
      }); 
      QuesUtil.askQuestion(q1,'When did the great war start?',function(err,resp){
        //console.log("RESP IS; "+JSON.stringify(resp));
        var id = resp.id;
        var name = "When did the world war 1 started?";
        var user_id = resp.user_id;
        QuesUtil.getQuestion(id, function(err, ques){
          if(ques.user_id != user_id) { throw new Error('Should generate error!');}
          QuesUtil.editQuestion(ques.e_id, name,err => {
            if(err) { throw new Error('Should generate error!'); }
            done(); 
          });
        });
        done();
      }); 
    });

    it('Answer a question',function(done){
      var ans = Ans({
        user_id: '11',
        is_anonymous: 'true',
        votes: '0',
        created_on: new Date(),
        updated_on: new Date()
      });
      var question_id = "12";
      var name = "Great war was started on 1914.";
      AnsUtil.putAnswer(ans,question_id,name,err => {
        if(err) {throw new Error('Should generate error!'); }
        done();
      });
    });

    it('Check for Answer in database', function(done){
      var ans = Ans({
        user_id: '11',
        is_anonymous: 'true',
        votes: '0',
        created_on: new Date(),
        updated_on: new Date()
      });
      var question_id = "12";
      var name = "Great war was started on 1914.";

      AnsUtil.putAnswer(ans,question_id,name,function(err,resp){
        var id = resp.id;
        Ans.findById(id, (err, ans) => {
          //console.log("ANSWER OBJ is: "+ans);
          //check for null ans object!!!!!!
          if(err) {throw err;}
          if(ans==null || ans.length === 0) {throw new Error('No data!');}
          done();
        });
      });
    });

    it('Check for Answer mapping in queston_answers database', function(done){
      var ans = Ans({
        user_id: '11',
        is_anonymous: 'true',
        votes: '0',
        created_on: new Date(),
        updated_on: new Date()
      });
      var question_id = "12";
      var name = "Great war was started on 1914.";

      AnsUtil.putAnswer(ans,question_id,name,function(err,resp){
        var id = resp.id;
        Ques_ans.findOne({a_id: id}, (err, ans) => {
          //console.log("QUESTION_ANSWER OBJ is: "+ans);
          //check for null ans object!!!!!!
          if(err) {throw err;}
          if(ans==null || ans.length === 0) {throw new Error('No data!');}
          done();
        });
      });
    });

    it('Edit an Answer',function(done){
      var ans = Ans({
        user_id: '11',
        is_anonymous: 'true',
        votes: '0',
        created_on: new Date(),
        updated_on: new Date()
      });
      var question_id = "12";
      var name = "Great war was started on 1914.";

      AnsUtil.putAnswer(ans,question_id,name,function(err,resp){
        var id = resp.id;
        var user_id = resp.user_id;
        var answer = "Great war was started on July 28th, 1914.";
        AnsUtil.getAnswer(id, function(err, a){
          if(a.user_id != user_id) { throw new Error('Should generate error!');}
          AnsUtil.editAnswer(a.e_id, answer,err => {
            if(err) { throw new Error('Should generate error!'); }
            done(); 
          });
        });
        done();
      }); 
    });

    // it('Should retrieve question details from test database', function(done) {
    //   //Look up the 'ques' object previously saved.
    //   Ques.findOne({question: 'Is question api working?'}, (err, ques) => {
    //     if(err) {throw err;}
    //     if(ques.length === 0) {throw new Error('No data!');}
    //     done();
    //   });
    // });

    // it('Should retrieve list of all questions from test database', function(done) {
    //   QuesUtil.getQuestions(err => {
    //     if(err) { throw new Error('Should generate error!'); }
    //     done();
    //   });
    // });

  });
  //After all tests are finished drop database and close connection
  after(function(done){
    mongoose.connection.db.dropDatabase(function(){
      mongoose.connection.close(done);
    });
  });
});