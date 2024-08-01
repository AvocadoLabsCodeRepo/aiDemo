const express = require("express");
const app = express();
const port = 3000;
var pdf = require("pdf-creator-node");
var fs = require("fs");
const liheap_pdfData = require('./liheap_pdfData.json');
const convert = require('xml-js');
var moment = require('moment');
const assistance_received_by_anyone = [
    {
        label: 'Housing choice voucher (section 8)',
        key: 'housing_choice_voucher_section_8'
    },
    {
        label: 'VA Pension',
        key: 'va_pension'
    },
    {
        label: 'Affordable Care Act subsidy',
        key: 'affordable_care_act_subsidy'
    },
    {
        label: 'Public housing',
        key: 'public_housing'
    },
    {
        label: 'TANF',
        key: 'tanf'
    },
    {
        label: 'Child care voucher',
        key: 'child_care_voucher'
    },
    {
        label: 'Permanent supportive housing',
        key: 'permanent_supportive_housing'
    },
    {
        label: 'Earned Income Tax Credit (EITC)',
        key: 'earned_income_tax_credit_eitc'
    },
    {
        label: 'None',
        key: 'none'
    },
    {
        label: 'VASH',
        key: 'vash'
    },
    {
        label: 'WIC',
        key: 'wic'
    },
    {
        label: 'SNAP (Food Stamps) ',
        key: 'snap_food_stamps'
    },
    {
        label: 'Child Support',
        key: 'child_support'
    }
]

app.get("/", (req, res) => {
    var html = fs.readFileSync('./application.html', "utf8");
    // fontPath = fs.readFileSync('./Poppins-Regular.ttf');
    fontPath = fs.readFileSync('./Poppins-Regular.otf');
    const fontPopins = fontPath.toString('base64');
    fontPath = fs.readFileSync('./Roboto-Regular.ttf');
    const fontRoboto = fontPath.toString('base64');
    const bitmap = fs.readFileSync("./pdfLogo.png");
    const logo = bitmap.toString('base64');

    // here create assistance_received_by_anyone mapping for checked and unchecked
    const assistance_received_by_anyone_values=assistance_received_by_anyone.map(data=>{
        let o={...data}
        if(liheap_pdfData.additional_assistance.aa_assistance_received_by_anyone.includes(o.key)){
            o.checked=true;
        }else{
            o.checked=false;
        }
        return o;

    });
    console.log('assistance_received_by_anyone',assistance_received_by_anyone_values);
    let pdfData = {
        logo,
        fontPopins,
        fontRoboto,
        name: 'sudhanshu',
        data: {
            pdfData:liheap_pdfData,
            assistance_received_by_anyone_values:assistance_received_by_anyone_values
        }
    }
    var options = {
        childProcessOptions: {
            env: {
                OPENSSL_CONF: '/dev/null',
            },
        },
        format: "A4",
        orientation: "portrait",
        header: {
            height: "5px",
            contents: {
                default: '<div style=" background-color: #DBEAFE;margin-top:-5px;"></div>',
            }
        },
        footer: {
            height: "30px",
            contents: {
                first: '<div style="background-color: #DBEAFE; margin-bottom:-10px; font-size: 8px;font-weight: 500;line-height: 16px;text-align: center;color:#475569">Please complete and sign page 2 - Application is not valid without signature and date. Use blue or black ink only and be sure to fully complete all fields. Failure to fully complete application may delay processing</div>',
            }
        }
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
        .then((response) => {
            console.log('res.filename', res.filename);
            let currentDate = moment().format('YYYYMMDD');
            let currentTime = moment().unix();
            // res.send("Hello World!");
            //format the arrays to string

            //remove the nested data
            let liheap_XMLData = Object.entries(liheap_pdfData).reduce((accumulator, [key, value]) => {
                return { ...accumulator, ...value };
            }, {});

            liheap_XMLData = convertJsonArrayToKeys(liheap_XMLData);
            console.log('liheap_XMLData', liheap_XMLData);
            let xmlfileData = {
                "_declaration": { "_attributes": { "version": "1.0", "encoding": "utf-8" } },
                "DocHeader": { "_attributes": { "CreateDate": currentDate, "CreateTime": currentTime }, "Files": { "FileA": "application.pdf" }, "Fields": { "_attributes": { "Form": "tenant" }, ...liheap_XMLData } }
            };
            const json = JSON.stringify(xmlfileData);
            const agencyXML = convert.json2xml(json, { compact: true, spaces: 1 });
            fs.writeFileSync("./application.xml", agencyXML, function (err) {
                if (err) throw err;
            });
        })
        .catch((error) => {
            console.log('came in exception bro', __dirname)
            console.error(error);
        });

});
function convertJsonArrayToKeys(input) {
    const output = {};

    // Iterate over each key in the input JSON
    for (const key in input) {
        const value = input[key];

        // Check if the value is an array
        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                // Create new dynamic keys
                if (typeof item === 'object') {
                    for (const chkey in item) {
                        output[`${chkey}${index + 1}`] = item[chkey];
                    }

                } else {
                    output[`${key}${index + 1}`] = item;
                }
                //output[`${key}${index}`] = typeof item === 'object' ? item : item;
            });
        } else {
            output[`${key}`] = value;
        }
    }
    return output;
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});