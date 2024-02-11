import cloudinaryConnection from "../utils/cloudinary.js";

export const rollSavedDocuments = async (req, res, next) => {
  //model , condition(_id)
  if(req.savedDocument){
    const {model, _id} = req.savedDocument;
    await model.findByIdAndDelete(_id);
  }
};


