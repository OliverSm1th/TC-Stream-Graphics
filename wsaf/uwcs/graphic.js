let state = 0
const CIRCLE_RADIUS = 21;
let [c1,c2,c3,c4] = [];
// document.addEventListener("DOMContentLoaded", (event) => {
//     gsap.registerPlugin(DrawSVGPlugin)
//     console.log("Registered")
// })

function play() {
    if (state == 0) {
        // Prep the graphic (if needed)
        
        [c1,c2,c3,c4] = document.querySelectorAll('#uwcs_c1, #uwcs_c2, #uwcs_c3, #uwcs_c4'); 
        text = document.querySelector("#uwcs_text")
        // 
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
        
        const t_l  = new gsap.timeline({ease: 'power1.in', onComplete: resolve}); 
        // console.log(text.children);
        // for (let i=0; i<text.children.length; i++) {
        //     t_l.set(text.children[i], {opacity: 0});
        // }
        
        
        t_l.to("#uwcs_c1, #uwcs_c2, #uwcs_c3, #uwcs_c4", {"r": CIRCLE_RADIUS, duration: 0.5, ease: 'elastic.out(1.2,0.75)', stagger: 0.15}, 0)
        

        t_l.set("#uwcs_text", {opacity: 1});
        t_l.from("#uwcs_text > *", {duration:1,stagger: 0.15, opacity: 0})
        // [c1,c2,c3,c4].forEach((elem, i) => {
        //     t_l.to(elem, {"r": CIRCLE_RADIUS, duration: 0.5, ease: 'elastic.out(1.2,0.75)'}, i*0.15);
        // });
        
        // t_l.to(text, {drawSVG: "0% 100%", duration: 1}, 0);
        
        console.log("Finished")
    })
}
function animateOut() {
    return new Promise((resolve, reject) => {
        // Same structure as animateIn, just in reverse (or it can do something else)
        const t_l  = new gsap.timeline({ease: 'power1.in', onComplete: resolve}); 
        t_l.to("#uwcs_c1, #uwcs_c2, #uwcs_c3, #uwcs_c4", {"r": 0, duration: 0.2}, 'start');
    })
}