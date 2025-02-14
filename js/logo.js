'use strict';

// logo.js
const _graphic = (function() {
    let state = 0;
    // 0 = loading | 1  = ready to be played | 2 = has been played
    let widths = [];

    (function () { // Initialiser
        window['play'] = play;
        prep();

    })()
    function prep() {
        
        const graphic = document.querySelector('.lt-style-one .graphic');
        const lines = graphic.textContent.split('\n').slice(1,-1);
        graphic.textContent = ""
        let template = document.createElement("div")
        template.className = "text-line"
        lines.forEach((line, i) => {
            let line_elem = template.cloneNode()
            line_elem.style.backgroundColor = ((i%2) == 1) ? "#A80000" : "#8C0009"
            // if (i==0)       line_elem.style.setProperty('padding-left', '1.6vw')
            // else if (i==3)  line_elem.style.setProperty('padding-left', '3vw')
            // else if (i==4)  line_elem.style.setProperty('padding-left', '7vw')
            line_elem.appendChild(document.createTextNode(line))
            
            graphic.appendChild(line_elem)
        } )
        const [...linesElem]   = document.querySelectorAll('.text-line')
        linesElem.forEach((line, i) => {
            widths.push(line.offsetWidth)
        })
        new gsap.set(linesElem, {
            width: 0
        })
        new gsap.set(linesElem, {
            delay: 0.1,
            opacity: 1
        })
        state = 1
    }
    function play() {
        if (state == 1) {
            console.log("animating...")
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
            // const graphic = document.querySelector('.lt-style-one .graphic');
            const [...lines]   = document.querySelectorAll('.text-line')
            const t1  = new gsap.timeline({duration: 1.5, ease: 'power1.in', onComplete: resolve});    
            
            lines.forEach((line, i) => {
                t1.to(line, {
                    width: widths[i], duration: 1.5,
                    paddingLeft: '1vw',
                    paddingRight: '2vw',
                }, 0)
            })
            // }, 0)
            // t1.set(lines, {
            //     'margin-right': '100%',
            //     overflow: 'hidden'
            // }, 0)
            // .to(
            //     lines, {
            //         duration: 1,
            //         'margin-right': '0%',
            //         stagger: {
            //             amount: 0.2
            //         },
            //     }
            // )
            // .to(lines, {
            //     delay: 1,
            //     paddingLeft: '1vw',
            //     paddingRight: '2vw',
            //     stagger: {
            //         amount: 0.2
            //     },
            //     ease: "power1.inOut"
            // }, 0)
            // t1.to(lines, {opacity: 1}, 0)
        })
    }
    function animateOut() {
        return new Promise((resolve, reject) => {
            const [...lines]   = document.querySelectorAll('.text-line')
            const t1  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});    
            
            t1.to(lines, {
                width: 0, duration: 1,
                paddingLeft: '0',
                paddingRight: '0',
                stagger: {
                    amount: 0.2
                }})
            // t1.to(lines, {
            //     delay: 1, width: 0, duration: 0.5,
            //     stagger: {
            //         amount: 0.2
            //     },
            //     ease: "power1.inOut"
            // }, 0)
            // .to(lines, {
            //     delay: 1,
            //     paddingLeft: '0',
            //     paddingRight: '0',
            //     stagger: {
            //         amount: 0.2
            //     },
            //     ease: "power1.inOut"
            // }, 0)
        })
    }

    return { };
})()