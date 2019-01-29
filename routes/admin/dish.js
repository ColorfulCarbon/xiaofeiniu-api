/*菜品相关的路由*/
const express=require('express');
const pool=require('../../pool');
var router=express.Router();
module.exports=router;

/*
API:GET /admin/dish
获取所有的菜品（按类别进行分类）
返回数据：
[
	{cid:1,cname:'肉类',dishList:[{},{},...]
	{cid:2,cname:'菜类',dishList:[{},{},...]
]
*/

router.get('/',(req,res)=>{
	//查询所有菜的类别
	pool.query("SELECT cid,cname FROM xfn_category ORDER BY cid",(err,result)=>{
		if(err)throw err;
		var categoryList=result;//菜品类别数组
		var finishCount=0;//已经查询完菜品的数量
		for(let c of categoryList){
			//循环查询每个类别下有哪些菜品
			pool.query('SELECT * FROM xfn_dish WHERE categoryId=? ORDER BY did DESC',c.cid,(err,result)=>{
				if(err)throw err;
				c.dishList=result;
				finishCount++;
				//必须保证所有的类别下的菜品都查询完成才能发送响应消息，这些查询都是异步执行的。
				if(finishCount==categoryList.length){
					res.send(categoryList);
				}
			})
		}
	})
})


/**
 * post /admin/dish/image
 * 
 * 接收客户端上传图片，报讯在服务器上，返回该图片在服务器上的随机文件名
 * */
//引入multer中间件
const multer=require('multer');
const fs=require('fs');
var upload=multer({
	dest:'tmp/'  //指定客户端上传的文件临时baocunlujing
})
//定义路由，使用文件上传中间件
router.post('/image',upload.single('dishImg'),(req,res)=>{
	//console.log(req.file);客户端上传文件
	//console.log(req.body);客户端随同图片上传的字符数据
	//把客户端上传的文件从临时目录转到永久的图片路径下
	var tmpFile=req.file.path;
	var suffix=req.file.originalname.substring(
		req.file.originalname.lastIndexOf('.'));//原文件名后缀部分
	var newFile=randFileName(suffix);
	fs.rename(tmpFile,'img/dish/'+newFile,()=>{
		res.send({code:200,msg:'upload succ',fileName:newFile})//把临时文件转移
	})
})
	//生成一个随机文件名
	//参数：suffix表示要生成的文件名中的后缀
	//形如：123142344-8821.jpg
	function randFileName(suffix){
		var time=new Date().getTime();
		var num=Math.floor(Math.random()*(10000-1000)+1000);//四位的随机数字
		return time + '-' + num + suffix;
	}
 
	

/**
 * post /admin/dish/
 * 请求参数：{title：'xx',imgUrl:'..jpg',price:xx,detail:'xx',categoryId:xx}
 * 添加一个新菜品
 * 输出消息：
 *  {code:200,msg:'dish added succ',dishId:46}
 * */ 
router.post('/',(req,res)=>{
	pool.query('INSERT INTO xfn_dish SET ?',req.body,(err,result)=>{
		if(err) throw err;
		res.send({code:200,msg:'dish added succ',dishId:result.insertId})//将
	})
})





 /* 
 DELETE /admin/dish/:did
 根据指定的菜品编号删除该商品
 输出数据：
	{code:200,msg:'dish deleted succ'}
	{code:400,msg:'dish not exists'}
 */ 


 /*
 PUT  admin/dish
 请求参数：
		{did:xx,title:'xx',imgUrl:'..jpg',price:xx,detail:'xx',categoryId:xx}
根据指定的菜品编号修改菜品
 输出数据：
   {code:200,msg:'dish updated succ'}
   {code:400,msg:'dish not exists'}
 */