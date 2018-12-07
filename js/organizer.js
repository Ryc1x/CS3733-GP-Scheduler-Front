/*
CS3733 - Electra
Author: Rui Huang
Description:
JavaScirpt code for oranization page of scheduler web-based applicatoin
*/
'use strict';

// API URLs
const AWS_URL = "https://vie39y0l01.execute-api.us-east-2.amazonaws.com/Version2/"
const scheduleURL = AWS_URL + "schedule";
const deleteScheduleURL = AWS_URL + "deleteschedule";
const viewScheduleURL = AWS_URL + "showWeekSchedule";
const retrieveScheduleURL = AWS_URL + "retrieveschedule";
const deleteMeetingURL = AWS_URL + "deletemeeting";
const timeslotURL = AWS_URL + "timeslot";
const timeslotDayURL = AWS_URL + "timeslotbyday";
const timeslotTimeURL = AWS_URL + "timeslotbytime";
// HTML Elements
const CLOSE_OPEN_DAY = "<a onclick=\"handleCloseDay(this)\" style=\"cursor: pointer;\">close all</a><br/> <a onclick=\"handleOpenDay(this)\" style=\"cursor: pointer;\">open all</a>";
const CLOSE_OPEN_SLOT = "<br /><a onclick=\"handleCloseTime(this)\" style=\"cursor: pointer;\">close all</a> <a onclick=\"handleOpenTime(this)\" style=\"cursor: pointer;\">open all</a>";
const CLOSED_SLOT = "N/A<br/><a onclick=\"handleOpen(this)\" style=\"cursor: pointer;\">open</a>";
const OPENED_SLOT = "<input type=\"button\" value=\"Free\" id=\"[slot id]\" onclick=\"handleClose(this)\">";
const OCCUPIED_SLOT = "<br/><a id=\"[meeting id]\" onclick=\"handleCancelMeeting(this)\" style=\"cursor: pointer;\">cancel</a>";
const WELCOME = `
<tr>
<th><h2>Welcome! </h2></th>
<td><p>Please create a new schedule or retrieve a schedule on the left side! </p></td>
</tr>
`;


// todo delete test vars
let x;

// create schedule
function handleCreate(){
    let data = {};
    let form = document.createForm;
    data.name = form.name.value;
    data.author = form.author.value;
    data.startDate = form.startDate.value;
    data.endDate = form.endDate.value;
    data.startTime = form.startTime.value;
    data.endTime = form.endTime.value;
    data.timePeriod = form.duration.value;
    let jsonData = JSON.stringify(data);
    console.log(data);
    
    // check input
    if (data.name == "" || data.author == "" || data.startDate == "" || data.endDate == "" || data.startTime == "" || data.endTime ==""){
        alert("Please fill all fields to create a schedule");
        return;
    }
    if (data.name.length > 30 || data.author.length >= 30){
        alert("The input limit of name/author is 30 characters, please try again.")
        return;
    }
    if (new Date(data.startDate).getTime() >= new Date(data.endDate).getTime()){
        alert("The end date must be later than start date");
        return;
    }
    if (toMinute(data.startTime) >= toMinute(data.endTime)){
        alert("The end time must be later than start time");
        return;
    }
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", scheduleURL, true);
    xhr.send(jsonData);
    
    xhr.onloadend = function () {
        console.log(xhr);
        console.log(xhr.request);
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log ("Response:" + xhr.responseText);
            processCreateResponse(xhr.responseText);
        } 
    };
}

function processCreateResponse(response){
    let data = JSON.parse(response);
    
    let secretCode = data.secretCode;
    let releaseCode = data.releaseCode;
    let id = data.scheduleId;
    
    window.sessionStorage.setItem("scode",secretCode);
    window.sessionStorage.setItem("rcode",releaseCode);
    window.sessionStorage.setItem("id",id);
    window.sessionStorage.setItem("week",1);
    
    alert("Successfully created the schedule. \nSecret code: " + secretCode + "\nRelease code: " + releaseCode);
    
    handleRefresh(1);
}

// refresh page
function handleRefresh(week) {
    let data = {};
    data.id = window.sessionStorage.getItem("id");
    data.week = week;
    
    if (data.id == undefined || data.id == "undefined"){
        return;
    }
    
    let jsonData = JSON.stringify(data);
    console.log(data);
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", viewScheduleURL, true); 
    xhr.send(jsonData);
    
    xhr.onloadend = function () {
        console.log(xhr);
        console.log(xhr.request);
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log ("Response:" + xhr.responseText);
            processRefreshResponse(xhr.responseText,week);
        } 
    };
}

function processRefreshResponse(response,week){
    let data = JSON.parse(response);
    
    // if invalid week number
    let schedule = data.schedule;
    if (schedule == undefined){
        alert("Invalid week given or schedule no longer valid");
        return;
    }
    
    x = schedule;
    let table = document.getElementById("schedule");
    
    let name = schedule.name;
    let author = schedule.author;
    let releaseCode = schedule.releaseCode;
    let startTime = schedule.startTime;
    let endTime = schedule.endTime;
    let period = schedule.timePeriod;
    let days = schedule.days;
    
    let caption = document.createElement("caption");
    let thead = document.createElement("thead");
    let tbody = document.createElement("tbody");
    
    // clear table
    table.innerHTML = "";
    
    // add caption
    window.sessionStorage.setItem("week", week);
    caption.innerHTML = "<b>week " + sessionStorage.getItem("week") + "</b>";
    table.appendChild(caption);
    
    // add table head
    let headtime = "<th>Timeslots\\days</th>"
    let mon = "<th id=\"" + days[0].id + "\">Mon<br/>" + days[0].date + "<br/> " + CLOSE_OPEN_DAY + "</th>";
    let tue = "<th id=\"" + days[1].id + "\">Tue<br/>" + days[1].date + "<br/> " + CLOSE_OPEN_DAY + "</th>";
    let wed = "<th id=\"" + days[2].id + "\">Wed<br/>" + days[2].date + "<br/> " + CLOSE_OPEN_DAY + "</th>";
    let thu = "<th id=\"" + days[3].id + "\">Thu<br/>" + days[3].date + "<br/> " + CLOSE_OPEN_DAY + "</th>";
    let fri = "<th id=\"" + days[4].id + "\">Fri<br/>" + days[4].date + "<br/> " + CLOSE_OPEN_DAY + "</th>";
    thead.innerHTML = headtime + mon + tue + wed + thu + fri;
    table.appendChild(thead);
    
    // add name, author, secret code, and release code
    document.querySelector("#schedule-info").innerHTML = "Schedule name: <b>" + name + "</b> | Author: <b>" + author + "</b>";
    document.querySelector("#schedule-code").innerHTML = "Secret code: <b>" + window.sessionStorage.getItem("scode") + "</b> | Release code: <b>" + releaseCode + "</b>";
    
    // add table contents
    let startMinute = toMinute(startTime);
    let endMinute = toMinute(endTime);
    let minutediff = endMinute - startMinute;
    let slotsnum = Math.floor(minutediff / period);
    let minute = startMinute;
    
    console.log(startMinute + " | " + endMinute + " | " + slotsnum + " | " + period);
    
    for (let i = 0; i < slotsnum; i++){
        let tr = document.createElement("tr");
        let timeText = toTime(minute) + "-" + toTime(minute = minute + period);
        let cells = "<th>" + timeText + CLOSE_OPEN_SLOT + "</th>";
        for (let j = 0; j < 5; j++){
            cells = (days[j].timeslots == undefined) ? (cells + "<td> </td>") : (cells + "<td>" + slotElement(days[j].timeslots[i]) + "</td>");
        }
        tr.innerHTML = cells;
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
}

// retrieve schedule
function handleRetrieve(){
    let data = {};
    let form = document.retrieveForm;
    data.secretCode = form.secretCode.value;
    let jsonData = JSON.stringify(data);
    console.log(data);
    
    // check input
    if (data.secretCode == ""){
        alert("Please enter your code to retrieve schedule");
        return;
    }
    
    window.sessionStorage.scode = data.secretCode;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", retrieveScheduleURL, true);
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

function processRetrieveResponse (response) {
    let data = JSON.parse(response);
    let scheduleId = data.scheduleId;
    if (scheduleId == undefined){
        alert("Invalid secret code given");
        return;
    }
    window.sessionStorage.id = scheduleId;
    handleRefresh(1);
}

// cancel meeting
function handleCancelMeeting(e) {
    if (!confirm("Are you sure to cancel this meeting?")){
        return;
    }
    let data = {};
    data.id = e.id;
    let jsonData = JSON.stringify(data);
    console.log(data);
    
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", deleteMeetingURL, true);
    xhr.send(jsonData);
    
    xhr.onloadend = function () {
        console.log(xhr);
        console.log(xhr.request);
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log ("Response:" + xhr.responseText);
            processCancelMeetingResponse(xhr.responseText);
        } 
    };
    
}

function processCancelMeetingResponse(response) {
    let data = JSON.parse(response);
    if (data.httpcode != 200){
        alert("Failed to cancel the meeting, please refresh the page.");
        return;
    }
    alert("Succesfully cancelled the meeting!");

    handleRefresh(window.sessionStorage.week);
}

// delete schedule
function handleDelete() {
    let data = {};
    data.id = window.sessionStorage.id;
    if (data.id == undefined || data.id == "undefined"){
        return;
    }
    let confirmText = prompt("Are you sure to permanently delete this schedule?\nEnter \"yes\" to continue");
    if (confirmText != "yes"){
        alert("Delete schedule aborted");
        return;
    }

    let jsonData = JSON.stringify(data);
    console.log(data);

    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", deleteScheduleURL, true);
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
        alert("Failed to delete the schedule, please refresh the page.");
        return;
    }
    alert("Succesfully deleted the schedule!");

    window.sessionStorage.id = undefined;
    document.getElementById("schedule").innerHTML = WELCOME;
}

// open single timeslot
function handleOpen(e) {
    let cell = e.parentElement;
    let schedule = document.getElementById("schedule");
    let head = schedule.children[1].children[0].children[cell.cellIndex];
    let data = {};
    data.dayId = head.id;
    data.beginTime = cell.parentElement.firstElementChild.innerText.split("-")[0];

    let jsonData = JSON.stringify(data);
    console.log(data);

    let xhr = new XMLHttpRequest();
    xhr.open("POST", timeslotURL, true);
    xhr.send(jsonData);

    xhr.onloadend = function () {
        console.log(xhr);
        console.log(xhr.request);
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log ("Response:" + xhr.responseText);
            processOpenResponse(xhr.responseText);
        } 
    };
}

function processOpenResponse(response) {
    let data = JSON.parse(response);
    if (data.httpcode != 200){
        alert("Failed to open the timeslot, please refresh the page.");
        return;
    }
    alert("Succesfully opened the timeslot!");

    handleRefresh(window.sessionStorage.week)
}

// close single timeslot 
function handleClose(e) {
    let data = {};
    data.id = e.id;

    let jsonData = JSON.stringify(data);
    console.log(data);

    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", timeslotURL, true);
    xhr.send(jsonData);

    xhr.onloadend = function () {
        console.log(xhr);
        console.log(xhr.request);
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log ("Response:" + xhr.responseText);
            processCloseResponse(xhr.responseText);
        } 
    };
}

function processCloseResponse(response) {
    let data = JSON.parse(response);
    if (data.httpcode != 200){
        alert("Failed to close the timeslot, please refresh the page.");
        return;
    }
    alert("Succesfully closed the timeslot!");

    handleRefresh(window.sessionStorage.week)
}


// open all timeslots on a day
function handleOpenDay(e) {
    let head = e.parentElement;
    let data = {};
    data.scheduleId = window.sessionStorage.id;
    data.dayId = head.id;

    let jsonData = JSON.stringify(data);
    console.log(data);

    let xhr = new XMLHttpRequest();
    xhr.open("POST", timeslotDayURL, true);
    xhr.send(jsonData);

    xhr.onloadend = function () {
        console.log(xhr);
        console.log(xhr.request);
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log ("Response:" + xhr.responseText);
            processOpenDayResponse(xhr.responseText);
        } 
    };
}

function processOpenDayResponse(response) {
    let data = JSON.parse(response);
    if (data.httpcode != 200){
        alert("Failed to open timeslots, please refresh the page.");
        return;
    }
    alert("Succesfully opened timeslots!");

    handleRefresh(window.sessionStorage.week)
}

// close all timeslots on a day 
function handleCloseDay(e) {
    if (!confirm("Are you sure to close all timeslots on this day? (This action will also remove schedulled meetings)")){
        return;
    }
    let head = e.parentElement;
    let data = {};
    data.dayId = head.id;

    let jsonData = JSON.stringify(data);
    console.log(data);

    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", timeslotDayURL, true);
    xhr.send(jsonData);

    xhr.onloadend = function () {
        console.log(xhr);
        console.log(xhr.request);
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log ("Response:" + xhr.responseText);
            processCloseDayResponse(xhr.responseText);
        } 
    };
}

function processCloseDayResponse(response) {
    let data = JSON.parse(response);
    if (data.httpcode != 200){
        alert("Failed to close timeslots, please refresh the page.");
        return;
    }
    alert("Succesfully closed timeslots!");

    handleRefresh(window.sessionStorage.week)
}

// open all timeslots on a time period
function handleOpenTime(e) {
    let head = e.parentElement;
    let data = {};
    data.beginTime = head.innerText.split("-")[0];
    data.scheduleId = window.sessionStorage.id;

    let jsonData = JSON.stringify(data);
    console.log(data);

    let xhr = new XMLHttpRequest();
    xhr.open("POST", timeslotTimeURL, true);
    xhr.send(jsonData);

    xhr.onloadend = function () {
        console.log(xhr);
        console.log(xhr.request);
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log ("Response:" + xhr.responseText);
            processOpenTimeResponse(xhr.responseText);
        } 
    };
}

function processOpenTimeResponse(response) {
    let data = JSON.parse(response);
    if (data.httpcode != 200){
        alert("Failed to open timeslots, please refresh the page.");
        return;
    }
    alert("Succesfully opened timeslots!");

    handleRefresh(window.sessionStorage.week)
}

// close all timeslots on a time period 
function handleCloseTime(e) {
    if (!confirm("Are you sure to close all timeslots on this time period? (This action will also remove schedulled meetings)")){
        return;
    }
    let head = e.parentElement;
    let data = {};
    data.beginTime = head.innerText.split("-")[0];
    data.scheduleId = window.sessionStorage.id;

    let jsonData = JSON.stringify(data);
    console.log(data);

    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", timeslotTimeURL, true);
    xhr.send(jsonData);

    xhr.onloadend = function () {
        console.log(xhr);
        console.log(xhr.request);
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log ("Response:" + xhr.responseText);
            processCloseTimeResponse(xhr.responseText);
        } 
    };
}

function processCloseTimeResponse(response) {
    let data = JSON.parse(response);
    if (data.httpcode != 200){
        alert("Failed to close timeslots, please refresh the page.");
        return;
    }
    alert("Succesfully closed timeslots!");

    handleRefresh(window.sessionStorage.week)
}

// previous, next, and jump
function prev() {
    handleRefresh( (+window.sessionStorage.week) - 1 );
}

function next() {
    handleRefresh( (+window.sessionStorage.week) + 1 );
}

function jump() {
    handleRefresh(document.getElementById("week-input").value);
}

// helper methods
function slotElement (slot) {
    if (slot == undefined){
        return CLOSED_SLOT;
    }
    else if (slot.meeting == undefined) {
        return OPENED_SLOT.replace("[slot id]", slot.id);
    }
    else{
        return "<b>" + slot.meeting.partInfo + "</b>" + OCCUPIED_SLOT.replace("[meeting id]", slot.meeting.id);
    }
}

function toMinute (time) {
    let h = time.split(':')[0];
    let m = time.split(':')[1];
    return 60*(+h) + (+m);
}

function toTime (minute) {
    let hour = Math.floor(minute/60);
    minute = minute % 60;
    hour = hour < 10 ? "0"+hour : hour;
    minute = minute < 10 ? "0"+minute : minute;
    return hour + ":" + minute;
}

function updateURL(params) {
    if (history.pushState) {
        let newurl = window.location.port + "//" + window.location.host + window.location.pathname + "?" + params;
        window.history.pushState({path:newurl},'',newurl);
    }
}

function undefinedID() {
    return (window.sessionStorage.id == "undefined" || window.sessionStorage.id == undefined)
}