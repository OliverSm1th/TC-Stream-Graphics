let state = 0
let data = {}

let g_height = 0;
// let st_width = 0;
// let g_width = 0;
// let t_width = [0,0];

function play() {
    if (state == 0) {
        const logo = document.querySelector('#logo')
        const line = document.querySelector('#line')
        g_height = logo.clientHeight
        l_width = line.clientWidth
        const t_l  = new gsap.timeline()
        t_l.set(graphic, {opacity: 1})
        t_l.set(logo, {height: 0})
        t_l.set(title, {opacity: 0, scale: 0.7})
        t_l.set(subtitle, {opacity: 0, scale: 0.7})
        t_l.set(smalltitle, {opacity: 0, scale: 0.7})
        t_l.set(line, {width: 0})
        
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
        // const outer = document.querySelector('.outer')
        const graphic = document.querySelector('#graphic')
        const logo = document.querySelector('#logo')
        const title = document.querySelector('#title')
        const subtitle = document.querySelector('#subtitle')
        const smalltitle = document.querySelector('#smalltitle')
        const line = document.querySelector('#line')
        // const t1 = document.querySelector('.triangle')
        // const t2 = document.querySelector('.triangle2')

        const t_l  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});  
        // Setup - make the logo visible with no height or width
        
        t_l.to(logo, {
            height: g_height,
            duration: 0.5
        }, 1)
        t_l.to(title, {
            opacity: 1,
            scale: 1,
            ease: 'elastic.out(1.2,0.75)',
            duration: 0.5
        }, 1.5)
        t_l.to(subtitle, {
            opacity: 1,
            scale: 1,
            ease: 'elastic.out(1.2,0.75)',
            duration: 0.5
        }, 1.7)
        t_l.to(line, {
            width: l_width,
        }, 2)
        t_l.to(smalltitle, {
            opacity: 1,
            scale: 1,
            ease: 'elastic.out(1.2,0.75)',
            duration: 0.5
        })
        
        
    })
}
function animateOut() {
    return new Promise((resolve, reject) => {
        // const outer = document.querySelector('.outer')
        // const logo = document.querySelector('.logo')
        const t_l  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});
        t_l.to(logo, {
            height: 0,
            duration: 0.3
        })
        t_l.to(title, {
            opacity: 0,
            scale: 0.7,
            duration: 0.3
        }, 0.4)
        t_l.to(subtitle, 
            {opacity: 0,
            scale: 0.7,
            duration: 0.3
        }, 0.5)
        t_l.to(line, {
            width: 0,
            duration: 0.3
        }, 0.6)
        t_l.to(smalltitle, {
            opacity: 0, scale: 0.7,
            duration: 0.2
        }, 0.6)
        
        
        

    })
}