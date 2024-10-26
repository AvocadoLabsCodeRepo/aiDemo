// Import required Node.js modules and external dependencies
const express = require("express");  // Express.js web application framework
const app = express();  // Create instance of Express application
const port = 3000;  // Define server port number

// Import PDF generation and file handling libraries
var pdf = require("pdf-creator-node");  // Library for creating PDF documents
var fs = require("fs");  // Node.js file system module for file operations
const liheap_pdfData = require('./liheap_pdfData.json');  // Import LIHEAP application data from JSON file
//const hbs = require('./templates/application.hbs');  // Commented out handlebars template import
const hbs = require("handlebars");  // Template engine for generating HTML
const convert = require('xml-js');  // Library for converting between XML and JSON
var moment = require('moment');  // Date and time manipulation library
const puppeteer = require('puppeteer');  // Headless Chrome browser for PDF generation

/**
 * Define types of homes available for selection
 * Used in the housing section of the LIHEAP application
 * @constant {Array<Object>}
 */

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
/**
 * Define types of primary heating sources
 * Used in the utility information section
 * @constant {Array<Object>}
 */
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
/**
 * Define types of primary heating fuels
 * Used in the utility information section
 * @constant {Array<Object>}
 */
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
/**
 * Define types of income sources
 * Used in the income and benefits section
 * @constant {Array<Object>}
 */

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
/**
 * Define types of households
 * Used in the household demographics section
 * @constant {Array<Object>}
 */
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
/**
 * Define types of assistance programs
 * Used in the additional assistance section
 * @constant {Array<Object>}
 */
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

/**
 * Route handler for root path
 * Initiates PDF generation process
 */
app.get("/", handlePDFXML);

/**
 * Handles the PDF generation process using Puppeteer
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handlePDFXML(req, res) {
    // Initialize headless browser
    const browser = await puppeteer.launch();
    
    // Create new page in browser
    const page = await browser.newPage();
    
    // Get compiled HTML content
    const content = await compile();
    
    // Set HTML content to page
    await page.setContent(content);
    
    // Generate PDF file
    await page.pdf({
        path: "applicationNew.pdf",  // Output file path
        format: 'A4',               // Page format
        printBackground: true       // Include background graphics
    });

    // Close browser instance
    await browser.close();
    
    // Log success message
    console.log('PDF generated successfully!');
}

/**
 * Compiles HTML template with application data
 * @async
 * @returns {Promise<string>} Compiled HTML content
 */
async function compile() {
    // Read and convert logo to base64
    const bitmap = fs.readFileSync("./pdfLogo.png");
    const logo = bitmap.toString('base64');
    
    // Map assistance data with checked status
    const assistance_received_by_anyone_values = assistance_received_by_anyone.map(data => {
        let o = { ...data }
        if (liheap_pdfData.additional_assistance.aa_assistance_received_by_anyone.includes(o.key)) {
            o.checked = true;
        } else {
            o.checked = false;
        }
        return o;
    });
    
    // Map household type data with checked status
    const household_type_values = household_type.map(data => {
        let o = { ...data }
        if (liheap_pdfData.household_members_demographics.hmd_type_of_household==o.key) {
            o.checked = true;
        } else {
            o.checked = false;
        }
        return o;
    });
    
    // Map income type data with checked status
    const type_of_income_recieved_values = type_of_income_recieved.map(data => {
        let o = { ...data }
        if (liheap_pdfData.income_and_benefits.iab_sources_of_income_received_by_anyone.includes(o.key)) {
            o.checked = true;
        } else {
            o.checked = false;
        }
        return o;
    });
    
    // Map home type data with checked status
    const home_type_values = home_type.map(data => {
        let o = { ...data }
        if (liheap_pdfData.home_and_utility_information.haui_type_of_home==o.key) {
            o.checked = true;
        } else {
            o.checked = false;
        }
        return o;
    });
    
    // Map heating source data with checked status
    const primary_heating_source_values = primary_heating_source.map(data => {
        let o = { ...data }
        if (liheap_pdfData.home_and_utility_information.haui_primary_heating_source.includes(o.key)) {
            o.checked = true;
        } else {
            o.checked = false;
        }
        return o;
    });
    
    // Map heating fuel data with checked status
    const primary_heating_fuel_values = primary_heating_fuel.map(data => {
        let o = { ...data }
        if (liheap_pdfData.home_and_utility_information.haui_heating_fuel.includes(o.key)) {
            o.checked = true;
        } else {
            o.checked = false;
        }
        return o;
    });
    
    // Prepare data object for template
    let pdfData = {
        logo,                    // Base64 encoded logo
        name: 'sudhanshu',       // Applicant name
        data: {                  // Combined form data
            pdfData: liheap_pdfData,
            assistance_received_by_anyone_values,
            household_type_values,
            type_of_income_recieved_values,
            home_type_values,
            primary_heating_source_values,
            primary_heating_fuel_values
        }
    }
    
    // Read HTML template file
    const html = fs.readFileSync('./templates/application.html', "utf8");
    
    // Compile template with data and return
    return hbs.compile(html)(pdfData);
}

/**
 * Converts JSON arrays to flat key-value pairs
 * @param {Object} input - Input JSON object
 * @returns {Object} Flattened key-value pairs
 */
function convertJsonArrayToKeys(input) {
    const output = {};

    // Iterate through input object
    for (const key in input) {
        const value = input[key];

        // Handle array values
        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                // Create dynamic keys for nested objects
                if (typeof item === 'object') {
                    for (const chkey in item) {
                        output[`${chkey}${index + 1}`] = item[chkey];
                    }
                } else {
                    // Create dynamic keys for simple values
                    output[`${key}${index + 1}`] = item;
                }
            });
        } else {
            // Copy non-array values directly
            output[`${key}`] = value;
        }
    }
    return output;
}

// Start Express server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});