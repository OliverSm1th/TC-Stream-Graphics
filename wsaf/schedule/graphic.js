const PRETALX_BASE_URL = 'http://localhost:8010/proxy';  // <- Need to setup a cors proxy using 'npm run proxy'
// const PRETALX_BASE_URL = 'https://submit.wsaf.org.uk';  // <- Waiting for Adam to add CORS to server

const PRETALX_EVENT_SLUG = '2025';
const PRETALX_API_TOKEN = 'l4jfvarm5wg24bgcxwj584e0c110jfms68qb8288cxfpt445362huaif7n5gmf72'
const WSAF_BASE_URL = 'https://wsaf.org.uk/api'
const EVENTS_STAGGER = 0.2
let state = 0;
let event_num = 0;
let events = {};

function play() {
    if (state == 0) {
        // Prep the graphic (if needed)
        state = 1
    }
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
        const res = await fetch(`${PRETALX_BASE_URL}/${PRETALX_EVENT_SLUG}/p/broadcast-tools/wsaf_schedule.json`, {
            headers: {
                Authorization: `Token ${PRETALX_API_TOKEN}`,
                Accept: 'application/json',
              },
        });
        if (!res.ok) {  throw new Error(`${await res.text()}`)    }
        return res.json()
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
    const result = await fetchSchedule();
    const info = result.schedule.conference;
    const tracks = info.tracks;
    console.log(info.days)
    const days = info.days.filter(d => filters.start ? !(new Date(d.day_end) < filters.start || new Date(d.day_start)> filters.end): true).reduce((res, day)=>{
        let filtered_rooms = Object.filterV(day.rooms, (k,v) => filters.rooms ? filters.rooms.includes(k) : true).flat(1);
        if (filtered_rooms.length > 0)
            res[(typeof day.index == 'number') ? day.date : day.index] = filtered_rooms;
        return res;
    },{})
    console.log(days)
    for(const [day,events] of Object.entries(days)) {
        console.log(events.sort((a,b)=>Date.parse(a.date)>Date.parse(b.date)))
        Promise.all(events.sort((a,b)=>Date.parse(a.date)>Date.parse(b.date)).map(async event => {
            /* code, do_not_record:bool, date */
            const event_d = await fetchEventDetails(event.code);
            /*  artGallery: bool, artist: { name, description, image, instagramHandle, website },
                categoryPretalxTrack, description, dropIn: bool, id, image, name, sessionCount: number,
                sessions: [{ durationCategory, start, end, id, minutes, venue }], shortDescription, slug */
            let event_date = new Date(event.date).toISOString();
            const session_d = event_d.sessions.filter(s => s.start == event_date)[0];
            return newEvent(event_d, session_d);
        })).then(async (elems) => {
            const parent = document.getElementById('events');
            for(const elem of elems) {
                await parent.appendChild(elem);
            }
        })
    }
}


function newEvent(eventInfo, sessionInfo) {
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
    
    
    event.id='event-'+event.id;

    event.querySelector('#event-time').textContent = (sessionInfo.start && sessionInfo.end) ? formatTimeStr(sessionInfo.start, sessionInfo.end) : '';
    event.querySelector('#event-name').textContent = eventInfo.name || '';
    event.querySelector('#event-by').textContent = eventInfo.artist.name;
    
    return cloned;
    // parent.appendChild(cloned);
    // events[eventInfo.id] = event.id;
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
function animateInEvent(t_l, event, start) {
    console.log("Animating")
    const event_time = event.querySelector('#event-time')
    
    t_l.set(event, {left: 2000, opacity: 1})
    t_l.set(event_time, {rotate: 0})
    t_l.to(event, {left: 0, duration:1}, start)
    t_l.to(event_time, {rotate: '-5deg', duration: 0.1}, start+1)
}

function animateIn() {
    return new Promise((resolve, reject) => {
        const t_l  = new gsap.timeline({ease: 'power1.in', onComplete: resolve}); 
        t_l.set('#title-box', {left: 2000, opacity: 1});
        t_l.set('#events>*', {left: 1000, opacity: 1});
        t_l.set('#events>div>#event-time', {opacity: 0});

        t_l.to('#title-box', {left: 0, duration:0.8})
        t_l.to('#events>*', {left: 0, duration:0.7, stagger: EVENTS_STAGGER}, '-=0.2');
        t_l.set('#events>div>#event-time', {opacity: 1}, '<+=0.9')
        t_l.from('#events>div>#event-time', {scale: 0.2, duration: 0.7, stagger: EVENTS_STAGGER, ease: 'elastic.out(1.2,0.75)'}, '<')
    })
}
function animateOut() {
    return new Promise((resolve, reject) => {
        // Same structure as animateIn, just in reverse (or it can do something else)
        const t_l  = new gsap.timeline({ease: 'power1.in', onComplete: resolve}); 
        // t_l.set('#title-box', {clipPath: ""});
        t_l.to('#events>*', {bottom: 500, stagger: EVENTS_STAGGER/2, duration: 0.8});
        t_l.to('#title-box', {left: 1000, duration: 0.6}, '-=0.3');
        t_l.set('#title-box', {left: 0, opacity: 0});
        t_l.set('#events>*', {bottom: 0, opacity: 0});
    })
}

document.addEventListener("DOMContentLoaded", function(event) {
    // fetchEventDetails("8C9P73").then(result => console.log(result));
    updateSchedule({start: new Date('2025-06-13T04:00:00+01:00'), end: new Date('2025-06-14T03:59:00+01:00'), rooms: ['Benefactors Place Stage']})
    // newEvent({time: '12-3pm', name: 'test', type: 'music', id: '123'})
    // newEvent({time: '12-3pm', name: 'test', type: 'music', id: '124'})
    // newEvent({time: '12-3pm', name: 'test', type: 'music', id: '125'})
})