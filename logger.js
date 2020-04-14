function log(req,res,next){
    console.log('Logging....');
    next();
  }

  module.export=log;