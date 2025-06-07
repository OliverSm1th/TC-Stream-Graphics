const PRETALX_BASE_URL = 'https://submit.wsaf.org.uk';
const PRETALX_EVENT_SLUG = '2025';
const PRETALX_API_TOKEN = 'l4jfvarm5wg24bgcxwj584e0c110jfms68qb8288cxfpt445362huaif7n5gmf72'
let state = 0;
let event_num = 0;

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
}
function animateInEvent(t_l, event) {
    
}

function animateIn() {
    return new Promise((resolve, reject) => {
        // 1) Fetch the components which will be animated / updated
        // const _ = document.querySelector('__'); 
        
        const t_l  = new gsap.timeline({ease: 'power1.in', onComplete: resolve}); 
        // 2) Use the timeline to animate the element properties  (can change ease)
        // - Instantaneously update properties          (property=value)                https://gsap.com/docs/v3/GSAP/Timeline/set()
        // t_l.set( __component__, {__property__: __value__, ...},  __startTime__);
        // - Animate properties over a duration         (property: original->value)     https://gsap.com/docs/v3/GSAP/Timeline/to()
        // t_l.to(  __component__, {__property__: __value__, ..., duration: __time__, ?ease: __ease__}, __startTime__)
        // - Animate property from a value -> original (property: value->original)      https://gsap.com/docs/v3/GSAP/Timeline/from()
        // t_l.from(__component__, {__property__: __value__, ..., duration: __time__, ?ease: __ease__}, __startTime__)
        // Without a __startTime__ provided, these functions will perform in sequence
    })
}
function animateOut() {
    return new Promise((resolve, reject) => {
        // Same structure as animateIn, just in reverse (or it can do something else)
        const t_l  = new gsap.timeline({ease: 'power1.in', onComplete: resolve}); 
    })
}

document.addEventListener("DOMContentLoaded", function(event) {
    newEvent({time: '12-3pm', name: 'test', type: 'music'})
})