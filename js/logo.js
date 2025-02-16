'use strict';

// logo.js
let state = 0;
// 0 = loading | 1  = ready to be played | 2 = has been played
let widths = [];

window['play'] = play;

const lines = [
" National",
"Universities",
"Lead and Speed",
"  Climbing",
"        Championships"
]
const colours = [
    "#8C0009",
    "#CE180B",
    "#A80000",
    "#8C0009",
    "#A80000"
]


function prep() {
    const graphic = document.querySelector('.lt-style-one .graphic');
    let template = document.createElement("div")
    template.className = "text-line"
    lines.forEach((line, i) => {
        let line_elem = template.cloneNode()
        line_elem.style.backgroundColor = colours[i]//((i%2) == 1) ? "#A80000" : "#8C0009"
        line_elem.appendChild(document.createTextNode(line))
        
        graphic.appendChild(line_elem)
    } )
    const [...linesElem]   = document.querySelectorAll('.text-line')
    linesElem.forEach((line) => {
        widths.push(line.offsetWidth)
    })
    new gsap.set(linesElem, {
        width: 0,
        opacity: 1
    })

    state = 1
}
function play() {
    if (state == 0) prep()
    if (state == 1) {
        // Play Animation
        animateIn()
        state=2
    } else if (state == 2) {
        // Hide Animation
        animateOut()
        state=1
    }
}
function animateIn() {
    return new Promise((resolve, reject) => {
        const [...lines]   = document.querySelectorAll('.text-line');
        const logo = document.querySelector('.logo');

        const t1  = new gsap.timeline({duration: 4, ease: 'power1.in', onComplete: resolve});    
        t1.fromTo(logo, {
            rotation: -45,
            scale: 0.2
        },{
            opacity: 1,
            rotation: 0,
            scale: 1,
            duration: 0.3,
        }, 0)

        lines.forEach((line, i) => {
            t1.to(line, {
                width: widths[i], duration: 0.5,
                paddingLeft: '2.5vh',
                paddingRight: '5vh',
            }, 0.1*i+0.25)
        })

    })
}
function animateOut() {
    return new Promise((resolve, reject) => {
        const [...lines]   = document.querySelectorAll('.text-line')
        const t1  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});
        const logo = document.querySelector('.logo');    
        
        t1.to(lines, {
            width: 0, duration: 0.5,
            paddingLeft: '0',
            paddingRight: '0',
            stagger: {
                amount: -0.1,
            }}, 0)
        .set(lines, {opacity: 0}, 0.49)
        .to(logo, {
            scale: 0.8,
            opacity: 0,
            duration: 0.2
        }, 0.5)
        .set(lines, {opacity: 1}, 0.6)
    });
}
let first_line=true
function log(msg) {
    if (!first_line) msg = "\n"+msg
    else first_line = false

    document.querySelector('#log').textContent += msg
}