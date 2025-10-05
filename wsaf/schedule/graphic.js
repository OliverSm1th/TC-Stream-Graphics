// API Fetching:
const PRETALX_BASE_URL = 'http://localhost:8010/proxy';     // <- Need to setup a cors proxy using 'npm run proxy'
// const PRETALX_BASE_URL = 'https://submit.wsaf.org.uk';   // <- Currently there's no CORS setup on the WSAF server
const PRETALX_EVENT_SLUG = '2025';
const PRETALX_API_TOKEN = 'l4jfvarm5wg24bgcxwj584e0c110jfms68qb8288cxfpt445362huaif7n5gmf72'
const WSAF_BASE_URL = 'https://wsaf.org.uk/api'

// API Override:
const PRETALX_SCHEDULE_OVERRIDE = [{
    day_start:  "2025-10-05T18:55:00+01:00",
    day_end:    "2025-10-05T22:00:00+01:00",
    rooms: {
        'Helen Martin Studio' : [{
            
        }]
    }

}] // (see fetchSchedule for structure)

// Graphics Config:
const EVENTS_STAGGER = 0.2;
const EVENTS_MAX = 8;


let state = 0;
let eventElems = [];
let tracks = {
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
      'MTW Stagefest': {
        label: 'MTW Stagefest',
        icon: "person-booth",
        colour: '#14b8a6', // teal-500
      },
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

function play() {
    if (state == 1) {
        animateIn()
        state = 2
    } else {
        animateOut()
        state = 1
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
        return res.json().schedule.conference.days
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
async function fetchEventDetails(event_id) {
    try{
        const res = await fetch(`${WSAF_BASE_URL}/events/${event_id}`, {
        });
        if (!res.ok) {  throw new Error(`${await res.text()}`)    }
        return res.json()
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
    const schedule = await fetchSchedule();
    const days = schedule.filter(day => filters.start ? !(new Date(day.day_end) < filters.start || new Date(day.day_start)> filters.end): true)
                         .reduce((res, day)=>{
        let filtered_rooms = Object.filterV(day.rooms, (k,v) => filters.rooms ? filters.rooms.includes(k) : true).flat(1);
        if (filtered_rooms.length > 0)
            res[(typeof day.index == 'number') ? day.date : day.index] = filtered_rooms;
        return res;
    },{})
    const parent = document.getElementById('events');
    const showLocation = (filters.rooms ? filters.rooms.length > 0 : false);

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
    .then(() => {if (state == 2) eventsIn(); else console.log("Loaded")});    
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

function newEventF(event, showLocation=false) {
    return new Promise(async (resolve, reject) => {
        let event_date = new Date(event.date).toISOString();
        const event_d = await fetchEventDetails(event.code);    
        const session_d = event_d.sessions.filter(s => s.start == event_date)[0];
        resolve(newEvent(event_d, session_d, showLocation));
    })
}


function newEvent(eventInfo, sessionInfo, location) {
    /*eventInfo
        artGallery: bool, artist: { name, description, image, instagramHandle, website },
        categoryPretalxTrack, description, dropIn: bool, id, image, name, sessionCount: number,
        sessions: [{ durationCategory, start, end, id, minutes, venue }], shortDescription, slug
      sessionInfo
        durationCategory, start, end, id, minutes, venue
    */
    const template = document.getElementById('event-template');
    let cloned = template.content.cloneNode(true);
    let event = cloned.getElementById("event")
    
    
    event.id='event-'+eventInfo.id;

    event.querySelector('#event-time').textContent = (sessionInfo.start && sessionInfo.end) ? formatTimeStr(sessionInfo.start, sessionInfo.end) : '';
    event.querySelector('#event-name').textContent = eventInfo.name || '';
    event.querySelector('#event-by').textContent = eventInfo.artist.name;
    // Track:
    const event_track = tracks[eventInfo.categoryPretalxTrack]
    event.style.color =event_track.colour
    event.querySelector('#event-box').style.backgroundColor = mix(event_track.colour, '#FFFFFFFF', 0.9)
    // event.querySelector('#event-box').style.
    event.querySelector('#track-name').textContent = event_track.label;
    let icon_ref = document.createElementNS("http://www.w3.org/2000/svg", "use");
    icon_ref.setAttribute('href', `#${event_track.icon}-icon`);
    // let icon = document.getElementById(`#${event_track.icon}-icon`)
    event.querySelector('#track-icon').appendChild(icon_ref);
    event.querySelector('#track-icon').style.fill = event_track.colour;
    console.log(sessionInfo)
    if(location) {
        event.querySelector('#event-location').textContent = sessionInfo.venue.name
        event.querySelector('#location-icon').style.fill = event_track.colour;
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

async function animateIn() {
    const t_l = new gsap.timeline({ease: 'power1.in'})
    titleIn(t_l);
    eventsIn(t_l);
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
    tl.to('#events>*', {left: 0, duration:0.7, stagger: EVENTS_STAGGER})
    tl.set('#events>div>#event-time', {opacity: 1, stagger: EVENTS_STAGGER}, '<+=0.9')
    tl.from('#events>div>#event-time', {scale: 0.2, duration: 0.7, stagger: EVENTS_STAGGER, ease: 'elastic.out(1.2,0.75)'}, '<')
}
function animateOut() {
    return new Promise((resolve, reject) => {
        // Same structure as animateIn, just in reverse (or it can do something else)
        const tl  = new gsap.timeline({ease: 'power1.in', onComplete: resolve}); 
        // t_l.set('#title-box', {clipPath: ""});
        tl.to('#events>*', {bottom: 1000, stagger: EVENTS_STAGGER/2, duration: 1.6});
        tl.to('#title-box', {left: 1000, duration: 0.6}, '-=0.3');
        tl.set('#title-box', {left: 0, opacity: 0});
        tl.set('#events>*', {bottom: 0, opacity: 0});
    })
}

document.addEventListener("DOMContentLoaded", async function(event) {
    state = 1;
    updateSchedule({start: new Date('2025-06-13T04:00:00+01:00'), end: new Date('2025-06-14T03:59:00+01:00'), rooms: ['Benefactors Place Stage', 'FAB Theatre', 'FAB Terrace']})
})