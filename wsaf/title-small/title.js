let state = 1;
let data = {
    "title": "Title",
    "subtitle": "Subtitle"
}

function play() {
    if (state == 1) {
        animateIn();
    }
    else {
        animateOut();
    }
    state = (state) % 2 + 1;
}
function update(incomingChange) {
    for(const[key, newValue] of Object.entries(JSON.parse(incomingChange))) {
        console.log(key, newValue)
        if(newValue == data[key]) continue;
        if(state == 2) {
            const t_l = gsap.timeline({ ease: 'power1.in'});
            textOut(t_l, `#${key}`,0.5)
            t_l.add(function () {document.querySelector(`#${key}>div`).textContent = newValue.trim()});
            textIn(t_l, `#${key}`,0.5);
        }  else {
            document.querySelector(`#${key}>div`).textContent = newValue.trim();
        }
        data[key] = newValue;
    }
}
function animateIn() {
    return new Promise((resolve, reject) => {
        const t_l = gsap.timeline({ ease: 'power1.in', onComplete: resolve });
        textIn(t_l, "#title", 0.5);
        textIn(t_l, "#subtitle", 0.5, "-=0.2");
    });
}
function animateOut() {
    return new Promise((resolve, reject) => {
        const t_l = gsap.timeline({ ease: 'power1.in', onComplete: resolve });
        textOut(t_l, "#title", 0.5);
        textOut(t_l, "#subtitle", 0.5, 0);
    });
}

function textIn(t_l, selector, duration, time) {
    t_l.set(selector, {opacity: 1}, time)
    t_l.from(selector, {width: 0, duration: duration, immediateRender:false}, '<')
    // immediateRender - Ensure the 'from' only sets the width to 0 at the current point of the timeline
    //  (i.e. prevents it from doing it at the start of the timeline)
}
function textOut(t_l, selector, duration, time) {
    t_l.to( selector, {width: 0, duration: duration}, time)
    t_l.set(selector, {opacity: 0, clearProps:"width"});
}