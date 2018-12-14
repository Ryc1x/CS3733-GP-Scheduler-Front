/*
CS3733 - Electra
Author: Rui Huang
Description:
JavaScirpt code for administrator page of scheduler web-based applicatoin
*/
'use strict';

// API URLs
const AWS_URL = "https://vie39y0l01.execute-api.us-east-2.amazonaws.com/Version2/"
const authenticateURL = AWS_URL + "";
const retrieveURL = AWS_URL + "reportactivity";
const deleteURL = AWS_URL + "deleteold";
// HTML Elements
const SCHEDULE_ITEM = 
`
<tr>
<th>[schedule name]</th>
<td>[author]</td>
<td>[date created]</td>
<td>[start] ~ [end]</td>
<td>[timeslots]</td>
<td>[meetings]</td>
</tr>
`;

// todo delete test vars
let x;

// authenticate
function handleAuthenticate() {
    let code = document.authenticateForm.code;
    if (code == ""){
        alert("Please enter your authentication code.");
        return;
    }
    window.sessionStorage.code = document.authenticateForm.code.value;

    alert("Successfully stored the authentication code, it will be verified when retrieve/delete schedules.");
}

// retrieve schedules
function handleRetrieve() {
    if (window.sessionStorage.code == "undefined" || window.sessionStorage.code == undefined){
        alert("Please authenticate first");
        return;
    }
    let data = {};
    let hours = document.retrieveForm.hours.value;
    if (!isNaturalNumber(hours)){
        alert("Please enter valid input (natural number)");
        return;
    }
    data.hours = hours;
    data.code = window.sessionStorage.code;
    console.log(data);

    let jsonData = JSON.stringify(data);

    let xhr = new XMLHttpRequest();
    xhr.open("POST", retrieveURL, true);
    xhr.send(jsonData);
    
    xhr.onloadend = function () {
        console.log(xhr);
        console.log(xhr.request);
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log ("Response:" + xhr.responseText);
            processRetrieveResponse(xhr.responseText);
        } 
    };
}

function processRetrieveResponse(response) {
    let data = JSON.parse(response);
    if (data.httpcode != 200){
        alert("Failed to retrieve schedules list, please make sure the authentication code is valid.");
        return;
    }
    alert("Successfully retrieved scheudles list");

    x = data;
    let table = document.getElementById("list");
    let items = data.info; //todo
    let tbody = "";
    for (let i = 0; i < items.length; i++){
        let date = new Date(items[i].createdDate + "Z");
        tbody += SCHEDULE_ITEM.replace("[schedule name]",items[i].name).replace("[author]",items[i].author).replace("[date created]",date.toLocaleString())
        .replace("[start]",items[i].startDate).replace("[end]",items[i].endDate).replace("[timeslots]",items[i].timeslots).replace("[meetings]",items[i].meetings);
    }
    
    table.children[2].innerHTML = tbody;

}

// delete schedules
function handleDelete() {
    if (window.sessionStorage.code == "undefined" || window.sessionStorage.code == undefined){
        alert("Please authenticate first");
        return;
    }
    let data = {};
    let days = document.deleteForm.days.value;
    if (!confirm("Are you sure to delete all schedules " + days + " days ago?")){
        return;
    }
    if (!isNaturalNumber(days)){
        alert("Please enter valid input (natural number)");
        return;
    }
    data.days = days;
    data.code = window.sessionStorage.code;
    console.log(data);
    let jsonData = JSON.stringify(data);

    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", deleteURL, true);
    xhr.send(jsonData);
    
    xhr.onloadend = function () {
        console.log(xhr);
        console.log(xhr.request);
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log ("Response:" + xhr.responseText);
            processDeleteResponse(xhr.responseText);
        } 
    };
}

function processDeleteResponse(response) {
    let data = JSON.parse(response);
    if (data.httpcode != 200){
        alert("Failed to delete schedules, please make sure the authentication code is valid.");
        return;
    }
    alert("Successfully deleted " + data.number + " scheudles");
}

// helpers:
function isNaturalNumber (str) {
    var pattern = /^(0|([1-9]\d*))$/;
    return pattern.test(str);
}