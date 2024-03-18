const User=require('../models/userModel');
const category=require('../models/categoryModel')
const loadCategories=async(req,res)=>{
    try {
        var page = 1;
        if(req.query.page){
            page = req.query.page;
        }
        const limit = 2;
        const categoryData = await category.find()
         .limit(limit * 1)
          .skip((page-1)* limit)
          .exec();
          
        const count = await category.find({
        }).countDocuments();
        res.render('adminCategories',{category:categoryData,totalPages:Math.ceil(count/limit),currentPage:page})
    } catch (error) {
        console.log(error.message)
    }
}

const loadAddCategories = async(req,res)=>{
    try {
        res.render('addCategories');
    } catch (error) {
        console.log(error.message)
    }
}

const insertCategory = async(req,res)=>{
    try {
       console.log(req.body.name)

       const existingCategory = await category.findOne({name:req.body.name});
       console.log(existingCategory)
       if(existingCategory){
        res.redirect('/admin/addCategories');
        console.log('Category with this name already exists');
       }else{
        const Category = new category({
            name:req.body.name,
            description:req.body.description,
            is_listed:true
        });
       const data =  await Category.save();
       console.log(data)
        res.redirect('/admin/Categories')
       }
    } catch (error) {
        console.log(error.message)
    }
}

const listCategory=async (req,res)=>{
    try {
        const {categoryId}= req.query
        console.log(categoryId)
        const data = await category.findOne({_id:categoryId});
        console.log(data)
        data.is_listed=!data.is_listed
     const d1 =  await data.save();
      console.log(d1) 
    } catch (error) {
        console.log(error.message)
    }
}

const editCategoryLoad = async(req,res)=>{
    try{

        const id=req.query.id;
       console.log(id)
        const categoryData=await category.findById({_id:id});
        if(categoryData){
            res.render('editCategories',{category:categoryData})
        }else{
            res.redirect('/admin/Categories');
        }
    }catch(error){
        console.log(error.message);
    }
}

const updateCategories = async (req,res)=>{
    try {
        const Category = await category.findOne({_id:req.body.id})
        const existingCategory = await category.findOne({name:req.body.name});
        if(!existingCategory){
            const categoryData = await category.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,description:req.body.description}});
            console.log(categoryData);
            res.redirect('/admin/Categories')
        }else{
            res.render('editCategories',{category:Category,message:'Category already exists'})
        }
        
    } catch (error) {
        console.log(error.message)
    }
}


module.exports={
    loadCategories,
    loadAddCategories,
    insertCategory,
    listCategory,
    editCategoryLoad,
    updateCategories
}