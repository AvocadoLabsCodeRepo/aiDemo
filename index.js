const express = require("express");
const app = express();
const port = 3000;
var pdf = require("pdf-creator-node");
var fs = require("fs");
app.get("/", (req, res) => {
    var html = fs.readFileSync('./application.html', "utf8");
    fontPath = fs.readFileSync('./Poppins-Regular.ttf');
    const fontPopins = fontPath.toString('base64');

    const bitmap = fs.readFileSync("./pdfHeader.png");
    const logo = bitmap.toString('base64');
    console.log('logo', logo);
    let pdfData = {
        logo,
        fontPopins,
        name: 'sudhanshu'
    }
    var options = {
        childProcessOptions: {
            env: {
                OPENSSL_CONF: '/dev/null',
            },
        },
        format: "A4",
        orientation: "portrait",
        // header: {
        //     height: "20mm",
        //     contents: {
        //         first: '<span style="color: #444;"></span>',
        //         default: '<div style="display: -webkit-box;display: -webkit-flex;-webkit-justify-content: space-between;justify-content: space-between;" ><p style="color: #300196;>ApplicationId </p> <p style="color: #300196;>{{page}}</span>/<span>{{pages}}</p> </div>', // fallback value
        //     }
        // },
        // footer: {
        //     height: "20mm",
        //     contents: {
        //         first: '<span style="color: #9880CB;>Disclaimer - The document contains all the information provided by the tenant and the property owner.</span>',
        //         default: '<span style="color: #444;"></span>',
        //     }
        // }
    };
    var document = {
        html: html,
        data: pdfData,

        // path: "/home/ec2-user/indyrent-node/files/" + applicationId + ".pdf",
        path: "./application.pdf",
        //   path: "./"+applicationId+".pdf",
        type: "",
    };
    return pdf
        .create(document, options)
        .then((res) => {
            console.log('res.filename', res.filename);
            res.send("Hello World!");
        })
        .catch((error) => {
            console.log('came in exception bro', __dirname)
            console.error(error);
        });

});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});