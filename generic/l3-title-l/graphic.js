gsap.registerPlugin(SplitText) 

// function g_updateS(graphicS, changes) {
// }
// function g_update(changes, n_height, n_width) {
// }


function g_animateIn(tl) {
    // let title = document.querySelector('.title').textContent;
    let split = SplitText.create(".title", { type: "words, lines" });
    tl.set('.title', {
        opacity: 1,
        text: ""
    })
    // tl.to('.title', {
    //     duration: 2,
    //     text: {
    //         value: title,
    //         delimiter: " "
    //     },
    // })
    tl.from(split.words, {
        duration: 0.5, 
        y: 100,       // animate from 100px below
        autoAlpha: 0, // fade in from opacity: 0 and visibility: hidden
        stagger: 0.05 // 0.05 seconds between each
    }, ">-=0.2")
    tl.from('.subtitle', {
        opacity: 0,
        y: 20
    })
}
function g_animateOut(tl) {

}