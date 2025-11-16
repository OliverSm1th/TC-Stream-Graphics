let state = 0
gsap.registerPlugin(TextPlugin);


const IMG_NUM = 5
const DELAY = 6000
const IMG_OPACITY = '80%'
let img_height = 0

let cur_i = -1;
let interval;
let curTitle = ""
let nextTitle = "Sponsors"
let nextImg = "";

function play() {
    if (state == 0) {
        const graphic_helper = document.querySelector('.graphic .helper')
        img_height = graphic_helper.clientHeight
        state = 1
        graphic_helper.style.height = '0'
        console.log(img_height)
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
        nextLogo()
        const logo = document.querySelector('.graphic .logo')
        logo.style.opacity = 0;
        const graphic = document.querySelector('.graphic')
        const l_help = document.querySelector('.graphic .helper')
        const desc = document.querySelector('.graphic .desctxt')
        desc.textContent = nextTitle; curTitle = nextTitle
        const t1  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});
        t1.set(graphic, {height: 0})
        .to(graphic, {opacity: 1})
        .from(graphic, {
            y: `-${img_height}`,
            duration: .5,
        })
        .to(l_help, {
            height:img_height,
            duration: .3
        })
        .add( logoIn, 1)
    }).then(() => {interval = setInterval(nextLogoIn, DELAY)})
}
function animateOut() {
    return new Promise((resolve, reject) => {
        clearInterval(interval)
        const graphic = document.querySelector('.graphic')
        const l_help = document.querySelector('.graphic .helper')
        const logo = document.querySelector('.graphic .logo')
        const t1  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});
        t1
        .to(logo, {
            x: '-8vw'
        },'start')
        .to(logo, {
            opacity: 0
        },'start')
        .to(l_help, {
            height: 0,
            paddingTop: 0,
            paddingBottom: 0,
            duration: .3,
        })
        .to(graphic, {
            y: '-8vh',
            duration: .5
        })
        .set(graphic, {opacity: 0})
        .set(graphic, {y:0})
    })
}




function nextLogo() {
    cur_i = (cur_i+1)%IMG_NUM;
    imgId = `img-${cur_i}`
    console.log(imgId)
    template = document.getElementById(imgId)
    nextImg = template.src
    if (cur_i == 2)
        nextTitle = "Stream by"
    else if(cur_i > 2)
        nextTitle = "Supported by"
    else
        nextTitle = "Sponsors"
}

function logoIn() {
    const logo = document.querySelector('.graphic .logo')
    logo.src = nextImg


    const t1  = new gsap.timeline({ease: 'power1.in'});   
    t1
    .set(logo, {
        x: '8vw',
    })

    t1.to(logo, {
        x: 0,
    },'start')
    .to(logo, {
        opacity: IMG_OPACITY
    },'start')

    if (nextTitle == curTitle) return

    const desc = document.querySelector('.graphic .desctxt')
    t1.to(desc, {
        opacity: 1,
        duration: 0.3
    },'start')
    curTitle = nextTitle
}
function logoOut() {
    return new Promise((resolve, reject) => {
        const logo = document.querySelector('.graphic .logo')
        const t1  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});
        
        t1
        .to(logo, {
            x: '-8vw'
        },'start')
        .to(logo, {
            opacity: 0
        },'start')

        if (nextTitle != curTitle) {
            const desc = document.querySelector('.graphic .desctxt')
            t1.to(desc, {
                opacity: 0,
                duration: 0.3
            }, 'start')
            .set(desc, {
                text: nextTitle
            })
        }
    })
}
async function nextLogoIn() {
    nextLogo()
    await logoOut()
    logoIn()
}