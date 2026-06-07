// API Fetching:
const PRETALX_BASE_URL = 'http://localhost:8010/proxy';     // <- Need to setup a cors proxy using 'npm run proxy'
//const PRETALX_BASE_URL = 'https://submit.wsaf.org.uk';   // <- Currently there's no CORS setup on the WSAF server
const PRETALX_EVENT_SLUG = '2026';
const PRETALX_API_TOKEN = 'a1a7swzazrfsxypofabs1vudgbxy3atoclmu77ky111mvdebhtfmmawprzriywns'
const PRETALX_API_URL = `http://localhost:8011/proxy`
const PRETALX_SCHEDULE_V = 53  // 0.5

// API Override:
// const PRETALX_SCHEDULE_OVERRIDE = [{
//     day_start:  "2025-10-05T18:55:00+01:00",
//     day_end:    "2025-10-05T22:00:00+01:00",
//     rooms: {
//         'Helen Martin Studio' : [{
            
//         }]
//     }
// }] // (see fetchSchedule for structure)
const PRETALX_SCHEDULE_OVERRIDE  = false

// Graphics Config:
const EVENTS_STAGGER = 0.2;
const EVENTS_MAX = 8;

let data = {
    "title": "",
    "subtitle": "",
    "dateStart": "2026-06-12T04:00:00+01:00",
    "dateEnd": "2026-06-16T04:00:00+01:00",
    "venueFilter": "",
    "triggerUpdate": "0"
}


let state = 0;
let eventElems = [];
const tracks = {
    'Theatre': {
        label: 'Theatre',
        icon: "theater-masks",
        colour: '#a855f7', // purple-500
      },
      'Music': {
        label: 'Music',
        icon: "music",
        colour: '#3b82f6', // blue-500
      },
      'Comedy':{
        label: 'Comedy',
        icon: "laugh-squint",
        colour: '#f59e0b', // amber-500
      },
       'Dance': {
        label: 'Dance',
        icon: "walking",
        colour: '#ef4444', // red-500
      },
      'Visual Art (displayed)': {
        label: 'Visual Art',
        icon: "paint-brush",
        colour: '#f97316', // orange-500
      },
      'Workshop': {
        label: 'Workshop',
        icon: "magic",
        colour: '#8b5cf6', // violet-500
      },
    //   'MTW Stagefest': {
    //     label: 'MTW Stagefest',
    //     icon: "person-booth",
    //     colour: '#14b8a6', // teal-500
    //   },
      'Film': {
        label: 'Film',
        icon: "film",
        colour: '#64748b', // slate-500
      },
      'Spoken Word': {
        label: 'Spoken Word',
        icon: "microphone-alt",
        colour: '#ec4899', // pink-500
      },
};
const QUESTIONS = {
    "drop-in": 36,
    "content-warnings" : 37,
    "record-theatre": 55,
    "credits-theatre": 56,
    "logo-theatre": 57,
    "group-name": 38,
    "society-info": 39,
    "society-logo": 40,
    "society-link": 41,
    "society-instagram": 42
}

function play() {
    if (state == 1) {
        state = 1.6
        animateIn().then(() => {state = 2})
    } else if(state == 2) {
        state = 1.5
        animateOut().then(() => {state = 1})
    } else if(state > 0) {
        setTimeout(() => {play()}, 100)
    }
}

async function fetchSchedule() {
    try{
        if (PRETALX_SCHEDULE_OVERRIDE) { return PRETALX_SCHEDULE_OVERRIDE }
        const res = await fetch(`${PRETALX_BASE_URL}/${PRETALX_EVENT_SLUG}/p/broadcast-tools/wsaf_schedule.json`, {
            headers: {
                Authorization: `Token ${PRETALX_API_TOKEN}`,
                Accept: 'application/json',
              },
        });
        if (!res.ok) {  throw new Error(`${await res.text()}`)    }
        let json = await res.json()
        return json.schedule.conference.days
        /* [{
            day_start : (date representation),
            day_end :  (date representation),
            rooms : {
                (str - Room Name) : [{
                    date: (date representation),
                    code: (str -> used in fetchEventDetails)
                }]
            }
        }]  (days[])*/
    } catch(err) {
        throw new Error(`Error fetching Pretalx data: ${err}`)
    }
}
async function fetchEventDetails(event_slug) {
    try{
        // const res = await fetch(`${PRETALX_API_URL}/events/${PRETALX_EVENT_SLUG}/submissions/${event_slug}`, {
        const res = await fetch(`${PRETALX_API_URL}/events/${PRETALX_EVENT_SLUG}/slots?submission=${event_slug}&schedule=${PRETALX_SCHEDULE_V}`, {
            headers: {
                Authorization: `Token ${PRETALX_API_TOKEN}`,
                Accept: 'application/json',
              },
        });
        if (!res.ok) {  throw new Error(`${await res.text()}`)    }
        let json = await res.json() 
        return json.results
        /* {  -- Basic Required for newEvent to work (pretalyx gives much more)
            id: (str),
            name: (str),
            artist: {
                name: (str),
            },
            categoryPretalxTrack: (Theatre|Music|Comedy|Dance|Visual Art (displayed)|Workshop|MTW Stagefest|Film|Spoken Word)
            sessions: [{
                start: (date represntation - should match event.date in fetchSchedule),
                end: (date representation),
                venue: {
                    name: str
                }
            }]
        }
        */
    } catch(err) {
        throw new Error(`Error fetching WSAF data: ${err}`)
    }
}

Object.filter = (obj, predicate) => 
    Object.keys(obj)
          .filter( key => predicate(key, obj[key]) )
          .reduce( (res, key) => (res[key] = obj[key], res), {} );
Object.filterV = (obj, predicate) => 
    Object.keys(obj)
          .filter( key => predicate(key, obj[key]) )
          .reduce( (res, key) => (res.push(obj[key]), res), [] );

async function updateSchedule(filters) {
    const parent = document.getElementById('events');
    if(eventElems.length > 0) {
        parent.innerHTML = '';
        eventElems = [];
    }
    const schedule = await fetchSchedule(); 
    const days = schedule.filter(day => filters.start ? !(new Date(day.day_end) < filters.start || new Date(day.day_start)> filters.end): true)
                         .reduce((res, day)=>{
        let filtered_rooms = Object.filterV(day.rooms, (k,v) => filters.rooms.length > 0 ? filters.rooms.includes(k) : true).flat(1);
        if (filtered_rooms.length > 0)
            res[(typeof day.index == 'number') ? day.date : day.index] = filtered_rooms;
        return res;
    },{})
    const showLocation = (filters.rooms ? filters.rooms.length != 1 : true);

    const promiseArray = []
    let i=0
    for(const [day, events] of Object.entries(days)) {
        events.sort((a,b)=>Date.parse(a.date)>Date.parse(b.date)).map((event) => {
            if(i++ < EVENTS_MAX) promiseArray.push(newEventF(event, showLocation));
            else {
                newEventF(event, showLocation).then(e =>  eventElems.push(e));
            }
        })
    }
    Promise.all(promiseArray).then(elems =>
        elems.forEach(elem => {
        parent.appendChild(elem);
    }))
    .then(() => {if (state > 1.5) eventsIn(); else console.log("Loaded")});    
}
function mix(col1, col2, percentage) {
    col1 = col1.replace('#','');  col2 = col2.replace('#','');
    var colour1 = [parseInt(col1[0] + col1[1], 16), parseInt(col1[2] + col1[3], 16), parseInt(col1[4] + col1[5], 16)];
    var colour2 = [parseInt(col2[0] + col2[1], 16), parseInt(col2[2] + col2[3], 16), parseInt(col2[4] + col2[5], 16)];
    var color3 = [ 
        (1 - percentage) * colour1[0] + percentage * colour2[0], 
        (1 - percentage) * colour1[1] + percentage * colour2[1], 
        (1 - percentage) * colour1[2] + percentage * colour2[2]
    ];
    return '#' + int_to_hex(color3[0]) + int_to_hex(color3[1]) + int_to_hex(color3[2]);
}
function int_to_hex(num){
    var hex = Math.round(num).toString(16);
    if (hex.length == 1) hex = '0' + hex;
    return hex;
}

function toIsoString(date) {
  var tzo = -date.getTimezoneOffset(),
      dif = tzo >= 0 ? '+' : '-',
      pad = function(num) {
          return (num < 10 ? '0' : '') + num;
      };

  return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds()) +
      dif + pad(Math.floor(Math.abs(tzo) / 60)) +
      ':' + pad(Math.abs(tzo) % 60);
}

function newEventF(event, showLocation=false) {
    return new Promise(async (resolve, reject) => {
        let event_date = toIsoString(new Date(event.date));
        const events = await fetchEventDetails(event.code);
        const session_d = events.filter(s => s.start == event_date)[0];
        resolve(newEvent(event, session_d, showLocation));
    })
}


function newEvent(eventInfo, sessionInfo, location) {
    /*eventInfo
        code, id, logo date, start (12:00), duration (00:30), room (Name), slug, 
        url, title, subtitle, track (Name), type (Name), abstract, description,  
        answers
      sessionInfo
        id, room (code), start, end, submission (code), duration, slot_type, is_visible
    */
    const template = document.getElementById('event-template');
    let cloned = template.content.cloneNode(true);
    let event = cloned.getElementById("event")
    
    
    event.id='event-'+eventInfo.id;

    event.querySelector('#event-time').textContent = (sessionInfo.start && sessionInfo.end) ? formatTimeStr(sessionInfo.start, sessionInfo.end) : '';
    event.querySelector('#event-name').textContent = eventInfo.title || '';
    console.log(eventInfo)
    event.querySelector('#event-by').textContent = eventInfo.answers[QUESTIONS["group-name"]] || eventInfo.persons[0]?.public_name || "";
    // Track:
    const event_track = tracks[eventInfo.track]
    if(event_track) {
        event.style.color =event_track.colour
        event.querySelector('#event-box').style.backgroundColor = mix(event_track.colour, '#FFFFFFFF', 0.9)
        // event.querySelector('#event-box').style.
        event.querySelector('#track-name').textContent = event_track.label;
        let icon_ref = document.createElementNS("http://www.w3.org/2000/svg", "use");
        icon_ref.setAttribute('href', `#${event_track.icon}-icon`);
        // let icon = document.getElementById(`#${event_track.icon}-icon`)
        event.querySelector('#track-icon').appendChild(icon_ref);
        event.querySelector('#track-icon').style.fill = event_track.colour;
    }
    if(location) {
        event.querySelector('#event-location').textContent = eventInfo.room
        if(event_track) {
            event.querySelector('#location-icon').style.fill = event_track.colour;
        }
    }
    
    return cloned;
}
function formatTimeStr(start_s, end_s) {
    const start = new Date(start_s);
    const end   = new Date(end_s);
    let options = {
        "hour": "numeric",
        "minute": "2-digit",
        "hour12": true
    };
    if(start.getDate() != end.getDate()) {
        options["weekday"] ="short";
    }
    let start_f = start.toLocaleString([], options);
    let end_f = end.toLocaleString([], options)
    if(!(start.getHours() < 12 && end.getHours() >= 12)) {
        start_f = start_f.slice(0, -2);
    }
    return start_f + " - " + end_f;
} 

function animateIn() {
    return new Promise((resolve, reject) => {
        const t_l = new gsap.timeline({ease: 'power1.in', onComplete: resolve})
        titleIn(t_l);
        eventsIn(t_l);
    })
}
function titleIn(tl=null) {
    if(tl == null)
        tl = new gsap.timeline({ease: 'power1.in'})
    tl.set('#title-box', {left: 2000, opacity: 1})
    tl.to('#title-box', {left: 0, duration:0.8})
}
function eventsIn(tl=null) {
    if(tl == null){
        tl = new gsap.timeline({ease: 'power1.in'})
    }
    tl.set('#events>*', {left: 1000, opacity: 1})
    tl.set('#events>div>#event-time', {opacity: 0})
    tl.to ('#events>*',  {left: 0, duration:0.7, stagger: EVENTS_STAGGER})
    tl.to ('#events>div>#event-time', {opacity: 1, duration: 0.1, stagger: EVENTS_STAGGER}, '<+=0.9')
    tl.from('#events>div>#event-time', {scale: 0.2, duration: 0.7, stagger: EVENTS_STAGGER, ease: 'elastic.out(1.2,0.75)'}, '<')
}
function titleOut(tl=null) {
    if(tl == null)
        tl = new gsap.timeline({ease: 'power1.in'})
    tl.to('#title-box', {left: 1000, duration: 0.6}, '-=0.3');
}
function eventsOut(tl=null) {
    tl.to('#events>*', {bottom: 1000, stagger: EVENTS_STAGGER/2, duration: 1.6});
    tl.set('#events>*', {bottom: 0, opacity: 0});
}
function animateOut() {
    return new Promise((resolve, reject) => {
        // Same structure as animateIn, just in reverse (or it can do something else)
        const tl  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});
        eventsOut(tl);
        titleOut(tl);
        tl.set('#title-box', {left: 0, opacity: 0});
        // t_l.set('#title-box', {clipPath: ""});
        // tl.to('#events>*', {bottom: 1000, stagger: EVENTS_STAGGER/2, duration: 1.6});
        // tl.to('#title-box', {left: 1000, duration: 0.6}, '-=0.3');
        // tl.set('#title-box', {left: 0, opacity: 0});
        // tl.set('#events>*', {bottom: 0, opacity: 0});
    })
}

async function update(incomingChange) {
    jsonChange = JSON.parse(incomingChange)

    if(state == 2 && jsonChange["triggerUpdate"] == data["triggerUpdate"]) return
    if(state > 1 && state < 2) {
        setTimeout(() => {update(incomingChange)}, 100)
    }

    let titleChanged = false;
    let filterChanged = false;
    for(const[key, newValue] of Object.entries(jsonChange)) {
        console.log(key, newValue)
        if(newValue == data[key]) continue;
        if(["title", "subtitle"].includes(key)) {
            titleChanged = true
        } else {
            filterChanged = true
        }
        data[key] = newValue;
    }
    console.log("TitleChanged = "+titleChanged)
    console.log("FilterChanged = "+filterChanged)
    if (state == 2) {
        console.log("Animating Out")
        await new Promise((resolve, reject) => {
            const t_l = new gsap.timeline({ease: 'power1.in', onComplete: resolve})
            
            if(filterChanged) {
                eventsOut(t_l);
            }
            if(titleChanged) {
                titleOut(t_l);
                t_l.set('#title-box', {left: 0, opacity: 0});
            }
        })
    }

    console.log("Changed")
    if(titleChanged) {
        document.getElementById("title").textContent = data["title"]
        document.getElementById("subtitle").textContent = data["subtitle"]
    }
    if(filterChanged) {
        console.log("VenueFilter")
        console.log( data["venueFilter"].split(",").map(x => x.trim()).filter(x => x.length > 0))
        await updateSchedule({start: new Date(data["dateStart"]), end: new Date(data["dateEnd"]), rooms: data["venueFilter"].split(",").map(x => x.trim()).filter(x => x.length > 0)})
    }
    
    if (state == 2) {
        console.log("Animating In")
        await new Promise((resolve, reject) => {
            const t_l = new gsap.timeline({ease: 'power1.in', onComplete: resolve})
            if(titleChanged) {
                titleIn(t_l);
            }
            if(filterChanged) {
                eventsIn(t_l);
            }
        })
    }
}

document.addEventListener("DOMContentLoaded", async function(event) {
    state = 1;
    updateSchedule({start: new Date('2026-06-13T04:00:00+01:00'), end: new Date('2026-06-14T03:59:00+01:00'), rooms: ['Wolf Stage']})
})