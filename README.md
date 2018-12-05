# CS3733-GP-Scheduler-Front
Front-end web pages of CS3733 group project scheduler application. 


## Features

### Organizer Desired Features

The organizer wants to be able to carry out the following tasks:

- [x] Create a new meeting schedule (with its own user-friendly name, such as “Advising Schedule”) with a fixed timeslot duration (of 10,15,20,30, or 60 minutes) that is active from a given start date up until given ending date. For each day there is a daily start hour (such as 9:00 AM or 12:00 PM) and there is a daily end hour (such as 5:00 PM or 8:00 PM). No meeting can be schedule before the start hour; no meeting can be scheduled at or later than the end hour. Upon successful creation of a meeting schedule, the organizer is given a “secret code” that will be used to authenticate all future edit/delete requests.

- [ ] Close/Open an individual time slot on a specific day (i.e., 9:30 – 9:45 on 14-Feb-2018)

- [ ] Close/Open all time slots at a given time (i.e., 9:15 – 9:30 on any day)

- [ ] Close/Open all time slots on a given day (i.e., all timeslots on 12-Feb-2018)

- [x] Cancel any individual meeting at any time

- [x] Review weekly schedule of meetings for a given calendar week (i.e., above is the result for the week of 12-Feb-2018) to see what meetings have been scheduled

- [x] Once a meeting schedule is created, the organizer must tell participants about the scheduled meeting so they can start to register for meetings

- [ ] Extend the ending date of a meeting schedule to a future date

- [ ] Extend the starting date of a meeting schedule to an earlier date

- [x] Delete a meeting schedule once it no longer is useful. Note that organizers can only delete meeting schedules that they had previously created

### Participant Desired Features

Participants want to be able to carry out the following tasks:

- [x] Review weekly schedule of meetings for a given meeting schedule, based on information from an organizer

- [x] Create a meeting in a given open timeslot in a meeting schedule. For each such meeting, the participant can provide a string that will be recorded with the timeslot. Typically this would be just a user name, but it could also be an email address. Upon the successful creation of a meeting, the participant is given a “secret code” that will be used to authenticate all future edit/delete requests

- [x] Cancel a previously scheduled meeting; this must be restricted so participants can only cancel a meeting that they had previously created

- [ ] Search for a list of open time slots (filtered by Month, Year, Day-Of-Week, Day-Of-Month, or Timeslot). These individual search filters can be combined to reduce the search results. Within the search results, the participant can simply create a meeting from one of the returned timeslots

### System Administrator Feature

The system administrator is responsible for maintaining the system and would like to carry out the following tasks:

- [ ] Retrieve a list of meeting schedules more than N days old and delete them from the system

- [ ] Retrieve a list of meeting schedules created in the past N hours


## References
The application uses the Industrious CSS template (link: https://templated.co/industrious) 



<i></i>