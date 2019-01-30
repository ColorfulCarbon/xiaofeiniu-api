const express=require('express');
const pool=require('../../pool');
var router=express.Router();
module.exports=router;


/* 
get  /admin/table
获取所有的桌台信息
返回数据：
[
  {tid:xx,tname:'xxx',status:'xxx'},
]
	*/
router.get('/',(req,res)=>{
	pool.query('SELECT * FROM xfn_table ORDER BY tid',(err,result)=>{
		if(err) throw err;
		res.send(result);
	})
})

/*
router.put('/',(req,res)=>{
	pool.query('UPDATE xfn_settings SET ?',req.body,(err,result)=>{
		if(err) throw err;
		res.send({code:200,msg:'settings updated succ'});
	})
}) */