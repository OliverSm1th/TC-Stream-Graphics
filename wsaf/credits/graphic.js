let state = 0
let data = {}

let g_height = 0;
let g_width = 0;
let t_width = [0,0];

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