// import { Cloudinary } from 'https://cdn.jsdelivr.net/npm/@cloudinary/url-gen/+esm';

let state = -1
gsap.registerPlugin(TextPlugin);

const CLOUDINARY_CLOUD_NAME = 'dzbir1huh'
const TAG_NAME = 'nulscc26-sponsor'
const IMG_OPACITY = '80%'
const DEFAULT_CATEGORY_T = "Sponsored by"

let images = []
let images_mask = []

// Input:
let categories = {
    "A": [0.4, "Supporting"],
    "B": [0.3],
    "C": [0.2],
    "D": [0.1],
    "X": [0.1, "Supported by"],
    "S": [0.1, "Stream by"]
}
let delay = 6000
let seed = 6
let offset = 2
let refresh_threshold = 1  // Threshold at which to refresh the image mask

// Working variables:
let img_height = 0
let interval;
let curTitle = ""
let nextTitle = "Sponsors"
let nextImg = "";
let newData = false;


function mulberry32(seed) {  // Seeded randomness
    return function() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
let random = mulberry32(seed)



async function loadImages() {
    let data_images;
    // List all sponsor images
    try{
        const response = await fetch(`https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/list/${TAG_NAME}.json`)
        const data = await response.json()
        data_images = data.resources
    } catch(err) {console.log(err); return false}

    // Fetch each one + cache it
    let img, img_name, img_category;
    images = data_images.map((img_info) => {
        img_name        = img_info["public_id"]
        img_category    = img_name[0]
        img = new Image()
        img.src = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v${img_info["version"]}/${img_name}.png`
        if (!(img_category in categories)) return false;
        return [img, img_category]
    })

    images_mask = new Array(images.length).fill(true)
    console.log("Loaded images")
    return true
}

function nextImage() {
    if(images_mask.filter(Boolean).length <= images_mask.length * (1-refresh_threshold)) {  
        // Reset mask (TODO: Improve)
        console.log("Resetting mask...")
        images_mask = new Array(images.length).fill(true)
    }
    let images_filtered = images.map((img,i) => [categories[img[1]][0],i]).filter((_,i) => images_mask[i])
    console.log(images_filtered)
    let images_sum = images_filtered.map(img => img[0]).reduce((p, a) => p+a, 0)
    let images_i = random() * images_sum
    let cur_i = 0
    console.log(images_i)
    return images_filtered.find(img => {cur_i += img[0]; return images_i < cur_i})[1]
}

function nextLogo() {
    let img_i = nextImage()
    images_mask[img_i] = false
    let img = images[img_i]
    nextImg = img[0]
    nextTitle = categories[img[1]][1] || DEFAULT_CATEGORY_T
}


function play() {
    if (state < 1) {
        const graphic_helper = document.querySelector('.graphic .helper')
        img_height = graphic_helper.clientHeight
        graphic_helper.style.height = '0'
        state += 1
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



function logoIn() {
    return new Promise((resolve, reject) => {
        const logo = document.querySelector('.graphic .logo')
        logo.src = nextImg.src


        const t1  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});   
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
    })
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
    state = 1.5
    nextLogo()
    await logoOut()
    await logoIn()
    if(state == 1.5) state = 1
    if(newData) {
        update(newData);
        newData = false
    }
}

async function update(incomingChange) {
    if(state == 1.5) newData = incomingChange
    else newData = false
    Object.assign(window, incomingChange)

}




console.log("Loading images")
loadImages().then((success) => {
    if(!success) return false
    // Apply offset
    for(let i=0; i<offset; i++) nextLogo()
    
    state += 1;
    if (state == 1) play();
})

window['play'] = play;