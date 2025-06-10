const PRETALX_BASE_URL = 'http://localhost:8010/proxy'//'https://submit.wsaf.org.uk';
// Need to setup a cors proxy using 'npm run proxy'
const PRETALX_EVENT_SLUG = '2025';
const PRETALX_API_TOKEN = 'l4jfvarm5wg24bgcxwj584e0c110jfms68qb8288cxfpt445362huaif7n5gmf72'
const WSAF_BASE_URL = 'http://localhost:4000/api'
// Run the wsaf website locally (or use the uwcs dev version) - until the CORS change is pushed to prod
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

async function updateSchedule(filters) {
    console.log(filters)
    const result = await fetchSchedule();
    const info = result.schedule.conference;
    console.log(info)
    const tracks = info.tracks;
    const events = info.days.filter(d => filters.start ? !(Date.parse(d.day_end) < filters.start || Date.parse(d.day_start)> filters.end): true).flatMap((day)=> 
        Object.values(Object.filter(day.rooms, (k,v) => filters.rooms ? filters.rooms.includes(k) : true))
    )
    events.forEach(async event => {
        
    });
    console.log(events)
}


function newEvent(eventInfo) {
    console.log("Woooo");
    const template = document.getElementById('event-template');
    let cloned = template.content.cloneNode(true);
    let event = cloned.getElementById("event")
    const parent = document.getElementById('events');
    
    event.id='event-'+(event_num++);

    event.querySelector('#event-time').textContent = eventInfo.time || '';
    event.querySelector('#event-name').textContent = eventInfo.name || '';
    event.querySelector('#event-by').textContent = eventInfo.by || '';
    

    parent.appendChild(cloned);
    events[eventInfo.id] = document.getElementById(event.id);
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
    fetchEventDetails("8C9P73").then(result => console.log(result));
    // updateSchedule({start: Date.parse('2025-06-13T04:00:00+01:00'), end: Date.parse('2025-06-14T03:59:00+01:00'), rooms: ['Benefactors Place Stage']})
    newEvent({time: '12-3pm', name: 'test', type: 'music', id: '123'})
    newEvent({time: '12-3pm', name: 'test', type: 'music', id: '124'})
    newEvent({time: '12-3pm', name: 'test', type: 'music', id: '125'})
})