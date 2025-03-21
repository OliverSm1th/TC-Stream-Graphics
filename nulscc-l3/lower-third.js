let state = 0
let data = {}
// console.log(g_width)

let g_height = 0;
let g_width = 0;

let first_line=true
function log(msg) {
    if (!first_line) msg = "\n"+String(msg)
    else first_line = false

    document.getElementById('log').textContent += String(msg)
}

// window.onload = function() {
//     params_str = window.location.search
//     if (params_str.length == 0) return
//     params_str = params_str.substring(1)
//     params = {}
//     params_str.split('&').forEach(param => {
//         let [k, v] = params_str.split('=')
//         params[k] = v
//     });

//     if (!"debug" in params) return

//     if (params["debug"] == "update") {
//         devClasses = ["CONTROLS", "PLAY", "NEXT", "STOP"]
//         console.log("UPDATE!!")
//         devClasses.forEach((devClass => {
//             let devCur = document.getElementsByClassName(`DEV-WIDGET-${devClass}`)[0]
//             console.log(devCur)
//             devCur.style.display = 'none'
//         }))
//         document.getElementsByClassName(`DEV-WIDGET-OPEN`)[0].style.display = ""
//     }
// }


function play() {
    if (state == 0) {
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
    // log(incomingChange)
    // obj_dict = Object.entries(JSON.parse(incomingChange))
    data = Object.assign({}, data, JSON.parse(incomingChange));
    const num = document.querySelector('.num')
    num.textContent = (data["p_number"] || "").padStart(2, "0")
    const name = document.querySelector('.top')
    name.textContent = data["p_name"] || ""

    const line1 = document.querySelector('#line1')
    line1.textContent = data["uni_name"] || ""

    const logo = document.querySelector('.logo')
    logo.src = data["uni_logo"] || ""
    
    const graphic = document.querySelector('.graphic')
    const col = (data["uni_colour"] || "#b93434").padEnd(9,"c")
    graphic.style.borderBottomColor =  col
    num.style.backgroundColor = col

    const line2 = document.querySelector('#line2')
    line2.textContent = data["p_info"] || ""
    
    const info = document.querySelector('.info')
    info.style.color = col
    graphic.style.width = "max-content"

    g_width = graphic.clientWidth;
}

// https://stackoverflow.com/a/32589289
function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' '); 
 }
 

function animateIn() {
    return new Promise((resolve, reject) => {
        const graphic = document.querySelector('.graphic')
        const t1  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});  
        console.log(g_height) 
        t1.set(graphic, {
            height: 0,
            width: 0,
            opacity: 1
        }, 'start')
        t1.to(graphic, {
            width: g_width
        }, 'start')
        t1.to(graphic, {
            height: g_height
        })
    })
}
function animateOut() {
    return new Promise((resolve, reject) => {
        const graphic = document.querySelector('.graphic')
        const t1  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});  
        t1.to(graphic, {
            height: 0
        })
        .to(graphic, {
            width: 0
        })
        .set(graphic, {
            opacity: 0
        })
    })
}