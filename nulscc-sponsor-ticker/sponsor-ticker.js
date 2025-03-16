let state = 1
gsap.registerPlugin(TextPlugin);


// const images = [
//     "../media/sponsors/A_CAC.png",
//     "../media/sponsors/B_ Banana Moon.png",
//     "../media/sponsors/B_ Happy Idiot.png",
//     "../media/sponsors/B_ Lattice.png",
//     "../media/sponsors/C_ ClimbEquip.png",
//     "../media/sponsors/C_ DMM.png",
//     "../media/sponsors/C_ LaSportiva.png",
//     "../media/sponsors/C_ Lockwoods.png",
//     "../media/sponsors/C_ Scarpa.png",
//     "../media/sponsors/D_ Black Diamond.png",
//     "../media/sponsors/D_ Gekco.png",
//     "../media/sponsors/D_ ProcessPhysio.png",
//     "../media/sponsors/D_ Shoechalk.png",
//     "../media/sponsors/X_ TechCrew.png",
//     "../media/sponsors/X_ Warwick.png",
//     "../media/sponsors/X_ WUCC.png",
// ]
// const images = [
//     "A_CAC.png",
//     "B_ Banana Moon.png",
//     "B_ Happy Idiot.png",
//     "B_ Lattice.png",
//     "C_ ClimbEquip.png",
//     "C_ DMM.png",
//     "C_ LaSportiva.png",
//     "C_ Lockwoods.png",
//     "C_ Scarpa.png",
//     "D_ Black Diamond.png",
//     "D_ Gekco.png",
//     "D_ ProcessPhysio.png",
//     "D_ Shoechalk.png",
//     "X_ TechCrew.png",
//     "X_ Warwick.png",
//     "X_ WUCC.png",
// ]
const img_num = 17
// const images_path = "~/Documents/Education/3.Warwick University/TC/NULSCC/Sponsors/"
const delay = 6000
const logo_opacity = '80%'
const logo_height = '10vh'


let cur_i = -1;
let interval;
let curTitle = ""
let nextTitle = "Sponsors"
let nextImg = "";

function play() {
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
        t1.to(graphic, {opacity: 1})
        .from(graphic, {
            y: '-8vh',
            duration: .5,
        })
        
        .to(l_help, {
            height:logo_height,
            duration: .3
        })
        .add( logoIn, 1)
    }).then(() => {interval = setInterval(nextLogoIn, delay)})
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
    cur_i = (cur_i+1)%img_num;
    imgId = `img-${cur_i}`
    console.log(imgId)
    template = document.getElementById(imgId)
    nextImg = template.src
    if (cur_i == 14) {
        nextTitle = "Stream by"
    } else if(cur_i > 14) {
        nextTitle = "Supported by"
    } else {
        nextTitle = "Sponsors"
    }
    // if (images[cur_i].includes("TechCrew")) {
    //     nextTitle = "Stream by"
    // } else if(images[cur_i].startsWith("X_ ")) {
    //     nextTitle = "Supported by"
    // } else {
    //     nextTitle = "Sponsors"
    // }
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
        opacity: logo_opacity
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