const asyncHandler = (requesthandle) => {
    (req,res,next)=>{
        Promise.resolve(requesthandle(req,res,next)).catch((err)=>next(err));
    }
}


export{asyncHandler};

// const asyncHandler = () => {}
// const asyncHandler = (fun) => { () => {} }
// const asyncHandler = (fun) =>  () => {} 
// const asyncHandler = (fun) =>  async () => {} 

// const asyncHandler = (fun) =>  async (req, res, next) => {
//     try {
//         await fun(req, res, next);  
//     } catch (error) {
//         res.status(500).json({
//             success:false,
//             message:error.message
//         })  
//     }   
// }

