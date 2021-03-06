/*
CS3733 - Electra
Author: Rui Huang
Description:
JavaScirpt code for participant page of scheduler web-based applicatoin
*/
'use strict';

// API URLs
const AWS_URL = "https://vie39y0l01.execute-api.us-east-2.amazonaws.com/Version2/"
const viewScheduleURL = AWS_URL + "showWeekSchedule";
const findScheduleURL = AWS_URL + "findschedule";
const meetingURL = AWS_URL + "meeting";
const filterURL = AWS_URL + "searchopentimeslot";
// HTML Elements
const CLOSED_SLOT = "N/A";
const OPENED_SLOT = "<input type=\"button\" value=\"Free\" id=\"[slot id]\" onclick=\"handleCreateMeeting(this)\">";
const OCCUPIED_SLOT = "<br/><a id=\"[meeting id]\" onclick=\"handleCancelMeeting(this)\" style=\"cursor: pointer;\">cancel</a>";
const SEARCH_ITEM = `<li>[date] | [begin]-[end] <a style="cursor: pointer;" id=[slot id] onclick="handleCreateMeeting(this)">Register</a></li>`

// todo delete test vars
let x;

// refresh page
function handleRefresh(week) {
    let data = {};
    data.id = window.sessionStorage.getItem("id");
    data.week = week;
    
    if (week <= 0){
        alert("Aleardy the first week");
        return;
    }    
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
        alert("Invalid week given or schedule no longer exist");
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
    let mon = "<th>Mon<br/>" + days[0].date + "<br/> </th>";
    let tue = "<th>Tue<br/>" + days[1].date + "<br/> </th>";
    let wed = "<th>Wed<br/>" + days[2].date + "<br/> </th>";
    let thu = "<th>Thu<br/>" + days[3].date + "<br/> </th>";
    let fri = "<th>Fri<br/>" + days[4].date + "<br/> </th>";
    thead.innerHTML = headtime + mon + tue + wed + thu + fri;
    table.appendChild(thead);
    
    // add name, author and release code
    document.querySelector("#schedule-info").innerHTML = "Schedule name: <b>" + name + "</b> | Author: <b>" + author + "</b>";
    document.querySelector("#schedule-code").innerHTML = "Release code: <b>" + releaseCode + "</b>";
    
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
        let cells = "<th>" + timeText + "</th>";
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
    data.releaseCode = form.releaseCode.value;
    let jsonData = JSON.stringify(data);
    console.log(data);
    
    // check input
    if (data.releaseCode == ""){
        alert("Please enter your code to retrieve schedule");
        return;
    }
    
    window.sessionStorage.rcode = data.releaseCode;
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", findScheduleURL, true);
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
    let scheduleId = data.scheduleId;
    if (scheduleId == undefined){
        alert("Invalid release code given");
        return;
    }
    window.sessionStorage.id = scheduleId;
    handleRefresh(1);
}

// create meeting
function handleCreateMeeting(e) {
    let slotId = e.id;
    let partInfo = prompt("Please enter your information (e.g. name) to schedule a meeting");
    if (partInfo == "" || partInfo == null){
        alert("Please enter your information to continute");
        return;
    }
    if (partInfo.length > 20){
        alert("The input limit of meeting information is 20 characters, please try again.")
        return;
    }
    let data = {};
    data.partInfo = partInfo;
    data.timeslotId = slotId;
    let jsonData = JSON.stringify(data);
    console.log(data);
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", meetingURL, true);
    xhr.send(jsonData);
    
    xhr.onloadend = function () {
        console.log(xhr);
        console.log(xhr.request);
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log ("Response:" + xhr.responseText);
            processCreateMeetingResponse(xhr.responseText);
        } 
    };
}

function processCreateMeetingResponse(response) {
    let data = JSON.parse(response);
    let scode = data.secretCode;
    if (scode == undefined){
        alert("Failed to create meeting because the timeslot is no longer avaliable.");
    }
    else {
        prompt("Succesfully created meeting! \nPlease save the following secret code for cancelling the meeting:", scode);
    }
    handleRefresh(window.sessionStorage.week);
}

// cancel meeting
function handleCancelMeeting(e) {
    let scode = prompt("Please enter your secret code for cancelling meeting:");
    if (scode == ""){
        alert("Please enter your secret code to continute");
        return;
    }
    if (scode.length > 40){
        alert("The input secret code is invalid, please try again.")
        return;
    }
    let data = {};
    data.secretCode = scode;
    data.id = e.id;
    let jsonData = JSON.stringify(data);
    console.log(data);
    
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", meetingURL, true);
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
        alert("Failed to cancel the meeting, please make sure the secret code is valid. \n Or meeting has already been cancelled.");
    }
    else {
        alert("Succesfully cancelled the meeting!");
    }

    handleRefresh(window.sessionStorage.week);
}

function handleFilter(){
    if (window.sessionStorage.id == undefined || window.sessionStorage.id == "undefined"){
        return;
    }
    let data = {};
    let form = document.filterForm;
    data.scheduleId = window.sessionStorage.id;
    data.year = form.year.value == "" ? 0 : form.year.value;
    data.month = form.month.value == "" ? 0 : form.month.value;
    data.dayOfMonth = form.dayOfMonth.value == "" ? 0 : form.dayOfMonth.value;
    data.dayOfWeek = form.dayOfWeek.value == "" ? 0 : form.dayOfWeek.value;
    data.beginTime = form.begin.value == "" ? null : form.begin.value;
    data.endTime = form.end.value == "" ? null : form.end.value;

    if (isNaN(data.year) || isNaN(data.month) || isNaN(data.dayOfMonth)){
        alert("Please enter number for year/month/day-of-month. ")
    }
    if (data.month < 0 || data.month > 12){
        alert("Please enter valid month or leave it blank");
        return;
    }
    if (data.dayOfMonth < 0 || data.dayOfMonth > 31){
        alert("Please enter valid day of month or leave it blank");
        return;
    }
    if (data.beginTime != null && data.endTime != null){
        if (toMinute(data.beginTime) >= toMinute(data.endTime)){
            alert("The end time must be later than begin time, or leave both blank");
            return;
        }
    }

    let jsonData = JSON.stringify(data);
    console.log(data);

    let xhr = new XMLHttpRequest();
    xhr.open("POST", filterURL, true);
    xhr.send(jsonData);
    
    xhr.onloadend = function () {
        console.log(xhr);
        console.log(xhr.request);
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log ("Response:" + xhr.responseText);
            processFilterResponse(xhr.responseText);
        } 
    };
}

function processFilterResponse(response) {
    let data = JSON.parse(response);
    let result = document.getElementById("search-result");
    if (data.httpcode != 200){
        alert("No timeslot available under given filters, please try different filters.");
        result.innerHTML = "";
        return;
    }
    let slots = data.availableSlotsItems;
    let title = `<h2>Searching Result:</h2>`;
    let close = `<input type="button" class="small" style="margin-left: 20px" onclick="handleCloseFilter()" value="Clear Filter Result">`
    let ul = "";
    for (let i = 0; i < slots.length; i++){
        ul += SEARCH_ITEM.replace("[date]",slots[i].date).replace("[begin]",slots[i].beginTime).replace("[end]",slots[i].endTime).replace("[slot id]",slots[i].timeslotId);
    }
    ul = "<ul>" + ul + "</ul>";
    result.innerHTML = title + close + ul;
}

function handleCloseFilter() {
    let result = document.getElementById("search-result");
    result.innerHTML = "";
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
