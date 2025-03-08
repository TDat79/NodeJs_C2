module.exports = {
    QueryProduct : function (objQuery){
        console.log(objQuery);
        let result = {};
        if(objQuery.name){
          result.productName = new RegExp(objQuery.name,'i');
        }
        result.price={}
        if(objQuery.price){
          if(objQuery.price.$gte){
            result.price.$gte=Number(objQuery.price.$gte);
          }else{
            result.price.$gte=0;
          }
          if(objQuery.price.$lte){
            result.price.$lte=Number(objQuery.price.$lte);
          }else{
            result.price.$lte=9999;
          }
        }else{
          result.price.$gte=0;
          result.price.$lte=9999;
        }
        console.log(result);
        return result;
      }
}