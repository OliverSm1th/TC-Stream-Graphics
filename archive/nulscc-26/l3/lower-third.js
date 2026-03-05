let state = 0
let data = {}

let g_height = 0;
let g_width = 0;

let first_line=true
function log(msg) {
    if (!first_line) msg = "\n"+String(msg)
    else first_line = false

    document.getElementById('log').textContent += String(msg)
}

function play() {
    if (state == 0) {
        // Prep the Graphic - get the initial height + width so it can be reset later
        const graphic = document.querySelector('.graphic')
        g_height = graphic.clientHeight
        g_width = graphic.clientWidth
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


function update(incomingChange) {
    data = Object.assign({}, data, JSON.parse(incomingChange));
    
    // Update text values (number, name + lines)
    const num = document.querySelector('.num')
    num.textContent = (data["p_number"] || "").padStart(2, "0")
    const name = document.querySelector('.top')
    name.textContent = data["p_name"] || ""

    const line1 = document.querySelector('#line1')
    line1.textContent = data["uni_name"] || ""

    const line2 = document.querySelector('#line2')
    line2.textContent = data["p_info"] || ""

    // Update logo
    const logo = document.querySelector('.logo')
    logo.src = data["uni_logo"] || ""
    
    // Update colour (text colour, border & number background)
    const graphic = document.querySelector('.graphic')
    const col = (data["uni_colour"] || "#b93434").padEnd(9,"c")
    graphic.style.borderBottomColor =  col
    num.style.backgroundColor = col

    const info = document.querySelector('.info')
    info.style.color = col
    graphic.style.width = "max-content"

    g_width = graphic.clientWidth;
}

function animateIn() {
    return new Promise((resolve, reject) => {
        const graphic = document.querySelector('.graphic')
        const t1  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});  
        // Setup - make the graphic visible with no height or width
        t1.set(graphic, {
            height: 0,
            width: 0,
            opacity: 1
        }, 'start')
        // 1) Grow the width of the graphic:     (extending out the bottom border)
        t1.to(graphic, {
            width: g_width
        }, 'start')
        // 2) Grow the height of the graphic:    (revealing the information)
        t1.to(graphic, {
            height: g_height
        })
    })
}
function animateOut() {
    return new Promise((resolve, reject) => {
        const graphic = document.querySelector('.graphic')
        const t1  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});  
        // 1) Shrink the height  (hiding everything)
        t1.to(graphic, {
            height: 0
        })
        // 2) Shrink the width   (hiding the bottom border)
        .to(graphic, {
            width: 0
        })
        // End- Make the graphic invisible
        .set(graphic, {
            opacity: 0
        })
    })
}