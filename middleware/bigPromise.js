// either we use try catch  or BigPromise EveryWhere 

module.exports = func=>(req,res,next)=>
 Promise.resolve(func(req,res,next)).catch(next) 