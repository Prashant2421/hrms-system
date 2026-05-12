import User from "../Models/User.js";
export const getProfile = async (req,res)=>{
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({
        message: "User profile fetched successfully",
        user
    });
}