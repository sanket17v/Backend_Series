import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UploadOnCloudinary = async (localFilepath) => {
    try {
        if(!localFilepath) return null;
        const response = await cloudinary.uploader.upload(localFilepath, {
            resource_type:'auto'
        });
        console.log('File is Uploaded on Cloudinary', response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilepath);//Remove file from local uploads folder when operation is failed
        console.log('Error while uploading on Cloudinary', error);
        return null;
    }   
}


export { UploadOnCloudinary };

//  Upload an image
    //  const uploadResult = await cloudinary.uploader
    //    .upload(
    //        'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
    //            public_id: 'shoes',
    //        }
    //    )
    //    .catch((error) => {
    //        console.log(error);
    //    });
    
    // console.log(uploadResult);