import PDFDocument from "pdfkit";
import User from "../Models/User.js";
import Attendence from "../Models/Attendance.js";

export const generatePaySlip = async (req, res) => {

    const userId = req.user.id;

    const{month, year} = req.query;

    const user = await User.findById(userId);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await Attendence.find({
        userId,
        createdAt: { $gte: startDate, $lte: endDate }
    });

    let presentDays =0;;
    let halfDays = 0;
    let lateDays = 0; let bonus = 0;

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
        if(att.totalHours > 9){
            bonus += 100;
        }
        });

        const totalDays = new Date(year, month, 0).getDate();
        const salary = user.salary;
        const dailySalary = salary / totalDays;
        const totalSalary = (presentDays * dailySalary) + (halfDays * dailySalary * 0.5) - (lateDays * dailySalary * 0.25) + bonus;

        const doc = new PDFDocument();

        res.setHeader ("Content-Type", "application/pdf");
        res.setHeader ("Content-Disposition", `attachment; filename=PaySlip_${month}_${year}.pdf`);
        doc.pipe(res);

        // PDF Content

        doc.fontSize(20).text("Pay Slip", { align: "center" });
        doc.moveDown();
        doc.fontSize(14).text(`Name: ${user.name}`);
        doc.text(`Email: ${user.email}`);
        doc.text(`Month: ${month}/${year}`);
        doc.moveDown();
        doc.text(`Basic Salary: $${user.salary.toFixed(2)}`);
        doc.text(`Present Days: ${presentDays}`);
        doc.text(`Half Days: ${halfDays}`);
        doc.text(`Late Days: ${lateDays}`);
        doc.text(`Total Salary: $${totalSalary.toFixed(2)}`);
        
        doc.moveDown();
        doc.fontSize(10).text(`Final Salary: $${totalSalary.toFixed(2)}`, { align: "right" });
        bold: true;
        doc.text("This is a computer generated pay slip and does not require a signature.", { align: "center" });
        doc.end();
    };
