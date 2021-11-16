 
const api_url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=VOO&outputsize=full&apikey=3AIV2KCFAY693R84";
const user = "sphere";
const password = "g@M9APa8ftST";
const baseUrl = "https://api.bitadata.com/v1";
const indexId = "SPFFXI";

var newToken;
var yGreenDiff = [];
var yRedDiff = [];

apiAuth();

function apiAuth(){
    fetch(baseUrl + '/login/', {
        method: 'POST',
        body: JSON.stringify({
            "user": user,
            "password": password
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function (response) {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        }).then(function (data) {
            newToken = data["token"];
            fetchIndexComponentDate(newToken)
            fetchHistoricalData(newToken)
            // console.log(data);
        }).catch(function (error) {
            console.warn('Something went wrong.', error);
        }); 
}

function fetchHistoricalData(token){
    chartIt(token);
}

async function chartIt(token){
    const data = await fetchRedHistoricalData();
    console.log(data)
    const data1 = await fetchGreenHistoricalData(token);
    console.log(data1)
    
    var trace1 = {
        x:data.xs, 
        y:data.ys, 
        mode: 'lines', 
        type: 'scatter', 
        line: {color: '#FF0000'}, 
        name : 'SPY'
    } 

    var trace2 = {
        x:data1.xs1, 
        y:data1.ys1, 
        mode: 'lines', 
        type: 'scatter', 
        line: {color: '#008000'}, 
        name: 'Sphere 500 Fossil-Free Index'
    }
    
    var layout = {
    legend: {
        x: 0,
        y: 1.5,
        traceorder: 'normal',
        font: {
            family: 'sans-serif',
            size: 12,
            color: '#000'
        },
        bgcolor: '#E2E2E2',
        bordercolor: '#FFFFFF',
        borderwidth: 2
        },
    title: 'Time Series with Rangeslider',
    xaxis: {
        autorange: true,
        range: ['2021-02-17', '2021-11-16'],
        rangeselector: {buttons: [
            {
            count: 1,
            label: '1m',
            step: 'month',
            stepmode: 'backward'
            },
            {
            count: 6,
            label: '6m',
            step: 'month',
            stepmode: 'backward'
            },
            {step: 'all'}
        ]},
        rangeslider: {range: ['2021-02-17', '2021-11-16']},
        type: 'date'
    },
    yaxis: {
        autorange: true,
        range: [86.8700008333, 138.870004167],
        type: 'linear',
        side:'right'
    }
    };

    const myDiv = document.getElementsByClassName('myDiv')[0]; 
    Plotly.newPlot(myDiv, [trace1, trace2], layout);
}


async function fetchRedHistoricalData(){
    const xs =[];
    const ys =[];
    const mapRed = new Map();
    var dict = {}
    const response = await fetch(api_url);
    const data = await response.json();

    for(var key in data["Time Series (Daily)"]){
        for(var prop in  data["Time Series (Daily)"][key]){
            if(prop == "4. close"){
                dict[key] = data["Time Series (Daily)"][key][prop];
                xs.push(key);
                ys.push(data["Time Series (Daily)"][key][prop])

            }            
        }
    }

    for(var i=0; i<xs.length; i++){
        mapRed.set(xs, ys);
    }

    const currentRedDate = [...mapRed][0][0][0];
    // console.log(currentRedDate);
    // console.log(mapRed);
    var redDates = getMonthDates(currentRedDate);
    var redCurrentDateKey = redDates.dOneMonthFormattedDate;
    var redCurrentDateKey = redDates.dThreeMonthFormattedDate;
    var redCurrentDateKey = redDates.dSixMonthFormattedDate;

    var redCurrentDateVal;
    var redOneMonthDateVal;
    var redThreeMonthDateVal;
    var redSixMonthDateVal;

    for(key in dict){
        if(key == currentRedDate){
            redCurrentDateVal = dict[key];
        }
        if(key == redDates.dOneMonthFormattedDate){
            redOneMonthDateVal = dict[key];
        }
        if(key == redDates.dThreeMonthFormattedDate){
            redThreeMonthDateVal = dict[key];
        }
        if(key == redDates.dSixMonthFormattedDate){
            redSixMonthDateVal = dict[key];
        }
    }
    
    var RedDiffOne = monthReturns(redCurrentDateVal, redOneMonthDateVal);
    var RedDiffThree = monthReturns(redCurrentDateVal, redThreeMonthDateVal);
    var RedDiffSix = monthReturns(redCurrentDateVal, redSixMonthDateVal);
    
    yRedDiff.push(RedDiffOne);
    yRedDiff.push(RedDiffThree);
    yRedDiff.push(RedDiffSix);

    // console.log(yRedDiff);

    diffMonthsPlot();
    return {xs, ys};
}

function diffMonthsPlot(){
    var xDiff = ['1 Month', '3 Month', 'Six Month'];

    var trace1 = {
        x: xDiff,
        y: yRedDiff,
        name: 'SPY',
        type: 'bar',
        marker: {
            color: 'rgba(255,0,0,.5)',
            line: {
            color: 'rgb(255,0,0)',
            width: 1.5
            }
        }
    };

    var trace2 = {
        x: xDiff,
        y: yGreenDiff,
        name: 'Sphere 500 Fossil-Free Index',
        type: 'bar',
        marker: {
            color: 'rgba(0,128,0,.5)',
            line: {
            color: 'rgb(0,128,0)',
            width: 1.5
            }
        }
    };

        var data = [trace1, trace2];

        var layout = {
            legend: {
                x: 0,
                y: 1.5,
                traceorder: 'normal',
                font: {
                    family: 'sans-serif',
                    size: 12,
                    color: '#000'
                },
                bgcolor: '#E2E2E2',
                bordercolor: '#FFFFFF',
                borderwidth: 2
                },
            barmode: 'group', title: 'Rate of Return', yaxis: {side:"right"}};

    var diffDiv = document.getElementsByClassName('diffDiv')[0];
    Plotly.newPlot(diffDiv, data, layout);
}

function monthReturns(redCurrentDateVal, redMonthDateVal){
    console.log(redCurrentDateVal, redMonthDateVal)
    return ((redCurrentDateVal - redMonthDateVal)/redMonthDateVal)*100;
}

function getMonthDates(currentDate){
    var dOneCurrentDate = new Date(currentDate);
    var dThreeCurrentDate = new Date(currentDate);
    var dSixCurrentDate = new Date(currentDate);

    var dOneMonth = new Date(dOneCurrentDate.setMonth(dOneCurrentDate.getMonth()-1));
    var dThreeMonth = new Date(dThreeCurrentDate.setMonth(dThreeCurrentDate.getMonth()-3));
    var dSixMonth = new Date(dSixCurrentDate.setMonth(dSixCurrentDate.getMonth()-6));

    var dOneMonthFormattedDate = dOneMonth.toISOString().slice(0, 10);
    var dThreeMonthFormattedDate = dThreeMonth.toISOString().slice(0, 10);
    var dSixMonthFormattedDate = dSixMonth.toISOString().slice(0, 10);
    // console.log(typeof dOneMonthFormattedDate);

    return {dOneMonthFormattedDate, dThreeMonthFormattedDate, dSixMonthFormattedDate};
}

async function fetchGreenHistoricalData(newToken){
    const xs1 = []
    const ys1 = []
    const mapGreen = new Map();
    var dict = []

    const startDate = '2010-08-01';
    const endDate = '2021-11-01';
    const freq = '24h';

    const response = await fetch(baseUrl + '/index_history/', {
        method: 'POST',
        body: JSON.stringify({
            index_id: indexId, 
            start_date: startDate,
            end_date: endDate,
            frequency: freq
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
        }
    });
    const data = await response.json();
    var tempKey, tempVal;
    for(var key in data["data"]){
        for(var prop in  data["data"][key]){
            if(prop == "close"){
                ys1.push(data["data"][key][prop])
                tempVal = data["data"][key][prop];
            }  
            if(prop =="timestamp_real"){
                xs1.push(data["data"][key][prop].substring(0, 10));
                tempKey = data["data"][key][prop].substring(0, 10);
            }
            dict[tempKey] = tempVal;
        }   
    }
    
    for(var i=0; i<xs1.length; i++){
        mapGreen.set(xs1, ys1);
    }
    // console.log(mapGreen);

    // lack of data
    const currentGreenDate = '2021-10-29';
    // console.log(currentGreenDate);

    var greenDates = getMonthDates(currentGreenDate);
    // console.log(greenDates)

    var greenCurrentDateKey = greenDates.dOneMonthFormattedDate;
    var greenCurrentDateKey = greenDates.dThreeMonthFormattedDate;
    var greenCurrentDateKey = greenDates.dSixMonthFormattedDate;

    var greenCurrentDateVal;
    var greenOneMonthDateVal;
    var greenThreeMonthDateVal;
    var greenSixMonthDateVal;

    for(key in dict){
        if(key == currentGreenDate){
            greenCurrentDateVal = dict[key];
        }
        if(key == greenDates.dOneMonthFormattedDate){
            greenOneMonthDateVal = dict[key];
        }
        if(key == greenDates.dThreeMonthFormattedDate){
            greenThreeMonthDateVal = dict[key];
        }
        if(key == greenDates.dSixMonthFormattedDate){
            greenSixMonthDateVal = dict[key];
        }
    }

    // lack of data...
    greenThreeMonthDateVal = 979.7633417906214;
    // lack of data...
    greenSixMonthDateVal = 979.7633417906214;

    // console.log(greenCurrentDateVal, greenOneMonthDateVal, greenThreeMonthDateVal, greenSixMonthDateVal)
    
    var greenDiffOne = monthReturns(greenCurrentDateVal, greenOneMonthDateVal);
    var greenDiffThree = monthReturns(greenCurrentDateVal, greenThreeMonthDateVal);
    var greenDiffSix = monthReturns(greenCurrentDateVal, greenSixMonthDateVal);
    
    yGreenDiff.push(greenDiffOne);
    yGreenDiff.push(greenDiffThree);
    yGreenDiff.push(greenDiffSix);

    // console.log(yGreenDiff);

    diffMonthsPlot();

    return {xs1, ys1};
}


async function fetchIndexComponentDate(newToken){
    const nameSymbol = []
    const weightPer = []

    const response = await fetch(baseUrl + '/index_components/', {
        method: 'POST',
        body: JSON.stringify({
            index_id: indexId
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
        }
    });
    const data = await response.json();

    console.log(data["data"]);

    for(name in data["data"]){
        var name = name;
        for(weight in data["data"][name]){
            if(weight == "weight"){
                var weightVal = data["data"][name][weight];
                var weightPercent = weightVal*100;
                // console.log(name, weightVal);

                nameSymbol.push(name);
                weightPer.push(weightPercent);

                // console.log(name, weightPercent);
            }
        }
    }
    // console.log(data);

    console.log(nameSymbol);
    console.log(weightPer);
    const map1 = new Map();

    for(var i=0; i<nameSymbol.length; i++){
        map1.set(nameSymbol[i], weightPer[i]);
    }
    const mapSort1 = new Map([...map1.entries()].sort((a, b) => b[1] - a[1]));
    console.log(mapSort1);
    
    var tableVar = '<table class="table table-striped table-dark">';
    tableVar += '<tbody>';

    var limit = 10;
    var counter = 0;
    mapSort1.forEach((value, key) => {
        if(counter < 10){
            console.log(value, key)
            tableVar += '<tr>';
            tableVar += `<td>${key}</td>
                        <td>${value}</td>
                        </tr>`;
        }
        counter++;
    })

    tableVar += '</tbody>';
    tableVar += '</table>';
        
    document.getElementsByClassName("tableDisplay")[0].innerHTML = tableVar;

}

document.getElementsByClassName('buttonWrapper')[0].innerHTML = `
<div  style="text-align: center; border: 1px; border-color: antiquewhite; background-color: antiquewhite;">
        <label for="investment">If you had invested:</label>
        <input id="amtUser" type="number" placeholder="Enter a number"/>
        <button id="btnSubmit">Submit</button>
      </div>
`;

document.getElementById("btnSubmit").addEventListener("click", function(){ 
    
    var amtUser = document.getElementById("amtUser").value;
    console.log(amtUser)    
    var backAmtUser = amtUser;
    var redUserVal = [];
    var greenUserVal = [];

    for(var i=0; i<yGreenDiff.length; i++){
        console.log(yGreenDiff[i]);
        amtUser = parseInt(amtUser) + parseInt(((amtUser*yGreenDiff[i])/100));
        console.log(amtUser);
        greenUserVal.push(amtUser);
        amtUser = backAmtUser;
    }
    for(var i=0; i<yRedDiff.length; i++){
        amtUser = parseInt(amtUser) + parseInt(((amtUser*yRedDiff[i])/100));
        redUserVal.push(amtUser);
        amtUser = backAmtUser;
    }
    console.log(redUserVal, greenUserVal)
    diffAmtUserPlot(redUserVal, greenUserVal);
});

function diffAmtUserPlot(redUserVal, greenUserVal){
    var xDiff = ['1 Month', '3 Month', 'Six Month'];

    var trace1 = {
        x: xDiff,
        y: redUserVal,
        name: 'SPY',
        type: 'bar',
        marker: {
            color: 'rgba(255,0,0,.5)',
            line: {
            color: 'rgb(255,0,0)',
            width: 1.5
            }
        }
    };

    var trace2 = {
        x: xDiff,
        y: greenUserVal,
        name: 'Sphere 500 Fossil-Free Index',
        type: 'bar',
        marker: {
            color: 'rgba(0,128,0,.5)',
            line: {
            color: 'rgb(0,128,0)',
            width: 1.5
            }
        }
    };

        var data = [trace1, trace2];

        var layout = {barmode: 'group', title: 'Investment $ Return', yaxis: {side:"right"}};


    Plotly.newPlot('diffAmtUserDiv', data, layout);
}