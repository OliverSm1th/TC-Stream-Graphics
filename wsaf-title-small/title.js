let state = 0
let data = {}

let g_height = 0;
let g_width = 0;
let t_width = [0,0];
let first_line=true;

function log(msg) {
    if (!first_line) msg = "\n"+String(msg)
    else first_line = false
    msg.match(/.{1,200}/g).forEach(element => {
        document.getElementById('log').textContent += String(element) + "\n";
    });
}
// log("Hello");
// log(Object.getOwnPropertyNames(document));

function play() {
    if (state == 0) {
        // Prep the Graphic - get the initial height + width so it can be reset later
        const t1 = document.querySelector('.triangle')
        const t2 = document.querySelector('.triangle2')
        const graphic = document.querySelector('.graphic')
        g_height = graphic.clientHeight
        g_width = graphic.clientWidth
        state = 1
        t_width[0] = t1.clientWidth;
        t_width[1] = t2.clientWidth;
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
        const outer = document.querySelector('.outer')
        const graphic = document.querySelector('.graphic')
        const t1 = document.querySelector('.triangle')
        
        const t2 = document.querySelector('.triangle2')
        const t_l  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});  
        // Setup - make the graphic visible with no height or width
        t_l.set(t1, {width: 0})
        t_l.set(t2, {width: 0})
        t_l.set(graphic, {width: 0})
        t_l.set(outer, {padding: 0, opacity: 1})
        t_l.to(graphic, {
            width: g_height,
            duration: .5
        }, 'start')
        
        t_l.to(t1, {
            width: t_width[0],
            duration: .4}, .5)
        t_l.to(t2, {
            width: t_width[1],
            duration: .5}, .7)
        t_l.to(graphic, {
                width: g_width,
                duration: .5
            }, 1.4)
        t_l.to(outer, {
            padding: 12,
            duration: .8,
            ease: 'elastic.out(1.2,0.75)'
        }, 1.8)
        
        
    })
}
function animateOut() {
    return new Promise((resolve, reject) => {
        const outer = document.querySelector('.outer')
        const graphic = document.querySelector('.graphic')
        const t_l  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});  
        t_l.to(graphic, {
            width: g_height,
            duration: .3
        })
        t_l.to(graphic, {
            width: 0,
            duration: .3
        }, .5)
        t_l.to(outer, {
            paddingLeft: 0,
            paddingRight: 0,
            duration: .2
        }, .7)
    })
}