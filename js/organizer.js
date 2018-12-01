/*
  CS3733 - Electra
  Author: Rui Huang
  Description:
  JavaScirpt code for oranization page of scheduler web-based applicatoin
 */
'use strict';

// API URLs
const createScheduleURL = "https://vie39y0l01.execute-api.us-east-2.amazonaws.com/Version1/schedule";
const viewScheduleURL = "https://vie39y0l01.execute-api.us-east-2.amazonaws.com/Version1/showWeekSchedule";
// HTML Elements
const CLOSE_OPEN_DAY = "<a href=\"#\">close all</a><br/> <a href=\"#\">open all</a>";
const CLOSE_OPEN_SLOT = "<br /><a href=\"#\">close all</a> <a href=\"#\">open all</a>"
const CLOSED_SLOT = "N/A<br/><a href=\"#\">open</a>";
const OPEN_SLOT = "<input type=\"submit\" value=\"Free\">";
const OCCUPIED_SLOT = "[participant name]<br/><a href=\"#\">cancel</a>";

// todo delete test vars
let x;

function handleCreate(e){
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

  // todo check input
  
  let xhr = new XMLHttpRequest();
  xhr.open("POST", createScheduleURL, true);
  xhr.send(jsonData);
  
  xhr.onloadend = function () {
    console.log(xhr);
    console.log(xhr.request);
    if (xhr.readyState == XMLHttpRequest.DONE) {
      console.log ("XHR:" + xhr.responseText);
      processCreateResponse(xhr.responseText);
    } else {
      alert("awaiting");
      // do something
    }
  };
}

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
      console.log ("XHR:" + xhr.responseText);
      processRefreshResponse(xhr.responseText,week);
    } else {
      // todo
    }
  };
}

function handleRetrieve(){
  // todo
}

function processCreateResponse(response){
  // console.log("response:" + response);
  let jsonData = JSON.parse(response);

  let secretCode = jsonData.secretCode;
  let releaseCode = jsonData.releaseCode;
  let id = jsonData.scheduleId;
  
  window.sessionStorage.setItem("scode",secretCode);
  window.sessionStorage.setItem("rcode",releaseCode);
  window.sessionStorage.setItem("id",id);
  window.sessionStorage.setItem("week",1);
  
  alert("Successfully created the schedule. \nSecret code: " + secretCode + "\nRelease code: " + releaseCode);
  
  handleRefresh(1);
}

function processRefreshResponse(response,week){
  // console.log("response:" + response);
  let jsonData = JSON.parse(response);
  
  // if invalid week number
  let schedule = jsonData.schedule;
  if (schedule == undefined){
    alert("invalid week given");
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
  let mon = "<th>Mon<br/>" + days[0].date + "<br/> " + CLOSE_OPEN_DAY + "</th>";
  let tue = "<th>Tue<br/>" + days[1].date + "<br/> " + CLOSE_OPEN_DAY + "</th>";
  let wed = "<th>Wed<br/>" + days[2].date + "<br/> " + CLOSE_OPEN_DAY + "</th>";
  let thu = "<th>Thu<br/>" + days[3].date + "<br/> " + CLOSE_OPEN_DAY + "</th>";
  let fri = "<th>Fri<br/>" + days[4].date + "<br/> " + CLOSE_OPEN_DAY + "</th>";
  thead.innerHTML = headtime + mon + tue + wed + thu + fri;
  table.appendChild(thead);
  
  // add name, secret code, and release code
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
  
  // end of display the table

  alert("Successfully retrieved weekly schedule!");
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
    return OPEN_SLOT;
  }
  else{
    return OCCUPIED_SLOT.replace("[participant name]", slot.meeting.partInfo);
  }
}

function addRow(id, row, timeString) {
  // Get a reference to the table
  let table = document.getElementById(id);
  
  // Insert a row in the table at row index 0
  let newRow = table.insertRow(row);
  
  // Insert a cell in the row at index 0
  let newCell = newRow.insertCell(5);
  
  // Append a text node to the cell
  let newText = document.createTextNode('New top row');
  newCell.appendChild(newText);
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