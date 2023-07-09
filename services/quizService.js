
const PDFDocument = require('pdfkit');
const fs = require('fs');

module.exports.createCertificate = async(name,surname,instructor,courseName)=>{

    var doc = new PDFDocument(
        {
            layout : 'landscape'
        }
    );
    let objectDate = new Date();
    let day = objectDate.getDate();
    let month = objectDate.getMonth();
    let year = objectDate.getFullYear();
    let newDate = day + "/" + month + "/" + year;
    const timestamp = objectDate.getTime(); 

    let nameSurname  = name+surname;
    doc.pipe(fs.createWriteStream(`./public/images/certificates/${nameSurname}${timestamp}.pdf`));
    doc.registerFont('nameFont', './public/fonts/AlexBrush-Regular.ttf'); // Replace 'CustomFont' with a name of your choice
    doc.registerFont('instructorFont', './public/fonts/Southam-Demo.otf');
    //get background image
    doc.image('./services/image.png', 0,0, {width: doc.page.width, height: doc.page.height});
    nameSurname = name+" "+surname;    
    const paragraph = `This is to certify that ${nameSurname} has successfully completed the course\n titled "${courseName}."`
    
    //name
    doc.font('nameFont').fontSize(70)
    .text(nameSurname, 90, 190);

    doc.fillColor('#00336F') 
    .font('Helvetica').fontSize(12)
    .text(paragraph, 90, 290);

    //date
    doc.fillColor('#00336F') 
    .font('Helvetica').fontSize(12)
    .text(newDate, 90, 410); 
    //Instructor
    doc.fillColor('#00336F') 
    .font('instructorFont').fontSize(45)
    .text(instructor, 300, 380); 


    // Finalize PDF file
    doc.end(); 
    return `images/certificates/${name}${surname}${timestamp}.pdf`

}