var questionUtil = require('../data/questions');
var question = require('../model/question');
var Promises = require('promise');
var voteUtil = require('../data/votes');

module.exports = {
    getQuestions : function(req, res){

        questionUtil.getQuestions()
            .then((data) => {
                var r1 = {};
                for (var i in data) {
                    var o = data[i];
                    if (!(o.q_id in r1)) {
                        //console.log("in isde " + o.q_id);
                        r1[o.q_id] = {question : o.question};
                    } else {
                        //console.log("here");
                    }
                }
                for (var i in data) {
                    var o = data[i];
                    var obj = r1[o.q_id];
                    if (!("answers" in obj)) {
                        obj["answers"] = [];
                    }
                    var answer = {"id" : o.a_id, "answer" : o.answer};
                    obj["answers"].push(answer);
                }
                res.json({r1 : r1});
            })
            .catch((err) => {
                //console.log("error occured in geting question " , err);
                res.json({"success" : false, msg : "error occured in getting quesitons."});
            })
    },

    getQuestion : function(req, res) {
        var question_id = req.param('question_id');
        questionUtil.getQuestion(question_id)
            .then((data) => {
                console.log("qq: " + data);
                res.json({success: true, body: data, msg: "Successfully retrieved question."});
            }).catch((err) => {
                res.json({success: false, msg: "Error in retieving question data."});
            });
    },

    askQuestion : function(req, res) {
        //console.log("aq " + req);        

        var q1 = new question();
        q1.user_id = req.body.user_id;
        q1.is_anonymous = req.body.is_anonymous;
        q1.votes = 0;
        q1.question = req.body.name;
        q1.created_on = new Date();
        q1.updated_on = new Date();

        questionUtil.askQuestion(q1, req.body.name, function(err, resp){
            if (err) {
                //console.log("Not able to get questions from db.");
                res.json({success: false, msg: 'Failed to save question to db'});
            } else {
                //console.log("hi resp " + resp);
                res.json({success: true, body: resp, msg: 'Successfully saved question to db'});
            }
        });
    },

    editQuestion : function(req, resp) {
        var id = req.body.question_id;
        var name = req.body.name;
        var user_id = req.body.user_id;
        questionUtil.getQuestion(id)
            .then((q) => {
                if (q.user_id === user_id) {
                    questionUtil.editQuestion(q, name)
                        .then((data) => {
                            resp.json({success: true, msg: "updated succesfully"});
                        })
                        .catch(function (err) {
                            resp.json({success: false, msg: "failed to update to database."});
                        });
                } else {
                    resp.json({success: false, msg: "not the owner of the question"});
                }
            })
            .catch(function (err) {
                resp.json({success: false, msg: "error in fetching user details"});
            });
    },

    upvote : function(req, resp) {
        var type = 0;
        var user_id = req.body.user_id;
        var type_id = req.body.type_id;
        voteUtil.upvote(type, user_id, type_id, function (err, body) {
            if (err) {
                resp.json({success: false, msg: "error in getting upvotes."});
            } else {
                resp.json({success: true, msg: "Succesfully upvoted."});
            }
        });
    },

    downvote : function(req, resp) {

    }
}
