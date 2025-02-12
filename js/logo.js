'use strict';

// logo.js
const _graphic = (function() {
    let state = 0;
    // 0 = loading | 1  = ready to be played | 2 = has been played

    (function () { // Initialiser
        window['play'] = play;
        prep();

    })()
    function prep() {
        
        const graphic = document.querySelector('.lt-style-one .graphic');
        const lines = graphic.textContent.split('\n').slice(1,-1);
        console.log(lines)
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
        state = 1
    }
    function play() {
        if (state == 1) {
            console.log("animating...")
            // Play Animation
            animateIn()
        } else if (state == 2) {
            // Hide Animation

        }
    }
    function animateIn() {
        return new Promise((resolve, reject) => {
            // const graphic = document.querySelector('.lt-style-one .graphic');
            const [...lines]   = document.querySelectorAll('.text-line')
            const t1  = new gsap.timeline({duration: 5, ease: 'power1.in', onComplete: resolve});    
            
            
            t1.from(lines, {
                delay: 1, width: 0, duration: 0.5,
                stagger: {
                    amount: 0.2
                },
                ease: "power1.inOut"
            }, 0)
            .to(lines, {
                delay: 1,
                paddingLeft: '1vw',
                paddingRight: '2vw',
                stagger: {
                    amount: 0.2
                },
                ease: "power1.inOut"
            }, 0)
            .to(lines, {opacity: 1}, 0)
        })
    }

    return { };
})()