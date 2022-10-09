// 'use strict'
// const fs = require('fs')
// const express = require('express')
// const { MongoClient, ObjectId } = require('mongodb')
// let PORT = 3000
// const mongo_file = "./config/mongo.json"
// const app = express();

// const handed_enum = {
//     'left' : 'L', 
//     'right' : 'R', 
//     'ambi' : 'A'
// }

// const handed_enum_r = {
//     'L' : 'left', 
//     'R' : 'right', 
//     'A' : 'ambi'
// }

// function check_valid_config(mongo_file){
//     try{
//         JSON.parse(fs.readFileSync(mongo_file))
//     }
//     catch{
//         return false
//     }
//     return true 
// }
   
// class PlayerSourceJson {

//     constructor(mongo_file) {
//         this.config = {}
//         this.collection = "players"
//         try{
//             this.config = require(mongo_file)
//         }
//         catch{
//             this.config = {
//                 "host": "localhost",
//                 "port": "27017",
//                 "db": "ee547_hw",
//                 "opts": {
//                     "useUnifiedTopology": true
//                 }
//             }
//         }
//         this.client = new MongoClient(`mongodb://${this.config.host}:${this.config.port}`, this.config.opts)
//     }

    
//     getPlayer(pid, callback) {
//         this.client.connect((err, connect) => {
//             if(!err){
//                 let db = this.client.db(this.config.db)
//                 db.collection(this.collection).findOne({_id:ObjectId(pid)}, (err, data) => {
//                     if(!err){
//                         if(data){
//                             connect.close()
//                             callback(null, data[0])
//                         }
//                         else{
//                             connect.close()
//                             callback(true,null)
//                         }
//                     }
//                     else{
//                         connect.close()
//                         callback(err,null)
//                     }
//                 })
//             }
//             else{
//                 process.exit(5)
//             }
//         })

//     }

//     createPlayer(fname, lname, handed, initial_balance_usd, callback) {      
//         this.client.connect((err, connect) => {
//             if(!err){
//                 let db = this.client.db(this.config.db)
//                 db.createCollection(this.collection, (err, collection) => {
//                     let player = {
//                         fname: fname, 
//                         lname: lname, 
//                         handed: handed_enum[handed], 
//                         is_active: true, 
//                         balance_usd: Number(initial_balance_usd).toFixed(2),
//                     }
//                     db.collection(this.collection).insertOne(player,(err, data) => {
//                         if(!err){
//                             connect.close()
//                             callback(null, data.insertedId)
//                         }
//                         else{
//                             connect.close()
//                             callback(err, null)
//                         }
//                     })
//                 })
//             }
//             else{
//                 process.exit(5)
//             }
//         })
//     }


//     updatePlayer(pid, lname, is_active, callback) {
//         this.client.connect((err, connect) => {
//             if(!err){
//                 let db = this.client.db(this.config.db)
//                 let update_dict = {$set:{}}
//                 if(lname != null){
//                     update_dict.$set.lname = lname
//                 }
//                 if(is_active != null){
//                     update_dict.$set.is_active = is_active
//                 }
//                 db.collection(this.collection).updateOne({_id:ObjectId(pid)}, update_dict, (err, data) => {
//                     if(!err){
//                         if(data.matchedCount>0){
//                             connect.close()
//                             callback(null, data)
//                         }
//                         else{
//                             connect.close()
//                             callback(true, null)
//                         }
//                     }
//                     else{
//                         connect.close()
//                         callback(err, null)
//                     }
                
//                 })
//             }
//             else{
//                 process.exit(5)
//             }
//         })
//     }

//     deletePlayer(pid, callback) {
//         this.client.connect((err, connect)=> {
//             if(!err){
//                 let db = this.client.db(this.config.db)
//                 db.collection(this.collection).deleteOne({_id:ObjectId(pid)}, (err, data) => {
//                     if(!err){
//                         if(data.deletedCount>0){
//                             connect.close()
//                             callback(null,data)
//                         }
//                         else{
//                             connect.close()
//                             callback(true,null)
//                         }
//                     }
//                     else{
//                         connect.close()
//                         callback(err,null)
//                     }
//                 })
//             }
//             else{
//                 callback(err, null)
//             }
//         })
//     }

//     async getBalance(pid, deposit_value, callback){
//         this.client.connect(async(err, connect) => {
//             if (!err){
//                 let db = this.client.db(this.config.db)
//                 let player = await db.collection(this.collection).findOne({_id:ObjectId(pid)})
//                 if(player){
//                     let return_dict = { 'old_balance_usd': player?.balance_usd, 'new_balance_usd': null}
//                     let update_dict = {$set:{}}
//                     if(deposit_value!=null){
//                         update_dict.$set.balance_usd = (Number(player?.balance_usd) + (deposit_value > 0 ? deposit_value : 0 )).toFixed(2) 
//                         return_dict.new_balance_usd = update_dict.$set.balance_usd
//                     }
//                     db.collection(this.collection).updateOne({_id:ObjectId(pid)}, update_dict, (err, data) => { 
//                         if(!err){
//                             if(data.matchedCount>0){
//                                 connect.close()
//                                 callback(null, return_dict)
//                             }
//                             else{
//                                 connect.close()
//                                 callback(true,null)
//                             }
//                         }
//                         else{
//                             connect.close()
//                             callback(err,null)
//                         }
//                     })
//                 }
//                 else{
//                     connect.close()
//                     callback(true,null)
//                 }
//             }
//             else{
//                 process.exit(5)
//             }
//         })
//     }

//     getPlayers(callback){
//         this.client.connect((err, connect) => {
//             if(!err){
//                 let db = this.client.db(this.config.db)
//                 db.collection(this.collection).find().toArray((err, data) => {
//                     if(!err){
//                         let players = this._formatPlayer(data)
//                         players.sort((a,b) => {
//                             if(a.name<b.name){
//                                 return -1 
//                             }
//                             if(a.name>b.name){
//                                 return 1 
//                             }
//                             return 0 
//                         })
//                         connect.close()
//                         callback(null, players )
//                     }
//                     else{
//                         connect.close()
//                         callback(err, null)
//                     }
//                 })
//             }
//             else{
//                 process.exit(5)
//             }
//         })
//     }

//     _formatPlayer(player){
//         if(player==null){
//             return null
//         }
//         if(Array.isArray(player)){
//             return player.map(this._formatPlayer)
//         }
//         else{
//             let return_dict ={
//                 pid: player._id, 
//                 name: `${player.fname}${player.lname ? ` ${player.lname}`:''}`,
//                 handed: handed_enum_r[player.handed], 
//                 is_active: player.is_active, 
//                 balance_usd: player.balance_usd 
//             }
//             return return_dict
//         }
//     }
// }

// app.get('/ping',(req, res) => {
//     res.sendStatus(204)
// })

// app.get('/player',(req, res) => {
//     let player_data = new PlayerSourceJson(mongo_file)
//     player_data.getPlayers((err, data) => {
//         if(!err){
//             res.status(200).send(JSON.stringify(data))
//             return
//         }
//     })
// })

// app.get('/player/:pid', (req,res) => {
//     let player_data = new PlayerSourceJson(mongo_file)
//     player_data.getPlayer(req.params.pid, (err,data) =>{
//         if(!err){
//             let player = player_data._formatPlayer(data)
//             res.status(200).send(JSON.stringify(player));
//             return
//         }
//         else{
//             let player = null 
//             res.sendStatus(404)
//             return
//         }
//     })
// })

// app.delete('/player/:pid', (req,res) => {
//     let player_data = new PlayerSourceJson(mongo_file)
//     player_data.deletePlayer(req.params.pid, (err,data) =>{
//         if(!err){
//             res.redirect(303, '/player')
//             return
//         }
//         else{
//             res.sendStatus(404)
//             return
//         }
//     })
// })

// app.post('/player', (req, res) => {
//     let player_data = new PlayerSourceJson(mongo_file)
//     let fname = req.query?.fname
//     let lname = req.query?.lname
//     let handed = req.query?.handed
//     let initial_balance_usd = req.query?.initial_balance_usd
//     let resBody ='invalid_fiels:'
//     let error = false 
//     if(!(/^[a-zA-Z]+$/.test(fname))){
//         resBody += 'fname'
//         error = true 
//     }
//     if(lname != undefined && !(/(^[a-zA-Z]+$)*/.test(lname))){
//         console.error(`lname: ${lname}`)
//         resBody += 'lname'
//         error = true 
//     }
//     if(!(['left', 'right', 'ambi'].includes(handed.toLowerCase()))){
//         resBody += 'handed'
//         error = true 
//     }
//     if(isNaN(Number(initial_balance_usd)) || 
//     Number(initial_balance_usd) < 0 ||  
//     Number(initial_balance_usd) !=  Number(Number(initial_balance_usd).toFixed(2))) {
//         result += 'initial_balance_usd'; 
//         error = true; 
//     }
//     if(!error){
//         player_data.createPlayer(fname, lname, handed_enum[handed.toLowerCase()], initial_balance_usd,
//         (err, data) => {
//             if(!err){
//                 res.redirect(303, `/player/${data}`)
//             }
//         })
//     }
//     else{
//         res.status(422).send(resBody)
//     }  
// })

// app.post('/player/:pid', (req,res) => {
//     let player_data = new PlayerSourceJson(mongo_file)
//     let is_active = req.query?.active
//     let lname = req.query?.lname 
//     let error = false 
//     if(is_active != undefined && ['1', 'true', 't'].includes(is_active.toLowerCase())){
//         is_active = true
//     }
//     else{
//         is_active = false
//     }
//     if(lname != undefined && !(/(^[a-zA-Z]+$)*/.test(lname))){
//         error = true; 
//     }
//     if(!error){
//         player_data.updatePlayer(req.params.pid, lname, is_active, null, 
//         (err, data) => {
//             if(!err){
//                 res.redirect(303, `/player/${req.params.pid}`)
//                 return
//             }
//             else{
//                 res.sendStatus(404)
//                 return 
//             }
//         })
//     }
//     else{
//         res.sendStatus(422);
//         return
//     }
// })

// app.post('/deposit/player/:pid', function (req, res) {
//     let player_data = new PlayerSourceJson(mongo_file)
//     deposit_value = req.query?.amount_usd
//     let pid = req.params.pid
//     if(isNaN(Number(deposit_value)) || 
//     Number(deposit_value) < 0 ||  
//     Number(deposit_value) !=  Number(Number(deposit_value).toFixed(2))) {
//         res.sendStatus(400)
//         return
//     }
//     player_data.getBalance(pid, Number(deposit_value), (err, data) => {
//         if(!err){
//             res.status(200).send(JSON.stringify(data))
//         }
//         else{
//             res.sendStatus(404)
//         }
//     })
// })

// // if(!check_valid_config(mongo_file)){
// //     process.exit(2)
// // }

// app.listen(PORT, ()=>{});


'use strict';
const express = require('express');
const fs = require('fs');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
const mongo_file = "./config/mongo.json"
let PORT = 3000;

const handed_enum = {
    'left' : 'L', 
    'right' : 'R', 
    'ambi' : 'A'
}

const handed_enum_r = {
    'L' : 'left', 
    'R' : 'right', 
    'A' : 'ambi'
}

function check_valid_config(file){
    try{
        JSON.parse(fs.readFileSync(file))
    }
    catch{
        return false
    }
    return true 
}
   
class PlayerSourceJson {

    constructor(file) {
        this.config = {}
        try{
            this.config = require(file)
        }
        catch{
            this.config = {
                "host": "localhost",
                "port": "27017",
                "db": "ee547_hw",
                "opts": {
                    "useUnifiedTopology": true
                }
            }
        }
        this.uri = `mongodb://${this.config.host}:${this.config.port}`
        this.client = new MongoClient(this.uri, this.config.opts)
        this.collection = "player"
    }

    getPlayer(pid, callback) {
        this.client.connect((err, connect) => {
            if(!err){
                let db = this.client.db(this.config.db)
                db.collection(this.collection).find({"_id":ObjectId(pid)}).toArray((err, data) => {
                    if(!err){
                        if(data.length>0){
                            connect.close()
                            callback(null, data[0])
                        }
                        else{
                            connect.close()
                            callback(true, null)
                        }
                     }
                    else{
                        connect.close()
                        callback(err, null)
                    }
                })
            }
            else{
                process.exit(5)
            }
        })
    }

    createPlayer(fname, lname, handed, initial_balance_usd, callback) {      
        this.client.connect((err, connect) => {
            if(!err){
                let db = this.client.db(this.config.db)
                db.createCollection(this.collection, (err, collection) => {
                    let player = {
                        fname: fname, 
                        lname: lname, 
                        handed: handed_enum[handed], 
                        is_active: true, 
                        created_at: new Date(),
                        balance_usd: Number(initial_balance_usd).toFixed(2)
                    }
                    db.collection(this.collection).insertOne(player,(err, data) => {
                        if(!err){
                            connect.close()
                            callback(null, data.insertedId)
                        }
                        else{
                            connect.close()
                            callback(err, null)
                        }
                    })
                })
            }
            else{
                callback(err, null)
            }
        })
    }

   
    updatePlayer(pid, lname, is_active, callback) {
        this.client.connect((err, connect) => {
            if(!err){
                let db = this.client.db(this.config.db)
                let update_dict = {$set:{}}
                if(lname != null){
                    update_dict.$set.lname = lname
                }
                if(is_active != null){
                    update_dict.$set.is_active = is_active
                }
                db.collection(this.collection).updateOne({_id:ObjectId(pid)}, update_dict, (err, data) => {
                    if(!err){
                        if(data.matchedCount>0){
                            connect.close()
                            callback(err, null)
                        }
                        else{
                            connect.close()
                            callback(true, null)
                        }
                    }
                    else{
                        connect.close()
                        callback(err, null)
                    }
                
                })
            }
            else{
                process.exit(5)
            }
        })
    }

    deletePlayer(pid, callback) {
        this.client.connect((err, connect)=> {
            if(!err){
                let db = this.client.db(this.config.db)
                db.collection(this.collection).deleteOne({_id:ObjectId(pid)}, (err, data) => {
                    if(!err){
                        if(data.deletedCount>0){
                            connect.close()
                            callback(null,data)
                        }
                        else{
                            connect.close()
                            callback(true,null)
                        }
                    }
                    else{
                        connect.close()
                        callback(err,null)
                    }
                })
            }
            else{
                callback(err, null)
            }
        })
    }

    async getBalance(pid, deposit_value, callback){
        this.client.connect(async(err, connect) => {
            if (!err){
                let db = this.client.db(this.config.db)
                let player = await db.collection(this.collection).findOne({_id:ObjectId(pid)})
                if(player){
                    let return_dict = { 'old_balance_usd': player?.balance_usd, 'new_balance_usd': null}
                    let update_dict = {$set:{}}
                    if(deposit_value!=null){
                        update_dict.$set.balance_usd = (Number(player?.balance_usd) + (deposit_value > 0 ? deposit_value :0 )).toFixed(2)
                        return_dict.new_balance_usd = update_dict.$set.balance_usd
                    }
                    db.collection(this.collection).updateOne({_id:ObjectId(pid)}, update_dict, (err, data) => { 
                        if(!err){
                            if(data.matchedCount > 0){
                                connect.close()
                                callback(null, return_dict)
                            }
                            else{
                                connect.close()
                                callback(true, null)
                            }
                        }
                        else{
                            connect.close()
                            callback(err, null)
                        }
                    })
                }
                else{
                    connect.close()
                    callback(true, null)
                }
            }
            else{
                connect.close()
                callback(true, null)
            }
        })
    }

    getPlayers(callback){
        this.client.connect((err, connect) => {
            if(!err){
                let db = this.client.db(this.config.db)
                db.collection(this.collection).find().toArray((err, data) => {
                    if(!err){
                        let players = this._formatPlayer(data)
                        players.sort((a,b) => {
                            if(a.name<b.name){
                                return -1 
                            }
                            if(a.name>b.name){
                                return 1 
                            }
                            return 0 
                        })
                        connect.close()
                        callback(null, players )
                    }
                    else{
                        connect.close()
                        callback(err, null)
                    }
                })
            }
            else{
                process.exit(5)
            }
        })
    }

    _formatPlayer(player){
        if(player==null){
            return null
        }
        if(Array.isArray(player)){
            return player.map(this._formatPlayer)
        }
        else{
            let return_dict ={
                pid: player._id, 
                name: `${player.fname}${player.lname ? ` ${player.lname}`:''}`,
                handed: handed_enum_r[player.handed], 
                is_active:player.is_active, 
                balance_usd: player.balance_usd 
            }
            return return_dict
        }
    }
}

app.get('/ping',(req, res) => {
    res.sendStatus(204)
})

app.get('/player',(req, res) => {
    let player_data = new PlayerSourceJson(mongo_file)
    player_data.getPlayers((err, data) => {
        if(!err){
            res.status(200).send(JSON.stringify(data))
        }
    })
})

app.get('/player/:pid', (req,res) => {
    let player_data = new PlayerSourceJson(mongo_file)
    player_data.getPlayer(req.params.pid, (err,data) =>{
        if(!err){
            let player = player_data._formatPlayer(data)
            res.status(200).send(JSON.stringify(player));
            return
        }
        else{
            let player = null 
            res.sendStatus(404)
            return
        }
    })
})

app.delete('/player/:pid', (req,res) => {
    let player_data = new PlayerSourceJson(mongo_file)
    player_data.deletePlayer(req.params.pid, (err,data) =>{
        if(!err){
            res.redirect(303, '/player')
            return
        }
        else{
            res.sendStatus(404)
            return
        }
    })
})

app.post('/player', (req, res) => {
    let player_data = new PlayerSourceJson(mongo_file)
    let fname = req.query?.fname
    let lname = req.query?.lname
    let handed = req.query?.handed
    let initial_balance_usd = req.query?.initial_balance_usd
    let resBody ='invalid_fiels:'
    let error = false 
    if(!(/^[a-zA-Z]+$/.test(fname))){
        resBody += 'fname'
        error = true 
    }
    if(lname != undefined && !(/(^[a-zA-Z]+$)*/.test(lname))){
        console.error(`lname: ${lname}`)
        resBody += 'lname'
        error = true 
    }
    if(!(['left', 'right', 'ambi'].includes(handed.toLowerCase()))){
        resBody += 'handed'
        error = true 
    }
    if(isNaN(Number(initial_balance_usd)) || 
    Number(initial_balance_usd) < 0 ||  
    !(Number.parseFloat(Number(initial_balance_usd)) == Number.parseFloat(Number(initial_balance_usd)).toFixed(2))){
        resBody += 'initial_balance_usd'; 
        error = true; 
    }
    if(!error){
        player_data.createPlayer(fname, lname, handed, initial_balance_usd,
        (err, data) => {
            if(!err){
                res.redirect(303, `/player/${data}`)
            }
            else{
                res.status(422).send(resBody)
            }
        })
        return
    }
    else{
        res.status(422).send(resBody)
    }  
})

app.post('/player/:pid', (req,res) => {
    let player_data = new PlayerSourceJson(mongo_file)
    let is_active = req.query?.active
    let lname = req.query?.lname 
    let error = false 
    if(is_active != undefined && ['1', 'true', 't'].includes(is_active.toLowerCase())){
        is_active = true
    }
    else{
        is_active = false
    }
    if(lname != undefined && !(/(^[a-zA-Z]+$)*/.test(lname))){
        error = true; 
    }
    if(!error){
        player_data.updatePlayer(req.params.pid, lname, is_active, 
        (err, data) => {
            if(!err){
                res.redirect(303, `/player/${req.params.pid}`)
                return
            }
            else{
                res.sendStatus(404)
                return 
            }
        })
    }
    else{
        res.sendStatus(422);
        return
    }
})

app.post('/deposit/player/:pid', (req, res) => {
    let player_data = new PlayerSourceJson(mongo_file)
    let deposit_value = req.query?.amount_usd
    let pid = req.params.pid
    if(isNaN(Number(deposit_value)) || 
    Number(deposit_value) < 0 ||  
    Number(deposit_value) !=  Number(Number(deposit_value).toFixed(2))) {
        res.sendStatus(400)
        return
    }
    player_data.getBalance(pid, Number(deposit_value), (err, data) => {
        if(!err){
            res.status(200).send(JSON.stringify(data))
        }
        else{
            res.sendStatus(404)
        }
    })
})

if(!check_valid_config(mongo_file)){
    process.exit(2)
}
app.listen(PORT, ()=>{});



