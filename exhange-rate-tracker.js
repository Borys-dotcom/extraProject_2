const fs = require('fs');
const path = require('path');
const https = require('https');

let outputJSONs = [];

const readDataFromApi = () => {
    https.get('https://api.nbp.pl/api/exchangerates/rates/a/usd/?format=json', (res) => {
        let data = ''

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            saveIncomingDataToFile(data);
        })

    }).on('error', (err) => {
        saveErrorInfoToFile(err.code, 'error while downloading data from API')
    });
}

const saveIncomingDataToFile = (dataFromAPI) => {
    fs.readFile(path.join((__dirname), 'output.txt'), (err, dataFromFile) => {

        let newDataToSave = [];

        if (err) {
            saveErrorInfoToFile(err.code, 'there is no output file existing, creating: output.txt');
            // newDataToSave = JSON.stringify(JSON.parse(dataFromAPI), null, 2);
            newDataToSave.push(JSON.parse(dataFromAPI));
        } else {
            let dataFromFileJSON = JSON.parse(dataFromFile)
            dataFromFileJSON.push(JSON.parse(dataFromAPI));
            newDataToSave = dataFromFileJSON;
        }

        // console.log(newDataToSave)

        fs.writeFile(path.join((__dirname), 'output.txt'), JSON.stringify(newDataToSave), (err) => {
            getDataToAnalyze();
            if (err) {
                saveErrorInfoToFile(err, 'error while saving data to file');
            }
        })
    })
}

const saveErrorInfoToFile = (error, message) => {
    fs.readFile(path.join((__dirname), 'error.log'), (err, dataFromFile) => {
        let newDataToSave = '';
        let date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

        if (err) {
            console.log(err);
            newDataToSave = date + ' - error code: ' + error + ' - message: ' + message;
        } else {
            newDataToSave = dataFromFile.toString() + '\n' + date + ' - error code: ' + error + ' - message: ' + message;
        }

        fs.writeFile(path.join((__dirname), 'error.log'), newDataToSave, (err) => {
            console.log(err);
        })

    })
}

// const getDataToAnalyze = () => {

//     fs.readFile(path.join((__dirname), 'output.txt'), (err, data) => {
//         let dataToAnalyze = [];
//         data = data.toString();

//         if (err) {
//             saveErrorInfoToFile(err.code, 'error while reading data to analyze');
//         } else {

//             let jsonStart = 0;
//             let jsonEnd = 0;
//             let bracesCounter = 0;

//             for (i = 0; i < data.length; i++) {

//                 if (data[i] === '{') {
//                     if (bracesCounter === 0) {
//                         bracesCounter++;
//                         jsonStart = i;
//                     } else {
//                         bracesCounter++;
//                     }
//                 }

//                 if (data[i] === '}') {
//                     if (bracesCounter > 1) {
//                         bracesCounter--;
//                     } else {
//                         bracesCounter--;
//                         jsonEnd = i
//                     }
//                 }

//                 if ((jsonEnd !== 0)) {
//                     dataToAnalyze[dataToAnalyze.length] = data.slice(jsonStart, jsonEnd + 1);
//                     jsonStart = 0;
//                     jsonEnd = 0;
//                     bracesCounter = 0;
//                 }
//             }
//         }
//         dataToAnalyze.forEach((singleJSON, index) => {
//             return outputJSONs[index] = JSON.parse(singleJSON);
//         })

//         let date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
//         console.log("średni kurs dolara o godzinie: " + date + ' wynosi: ' + outputJSONs[outputJSONs.length-1].rates[0].mid);
//     })
// }

const getDataToAnalyze = () => {

    fs.readFile(path.join((__dirname), 'output.txt'), (err, data) => {
        let dataToAnalyzeRates = [];
        let dataToAnalyzeJSON = JSON.parse(data);

        if (err) {
            saveErrorInfoToFile(err.code, 'error while reading data to analyze');
        } else {

        dataToAnalyzeJSON.forEach((singleReading, index) => {
            dataToAnalyzeRates[index] = dataToAnalyzeJSON[index].rates[0].mid;
        })
        
        }

        let date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        console.log("średni kurs dolara o godzinie: " + date + ' wynosi: ' + dataToAnalyzeRates[dataToAnalyzeRates.length - 1]);
    })
}

const mainBody = () => {
    readDataFromApi();
}

mainBody();
setInterval(mainBody, 6000);

