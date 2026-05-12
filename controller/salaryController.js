import Attendence from "../Models/Attendance.js";
import User from "../Models/User.js";

//Get salary details
export const calculateSalary = async (req, res) => {
    const userId = req.user.id;
    const {month, year} = req.query;
     const startDate = new Date(year, month - 1, 1);
     const endDate = new Date(year, month, 0);

     const user = await User.findById(userId);

     const attendances = await Attendence.find({
        userId,
        createdAt: { $gte: startDate, $lte: endDate }
     });
     let presentDays =0;;
     let halfDays = 0;
     let lateDays = 0;
     const totalHours = req.body.totalHours || 0;
     let bonus = 0;
     if(totalHours > 9){
        bonus =+100;
     }

     attendances.forEach(att => {
        if(att.status === "Present"){
            presentDays++;
        }
        if(att.status === "half-day"){
            halfDays++;
        }
        if(att.status === "Late"){
            lateDays++;
        }
        });


        const totalDays = new Date(year, month, 0).getDate();

        const salary = user.salary;
        const dailySalary = salary / totalDays;

        const totalSalary = (presentDays * dailySalary) + (halfDays * dailySalary * 0.5) - (lateDays * dailySalary * 0.25) + bonus;

        res.json({
            totalSalary: user.salary,
    perDaySalary: dailySalary.toFixed(2),
    presentDays,
    halfDays,
    lateDays,
    bonus: bonus.toFixed(2),
    latePenalty : latePenalty.toFixed(2),
    finalSalary: totalSalary.toFixed(2)
  });
  
            
            
};