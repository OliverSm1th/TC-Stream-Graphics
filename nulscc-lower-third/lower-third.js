let state = 1
let data = {}
// console.log(g_width)


let first_line=true
function log(msg) {
    if (!first_line) msg = "\n"+String(msg)
    else first_line = false

    document.getElementById('log').textContent += String(msg)
}


function play() {
    if (state == 1) {
        animateIn()
        state = 2
    } else {
        animateOut()
        state = 1
    }
}

// async function getUniInfo(uni_id) {
//     let result = await new Promise(function(resolve, reject) {
//         var xhr = new XMLHttpRequest();
//         xhr.withCredentials = false;
//         xhr.open("GET", "https://nullsccpeople-5603.restdb.io/rest/universities/"+uni_id);
//         xhr.setRequestHeader("content-type", "application/json");
//         xhr.setRequestHeader("x-apikey", "67b87527967a7fca0ab4d797");
//         xhr.setRequestHeader("cache-control", "no-cache");

//         xhr.onload = function () {
//             if (this.status >= 200 && this.status < 300) {
//                 resolve(xhr.responseText);
//             } else {
//                 reject({
//                     status: this.status,
//                     statusText: xhr.statusText
//                 });
//             }
//         };
//         xhr.onerror = function () {
//             reject({
//                 status: this.status,
//                 statusText: xhr.statusText
//             });
//         };

//         xhr.send(null);
//     })
//     log(result)
// }


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
        const g_height = graphic.clientHeight
        const g_width = graphic.clientWidth

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
    })
}