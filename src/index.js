
import dotenv from 'dotenv'
import connectDB from './db/index.js';
import {app} from '../src/app.js'
dotenv.config({
    path:"./.env"
})
// const app=express()
connectDB()
.then( ()=>{ 
    app.listen(process.env.PORT || 8000 ,
         ()=>{console.log("server started...")}
        )
     } )
.catch((err)=>{console.log("mongodb connection failed error",err)})










// import express from 'express'
// const app=express()

// ( async()=>{

//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error",(error)=>{ console.log("Error",error); throw error })
//        app.listen(process.env.PORT,()=>{console.log("Server is started...")})
//     } catch (error) {
//         console.error("Error...",error)
//         throw err
//     }

//  } )()