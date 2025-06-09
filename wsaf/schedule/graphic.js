const PRETALX_BASE_URL = 'https://submit.wsaf.org.uk';
const PRETALX_EVENT_SLUG = '2025';
const PRETALX_API_TOKEN = 'l4jfvarm5wg24bgcxwj584e0c110jfms68qb8288cxfpt445362huaif7n5gmf72'
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
        if (!res.ok) {  throw new Error(`Failed to fetch Pretalx data: ${await res.text()}`)    }
        return res.json()
    } catch(err) {
        throw new Error(`Error fetching Pretalx data: ${err}`)
    }
    
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
        t_l.to('#title-box', {left: 1000, duration: 1}, '-=0.3');
        t_l.set('#title-box', {left: 0, opacity: 0});
        t_l.set('#events>*', {bottom: 0, opacity: 0});
        // t_l.set('#title-box', {left: 2000, opacity: 1});
        // t_l.set('#events>*', {left: 2000, opacity: 1});
        // t_l.set('#events>div>#event-time', {opacity: 0});

        // t_l.to('#title-box', {left: 0, duration:0.8})
        // t_l.to('#events>*', {left: 0, duration:1, stagger: EVENTS_STAGGER}, '-=0.2');
        // t_l.set('#events>div>#event-time', {opacity: 1}, '<+=1.005')
        // t_l.from('#events>div>#event-time', {scale: 0.2, duration: 0.7, stagger: EVENTS_STAGGER, ease: 'elastic.out(1.2,0.75)'}, '<')
    })
}

document.addEventListener("DOMContentLoaded", function(event) {
    // fetchSchedule();
    newEvent({time: '12-3pm', name: 'test', type: 'music', id: '123'})
    newEvent({time: '12-3pm', name: 'test', type: 'music', id: '124'})
    newEvent({time: '12-3pm', name: 'test', type: 'music', id: '125'})
})