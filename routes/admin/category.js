/* 菜品类别相关路由 */
const express=require('express');
const pool=require("../../pool");
var router=express.Router();
module.exports=router;

/* API:GET /admin/category 
含义：客户端获取所有的菜品类别，按编号升序排列
返回值形如：
	[{cid:1,cname:'...'},{...}]
*/
router.get('/',(req,res)=>{
	pool.query('SELECT * FROM xfn_category ORDER BY cid',(err,result)=>{
		if(err) throw err;
		res.send(result);
	})
})


/* API:DELETE /admin/category/:cid 
含义：根据表示菜品编号的路由参数，删除该商品
返回值形如：
	{code：200,msg:'1 category deleted'}
	{code：400,msg:'0 category deleted'}
*/
router.delete('/:cid',(req,res)=>{
	//注意删除菜品列别之前，必须把属于这些菜品的类别编号设为null
	pool.query('UPDATE xfn_dish SET categoryId=NULL WHERE categoryId=?',req.params.cid,(err,result)=>{
		if(err) throw err;
		//至此指定类别的菜品已经修改完毕
		pool.query('DELETE FROM xfn_category WHERE cid=?',req.params.cid,(err,result)=>{
			if(err) throw err;
			//获取DELETE语句在数据库中影响的行数
			if(result.affectedRows>0){
				res.send({code:200,msg:'1 category deleted'})
			}else{
				res.send({code:400,msg:'0 category deleted'})
			}
		})
	})

})


/* API:POST /admin/category
请求主题参数：{cname:'xxx'}
含义：添加新的菜品类别
返回值形如：
	{code：200,msg:'1 category added',cid:x}
*/
router.post('/',(req,res)=>{
	var data=req.body;
	pool.query('INSERT INTO xfn_category SET ?',data,(err,result)=>{
		if(err) throw err;
		res.send({code:200,msg:"1 category added"})
	})
})



/* API:PUT /admin/category
请求主题参数：{cid:xx,cname:'xxx'}
含义：根据菜品类别编号修改该类别
返回值形如：
	{code：200,msg:'1 category modified'},
	{code：400,msg:'0 category modified,not exists'},
	{code：401,msg:'0 category modified no modified'},
*/
router.put('/',(req,res)=>{
	var data=req.body; //请求数据{cid:xx,cname:'xx'}
	//TODO:此处可以输入数据进行格式验证
	pool.query('UPDATE xfn_category SET ? WHERE cid=?',[data,data.cid],(err,result)=>{
		if(err) throw err;
		if(result.changedRows>0){
			res.send({code:200,msg:'1 category modified'})
		}else if(result.affectedRows==0){
			res.send({code:400,msg:'0 category modified,not exists'})
		}if(result.affectedRows==1 && result.changedRows==0){//影响了一行但是修改0行-新值与旧值一样
			res.send({code:401,msg:'0 category modified no modified'})
		}
	})
})