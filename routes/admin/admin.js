const express=require('express');
const pool=require('../../pool');
var router=express.Router();
module.exports=router;

/* API:GET /admin/login/:aname/:apwd
完成用户登录验证
返回数据:
{code:200,msg:'login secc'}
{code:400,msg:'aname or apwd err'}

*/
router.get('/login/:aname/:apwd',(req,res)=>{
	var aname=req.params.aname;
	var apwd=req.params.apwd;
	console.log(aname)
	console.log(apwd)
	pool.query('SELECT aid FROM xfn_admin WHERE aname=? AND apwd=PASSWORD(?)',[aname,apwd],(err,result)=>{
		if(err)throw err;
		console.log(result.length);
		if(result.length>0){//查询到一行数据
			res.send({code:200,msg:'login secc'})
		}else{//没有查询到数据
			res.send({code:400,msg:'aname or apwd err'})
		}
	})
})



/* API:PATCH /admin/login
请求数据：{aname:'xxx',oldPwd:'xxx',newPwd:'xxx'}
根据管理员用户名和密码修改管理员密码
返回数据:
{code:200,msg:'modified succ'}
{code:400,msg:'aname or apwd err'}
{code:401,msg:'apwd not modified'}

*/

router.patch('/',(req,res)=>{
	var data=req.body;
	//首先根据aname/oldPwd查询该用户是否存在
	pool.query('SELECT aid FROM xfn_admin WHERE aname=? AND apwd=PASSWORD(?)',[data.name,data.oldPwd],(err,result)=>{
		if(err) throw err;
		if(result.length==0){
			res.send({code:400,msg:'password err'});
			return;
		}
		//如果查询到了用户，在修改密码
		pool.query('UPDATE xfn_admin SET apwd=PASSWORD(?) WHERE aname=?',[data.newPwd,data.aname],(err,result)=>{
			if(err) throw err;
			if(result.changedRows>0){//密码修改成功
				res.send({code:200,msg:'modified succ'})
			}else{//新旧密码一样，未作修改
				res.send({code:401,msg:'apwd not modified'})
			}
		})
	})
})