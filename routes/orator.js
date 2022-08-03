const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

const router = express.Router();

router.get('/',(req,res,next)=>{
    MongoClient.connect(url , (err,db)=>{
       if(err){
           throw err;
       }
       const dbo = db.db('iiitn_gymkhana');
       const query = {club: "orator"}
       dbo.collection('Eventdata').find(query).toArray((err,result)=>{
           if(err) throw err;

           
           res.render('clubs/orator',{result});
           db.close();
       }) 
   })
});

module.exports = router