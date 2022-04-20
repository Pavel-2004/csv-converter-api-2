/*

1) Step 1 is to take all of the data and convert it into list format. This is the data that will be submitted
2) Step 2 is to filter that data. For example split some data like CJ.TO turn into CJ as one column and TO turns into TSX as another column. This will be either to plug into the converter function
3) Map out all of the data into the converter function
4) Once user click download activate the function

 */

var selected = ''

//initializing everything: step 1
function initAll(result, type){
    //add other types
    if(type == 'questrade'){
        selected = 'questrade'
        return CSVtoArray(result)
    } else if(type == 'TD'){
        selected = 'TD'
        return CSVtoArray(result)
    } else if(type == 'RBC'){
        selected = 'RBC'
        return CSVtoArray(result)
    }

    else{
        return false
    }
}



//detection for error cases. Will return false if error detected
function errorCase(args){
    //add if statement for new type in error case here

    //questrade
    if(selected == 'questrade'){
        //this validates the proper format of the file.
        if(checkArrayEqual(args[0], ['Transaction Date', 'Settlement Date', 'Action', 'Symbol', 'Description', 'Quantity', 'Price', 'Gross Amount', 'Commission', 'Net Amount', 'Currency', 'Account #', 'Activity Type', 'Account Type\r'])){
            //continue activation process
            return questTradeFilter(args)
        }

        else{
            return false
        }




    } else if(selected == "TD"){

        if(checkArrayEqual(args[3], ['Trade Date', 'Settle Date', 'Description', 'Action', 'Quantity', 'Price', 'Commission', 'Net Amount\r'])){
            return tdFilter(args)
        } else{
            return false
        }


    } else if(selected == "RBC"){

        if(checkArrayEqual(args[8], ["Date", "Activity", "Symbol", "Symbol Description", "Quantity", "Price", "Settlement", "Account", "Value", "Currency", "Description"])){
            return rbcFilter(args)
        } else{
            return false
        }
    }
    //case nothing is selected
    else {
        return false
    }



}




//filtering data. All of the different filter functions go here

//filtering for questrade
function questTradeFilter(data){
    final = []

    for (let i = 1; i < data.length; i++) {
        temp = []
        pushing = true

        for (let j = 0; j < data[i].length; j++) {

            //looks through every column by index and changes it based on requirements
            if(j == 2){
                if(data[i][j] == 'Buy'){
                    temp.push('BUY')
                    temp.push(data[i][j])
                } else if(data[i][j] == 'Sell'){
                    temp.push('SELL')
                    temp.push(data[i][j])
                } else{
                    temp.push('unallocated')
                    temp.push(data[i][j])
                }
            } else if(j == 11){
                temp.push(data[i][j] + data[i][10])

            } else if(j == 4){
                exchange = ((data[i][3]).split('.'))[1]
                symbol = ((data[i][3]).split('.'))[0]
                if(exchange == "TO"){
                    temp.push(getSecurityNameFromTicker(symbol, 'TO')["Name"])
                } else if(exchange == "VN"){
                    temp.push(getSecurityNameFromTicker(symbol, 'V')["Name"])
                } else{
                }
            } else if(j == 3){
                symbol = data[i][j].split('.')
                temp.push(symbol[0])
                if(symbol[1] == 'TO'){
                    temp.push('TSX')
                } else if(symbol[1] == 'VN'){
                    temp.push('TSXV')
                } else{
                    temp.push('other')
                }
            } else if(j == 0){
                myDate = data[i][j]
                newDate = myDate.split(' ')[0]
                temp.push(newDate)
            } else if(j == 1){
                myDate = data[i][j]
                newDate = myDate.split(' ')[0]
                temp.push(newDate)
            } else if(j == 9){
                temp.push(Math.abs(data[i][9]))
            } else if(j == 5){
                temp.push(Math.abs(data[i][j]))
            } else if(j == 6){
                temp.push((Math.abs(data[i][9]) / Math.abs(data[i][5]).toFixed(15)))
            }
            else {

                temp.push(data[i][j].replace(/(\r\n|\n|\r)/gm, ""))

            }


        }





        if(data[i][0]){
            temp.push(data[i][4])
            final.push(temp)
        }
    }

    addOptionsToFinalFormat(final)
    //converts all of the important columns into proper format
    //return mapToProperFormat(final,{13:0, 0:1, 1:2, 4:3, 5:4, 16:5, 3:6, 2:7, 7:8, 8:9, 11:10})
}



function tdFilter(data){
    final = []
    lastCharInAccount = ((data[1][1].split(" "))[4]).charAt(((data[1][1].split(" "))[4].length) -1 )
    accountNum = data[1][1].split(" - ")[1]


    for (let i = 4; i < data.length; i++) {
        temp = []
        for (let j = 0; j < data[i].length; j++) {
            //looks through every column by index and changes it based on requirements
            if(j == 3){
                if(data[i][j] == "SELL"){
                    temp.push("sell")
                    temp.push(data[i][j])
                } else if(data[i][j] == "BUY"){
                    temp.push("buy")
                    temp.push(data[i][j])
                } else{
                    temp.push("unallocated")
                    temp.push(data[i][j])
                }
            } else if (j == 0){
                date = new Date(data[i][j])
                month = date.getMonth() + 1
                day = date.getDate()
                year = date.getFullYear()


                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;

                temp.push(month+"/"+day+"/"+year)
            } else if(j == 1){
                date = new Date(data[i][j])
                month = date.getMonth() + 1
                day = date.getDate()
                year = date.getFullYear()
                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;
                temp.push(month+"/"+day+"/"+year)
            } else if(j == 4){
                temp.push(Math.abs(data[i][j]))
            } else if(j == 5){
                if(data[i][4] == 0){
                    temp.push(0)
                } else{
                    temp.push((Math.abs(data[i][7]) / Math.abs(data[i][4])).toFixed(15))
                }
            } else if(j == 6){
                if(data[i][j]){
                    temp.push(parseInt(data[i][j]))
                } else{
                    temp.push(0)
                }
            } else if(j == 7){
                temp.push(Math.abs(data[i][j]))
            }
            else{
                temp.push(data[i][j])
            }
        }
        temp.push(accountNum)
        temp.push("")
        temp.push("")
        if(data[i][0]){
            temp.push(data[i][2])
            final.push(temp)
        }

    }
    return addOptionsToFinalFormat(final)
    //return mapToProperFormat(final, {9:0, 0:1, 1:2, 11:3, 10:4, 12:5, 4:6, 3:7, 5:8, 6:9, 8:10})

}

function rbcFilter(data){
    dataReal = []
    for (let i = 9; i < data.length; i++) {
        trueValue = ''
        stopAt = 0
        charCount = 0
        temp = []
        //looks through every column by index and changes it based on requirements
        for (let j = 8; j < data[i].length; j++) {
            if(data[i][j] == "USD" || data[i][j] == "USD"){

                stopAt = j
                break
            } else{

                trueValue += data[i][j]
                charCount++

            }
        }

        for (let j = 0; j < stopAt-charCount; j++) {
            temp.push(data[i][j])
        }

        temp.push(parseFloat(trueValue.split('\"')[1]))

        for (let j = stopAt; j < stopAt + 2; j++) {
            temp.push(data[i][j])
        }
        if(data[i][0]){
            dataReal.push(temp)
        }

    }
    data = dataReal

    final = []

    for (let i = 0; i < data.length; i++) {
        temp = []

        for (let j = 0; j < data[i].length; j++) {

            //looks through every column by index and changes it based on requirements
            if(j == 0){
                date = new Date(data[i][j])
                month = date.getMonth() + 1
                day = date.getDate()
                year = date.getFullYear()


                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;

                temp.push(month+"/"+day+"/"+year)
            } else if(j == 1){
                if(data[i][j] == "Sell"){
                    temp.push("SELL")
                    temp.push(data[i][j])
                } else if(data[i][j] == "Buy"){
                    temp.push("BUY")
                    temp.push(data[i][j])
                } else{
                    temp.push("unallocated")
                    temp.push(data[i][j])
                }
            } else if(j == 4){
                temp.push(Math.abs(data[i][j]))
            } else if(j == 5){
                if(data[i][4]){
                    temp.push((Math.abs(data[i][8]) / Math.abs(data[i][4])).toFixed(15))

                } else{
                    temp.push(0)
                }
            } else if(j == 6){
                date = new Date(data[i][j])
                month = date.getMonth() + 1
                day = date.getDate()
                year = date.getFullYear()


                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;

                temp.push(month+"/"+day+"/"+year)
            } else if(j == 7){

                temp.push(data[i][j] + data[i][9])
            } else if(j == 8){

                temp.push(Math.abs(data[i][j]))
            } else{
                temp.push(data[i][j])
            }
        }
        temp.push('')
        temp.push(data[i][3])
        final.push(temp)

    }

    return addOptionsToFinalFormat(final)
    //return mapToProperFormat(final, {8:0, 0:1, 7:2, 3:3, 12:4, 13:5, 1:6, 2:7, 5:8, 6:9, 9:10})
}




//case that options need to be added such as exchange and it can not just be converted straight into csv
function addOptionsToFinalFormat(info){
    //similar to checking for errors there is an if statement for every type of broker (If required)
    if(selected == 'TD'){
        infoFinal = []
        for (let i = 0; i < info.length; i++) {
            infoFinal.push(info[i])
            tempExchangeToTicker = {}
            if(info[i][2]){
                results = getTickerFromDescription(info[i][2])
                infoFinal[i].push(results[0][2])
                for (let j = 0; j < results.length; j++) {
                    for (let k = 0; k < results[j][1].length; k++) {
                        tempExchangeToTicker[results[j][1][k]] =  results[j][0]
                    }
                }
                infoFinal[i].push(tempExchangeToTicker)
            }

        }
        return optionVisualizer(infoFinal)
    } else if(selected == "RBC"){
        infoFinal = []
        for (let i = 0; i < info.length; i++) {
            infoFinal.push(info[i])
            tempExchangeToTicker = {}
            if(info[i][3]){
                results = getTickerFromTicker(info[i][3])
                infoFinal[i].push(results[0][2])
                for (let j = 0; j < results.length; j++) {
                    for (let k = 0; k < results[j][1].length; k++) {
                        tempExchangeToTicker[results[j][1][k]] = results[j][0]
                    }
                }
            }
            infoFinal[i].push(tempExchangeToTicker)
        }
        return optionVisualizer(infoFinal)


    } else if(selected == "questrade"){
        infoFinal = []
        for (let i = 0; i < info.length; i++) {
            infoFinal.push(info[i])
            tempExchangeToTicker = {}
            console.log(info[i])
            if(info[i][4]){
                results = getTickerFromTicker(info[i][4])
                infoFinal[i].push(results[0][2])
                for (let j = 0; j < results.length; j++) {
                    for (let k = 0; k < results[j][1].length; k++) {
                       tempExchangeToTicker[results[j][1][k]] = results[j][0]
                    }
                }
            }
            infoFinal[i].push(tempExchangeToTicker)
        }
        return optionVisualizer(infoFinal)
    }

    else {
        return false
    }
}
