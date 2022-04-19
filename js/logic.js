//change this in the case that other columns will be added into the new format
var header = ["Account #",	'Trade date',	'Settlement date',	'Symbol',	'Exchange',	'Security name',	'TE type',	'Broker type',	'#units',	'$price/unit',	'Amount']
const exchanges = ['TSX', 'TSXV', 'CSE', 'NASDAQ', 'NYSE', 'ARCA', 'NEO']
const apiFormatToSystem =  {"TO": ["TSX"], "V": ["TSXV"], "CN": ["CSE"], "US": ["NASDAQ", "NYSE", "ARCA"], "NEO": ["NEO"]}
const systemToApiFormat = {"TSX":"TO", "TSXV":"V", "CSE":"CN", "NASDAQ":"US", "NYSE":"US", "ARCA":"US", "NEO": "NEO"}
const apiKey = "625b5df8a34626.35549490"



function checkExchangeCorrect(exchange){
    if(Object.keys(apiFormatToSystem).includes(exchange)){
        return {"contains": true, "tickers": apiFormatToSystem[exchange]}
    } else{
        return {"contains": false}
    }
}


function convertExchangeToApiFormat(exchange){
    return systemToApiFormat[exchange]
}

function convertExchangeFromApiFormat(exchange){
    return apiFormatToSystem[exchange]
}





function checkArrayEqual(arrayOne, arrayTwo){

    if(arrayOne.length == arrayTwo.length){
        for (let i = 0; i < arrayOne.length; i++) {
            if(arrayOne[i] != arrayTwo[i]){
                return false
            }
            return true
        }
    } else{
        return false
    }

}


function CSVtoArray(text) {
    final = text.split('\n').map(function (line){
        return line.split(',')
    })
    return errorCase(final)
};


//takes in format of {originalIndex:newIndex}. Rearranges the function
function mapToProperFormat(currentData, args){
    final = []

    //initializes the array
    for (let i = 0; i < currentData.length; i++) {
        add = []
        for (let j = 0; j < Object.keys(args).length; j++) {
            add.push('')
        }
        final.push(add)
    }
    //maps everything out
    for (let i = 0; i < currentData.length; i++) {
        for (let j = 0; j < currentData[i].length; j++) {
            if(Object.keys(args).includes(String(j))){
                final[i][args[j]] = currentData[i][j]
            }
        }
    }

    finalValue = []
    finalValue.push(header)
    for (let i = 0; i < final.length; i++) {
        finalValue.push(final[i])
    }

    return arrayToCsv(finalValue, 'test.csv', 'text/csv;encoding:utf-8')

}

function arrayToCsv(data, type){
    final = data.map(row =>
        row
            .map(String)
            .map(v => v.replaceAll('"', '""'))
            .map(v => `"${v}"`)
            .join(',')
    ).join('\r\n');
    return downloadBlob(final, type)
}


function downloadBlob(content, contentType) {
    today = new Date();
    dd = String(today.getDate()).padStart(2, '0');
    mm = String(today.getMonth() + 1).padStart(2, '0');
    yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    filename = today + "_traders_edge_"+ input.files[0]["name"]




    var blob = new Blob([content], { type: contentType });
    var url = URL.createObjectURL(blob);

    var pom = document.createElement('a');
    pom.href = url;
    pom.setAttribute('download', filename);
    pom.click();
    return true
}



function filterDescriptionTD(data){
    all = data.split(" ")
    finalData = ""
    for (let i = 0; i < all.length; i++) {
        if(/\d/.test(all[i])){
            break
        } else{
            finalData = finalData + " " + all[i]
        }
    }

    return finalData
}


function getTickerFromDescription(name){
    args = name.split(" ")
    results = []
    finalRes = []

    $.ajax({
        url: "https://eodhistoricaldata.com/api/search/" + args[0] + "?api_token=" + apiKey,
        type: "get",
        async: false,
        dataType: "json",
        success: function (res){
            results = res
        }
    })


    wordCount = 0
    while(true){
        tempResult = []
        word = ""


        for (let i = 0; i < wordCount; i++) {
            word += args[i] + " "
        }
        word = word.trim()
        wordCount+=1

        for (let i = 0; i < results.length; i++) {

            if((results[i]["Name"].toUpperCase()).includes(word)){
                tempResult.push(results[i])
            }
        }

        if(tempResult.length > 0){
            results = tempResult
        } else {
            break
        }
    }







    allNameCount = {}
    for (let i = 0; i < results.length; i++) {
        if(Object.keys(allNameCount).includes(results[i])){
            allNameCount[results[i]]++
        } else{
            allNameCount[results[i]] = 1
        }
    }

    maxCount = 0
    selected = ""


    for (let i = 0; i < Object.keys(allNameCount).length; i++) {
        if(maxCount < allNameCount[Object.keys(allNameCount)[i]]) {
            maxCount = allNameCount[Object.keys(allNameCount)[i]]
            selected = Object.keys(allNameCount)[i]
        }
    }

    info = []



    for (let i = 0; i < results.length; i++) {
        currentExchangeInfo = checkExchangeCorrect(results[i]["Exchange"])

        if(currentExchangeInfo["contains"]){
            tempElement = []
            tempElement.push(results[i]["Code"])
            tempElement.push(convertExchangeFromApiFormat(results[i]["Exchange"]))
            tempElement.push(results[i]["Name"])
            info.push(tempElement)
        }
    }


    return info
}


function getSecurityNameFromTicker(ticker, exchange){
    exchange = {}
    finalSecurity = []

    $.ajax({
        url: "https://eodhistoricaldata.com/api/search/" + ticker + "?api_token=" + apiKey,
        type: "get",
        async: false,
        dataType: "json",
        success: function (res){
            for (let i = 0; i < res.length; i++) {

                if(res[i]["Exchange"] == exchange && res[i]["Code"] == ticker){
                    finalSecurity = res[i]
                }
            }
        }
    })


    return finalSecurity
}

var optionPointers = {}
var importantOptions = {}
function optionVisualizer(optionInfo){
    document.getElementById("inputBoxes").classList.add("d-none")
    document.getElementById("infoContainer").classList.remove("d-none")
    document.getElementById("infoHolder").innerHTML = ""
    document.getElementById("finalizeButton").setAttribute("onclick", `finalizeOptions()`)
    importantOptions = optionInfo
    for (let i = 0; i < optionInfo.length; i++) {
        //index of info (all trading logs) : id of selector
        optionPointers[i] = "option" + i
        element = `
            <div class="row justify-content-center border" style="margin-top: 10px;">
                    <div class="col-3">
                        <p class="text-center">${optionInfo[i][13]}</p>
                    </div>
                    <div class="col-1"></div>
                    <div class="col-5 ">
                        <select id="${'option' + i}" class="form-control">
                        </select>
                    </div>
                </div>
        `
        document.getElementById("infoHolder").innerHTML += element
        for (let j = 0; j < Object.keys(optionInfo[i][14]).length; j++) {
            option = document.createElement("option")
            option.value = Object.keys(optionInfo[i][14])[j]
            option.innerText = Object.keys(optionInfo[i][14])[j]
            if(j == 0){
                document.getElementById("option" + i).value = Object.keys(optionInfo[i][14])[j]
            }
            document.getElementById("option" + i).append(option)
        }
    }
}


function finalizeOptions(){
    output = []
    console.log(optionPointers)
    for (let i = 0; i < importantOptions.length; i++) {
        temp = importantOptions[i]
        console.log(optionPointers[i])
        correntExchange = document.getElementById(optionPointers[i]).value
        correctSymbol = importantOptions[i][14][correntExchange]
        temp.push(correntExchange)
        temp.push(correctSymbol)
        output.push(temp)
    }
    mapToProperFormat(output, {9:0, 0:1, 1:2, 16:3, 15:4, 13:5, 4:6, 3:7, 5:8, 6:9, 8:10})
    document.getElementById("infoContainer").classList.add("d-none")
    document.getElementById("inputBoxes").classList.remove("d-none")
}