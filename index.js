const express = require("express");
const app = express();
const port = 3000;
var pdf = require("pdf-creator-node");
var fs = require("fs");
const liheap_pdfData = require('./liheap_pdfData.json');
//const hbs = require('./templates/application.hbs');
const hbs = require("handlebars");
const convert = require('xml-js');
var moment = require('moment');
const puppeteer = require('puppeteer');

const home_type=[
    {
        label: 'Site-built single house',
        key: 'site_built_single_house'
    },
    {
        label: 'Multi-unit (apartment, condo, duplex, etc.)',
        key: 'multi_unit_apartment'
    },
    {
        label: 'Mobile home',
        key: 'mobile_home'
    },
    {
        label: 'Other',
        key: 'other'
    },
]
const primary_heating_source=[
    {
        label: 'Furnace/Heat Pump',
        key: 'furnace_heat_pump'
    },
    {
        label: 'Baseboard/wall',
        key: 'baseboard_wall'
    },
    {
        label: 'Wood Stove',
        key: 'wood_stove'
    },
    {
        label: 'Other',
        key: 'other'
    },
    
];
const primary_heating_fuel=[
    {
        label: 'Electric',
        key: 'electric'
    },
    {
        label: 'Fuel Oil',
        key: 'fuel_oil'
    },
    {
        label: 'Natural Gas',
        key: 'natural_gas'
    },
    {
        label: 'Wood/Pellets',
        key: 'wood_pellets'
    },
    {
        label: 'Propane',
        key: 'propane'
    },
    {
        label: 'Other',
        key: 'other'
    },
    
];

const type_of_income_recieved=[
    {
        label: 'Employment wages',
        key: 'employment_wages'
    },
    {
        label: 'Pension/Retirement',
        key: 'pension_retirement'
    },
    {
        label: 'Workers Compensation',
        key: 'workers_compensation'
    },
    {
        label: 'Social Security Disability',
        key: 'social_security_disability'
    },
    {
        label: 'VA Pension',
        key: 'va_pension'
    },
    {
        label: 'Private Disability',
        key: 'private_disability'
    },
    {
        label: 'Social Security Retirement',
        key: 'social_security_retirement'
    },
    {
        label: 'Unemployment Benefits',
        key: 'unemployment_benefits'
    },
    {
        label: 'Odd jobs/irregular income',
        key: 'odd_jobs_irregular_income'
    },
    {
        label: 'Self-employment',
        key: 'self_employment'
    },
    {
        label: 'Alimony/Spousal Support',
        key: 'alimony_spousal_support'
    },
    {
        label: 'No income',
        key: 'no_income'
    },

    {
        label: 'VA Disability',
        key: 'va_disability'
    },
    {
        label: 'SSI',
        key: 'ssi'
    },
  
]
const household_type=[
    {
        label: 'Single person',
        key: 'single_person'
    },
    {
        label: 'Two-parent household',
        key: 'two_parent_household'
    },
    {
        label: 'Multi-generational household (3+ generations)',
        key: 'multi_generational_household_3_generations'
    },
    {
        label: 'Two adults no children ',
        key: 'two_adults_no_children'
    },
    {
        label: 'Non-related adults with children',
        key: 'non_related_adults_with_children'
    },
    {
        label: 'Single female parent',
        key: 'single_female_parent'
    },
    {
        label: 'Single male parent',
        key: 'single_male_parent'
    },
]
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
];
app.get("/", handlePDFXML);

async function handlePDFXML(req, res) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const content = await compile();
    await page.setContent(content);
    await page.pdf({
        path: "applicationNew.pdf",
        format: 'A4', // PDF format
        printBackground: true // Print background graphics
    });

    // Close the browser
    await browser.close();
    console.log('PDF generated successfully!');
}

async function compile() {
    const bitmap = fs.readFileSync("./pdfLogo.png");
    const logo = bitmap.toString('base64');
    const assistance_received_by_anyone_values = assistance_received_by_anyone.map(data => {
        let o = { ...data }
        if (liheap_pdfData.additional_assistance.aa_assistance_received_by_anyone.includes(o.key)) {
            o.checked = true;
        } else {
            o.checked = false;
        }
        return o;
    });
    const household_type_values = household_type.map(data => {
        let o = { ...data }
        if (liheap_pdfData.household_members_demographics.hmd_type_of_household==o.key) {
            o.checked = true;
        } else {
            o.checked = false;
        }
        return o;
    });
    const type_of_income_recieved_values = type_of_income_recieved.map(data => {
        let o = { ...data }
        if (liheap_pdfData.income_and_benefits.iab_sources_of_income_received_by_anyone.includes(o.key)) {
            o.checked = true;
        } else {
            o.checked = false;
        }
        return o;
    });
    const home_type_values = home_type.map(data => {
        let o = { ...data }
        if (liheap_pdfData.home_and_utility_information.haui_type_of_home==o.key) {
            o.checked = true;
        } else {
            o.checked = false;
        }
        return o;
    });
    

    const primary_heating_source_values = primary_heating_source.map(data => {
        let o = { ...data }
        if (liheap_pdfData.home_and_utility_information.haui_primary_heating_source.includes(o.key)) {
            o.checked = true;
        } else {
            o.checked = false;
        }
        return o;
    });
    const primary_heating_fuel_values = primary_heating_fuel.map(data => {
        let o = { ...data }
        if (liheap_pdfData.home_and_utility_information.haui_heating_fuel.includes(o.key)) {
            o.checked = true;
        } else {
            o.checked = false;
        }
        return o;
    });
    

    let pdfData = {
        logo,
        name: 'sudhanshu',
        data: {
            pdfData: liheap_pdfData,
            assistance_received_by_anyone_values: assistance_received_by_anyone_values,
            household_type_values:household_type_values,
            type_of_income_recieved_values,
            home_type_values,
            primary_heating_source_values,
            primary_heating_fuel_values
        }
    }
    const html = fs.readFileSync('./templates/application.html', "utf8");
    // const html= await fs.readFile(filePath,'utf8');
    return hbs.compile(html)(pdfData);
}
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