let state = 1

const vh = document.documentElement.clientHeight/ 100;
const vw = document.documentElement.clientWidth / 100;
let g_width  = -1;
let g_height = -1;
let data = {};
let changed = false;

async function play() {
    if (state == 1) {
        state = 1.1
        await animateIn()
        state = 2
    } else if(state == 2) {
        state = 1.5
        await animateOut()
        state = 1
    }
}

async function update(incomingChange) {
    const graphic = document.querySelector('.graphic')
    const changes = JSON.parse(incomingChange)
    if (Object.keys(changes).length == 0) // Nothing sent to change
        return
    if (Object.assign({}, data, JSON.parse(incomingChange)) == data) // No change to make
        return
    
    new_data = Object.assign({}, data, JSON.parse(incomingChange))
    if (typeof window.g_updateS != 'function') // No function to make the change 
        return
    
    if (state != 2) {  // Static update (not visible)
        data = new_data
        g_updateS(graphic, changes);
        return
    }

    // Graphic on screen:
    prev_update = (data['update']       || "0") == "1"
    new_update  = (new_data['update']   || "0") == "1"
    data = new_data;
    changed = true;

    if(!(new_update && !prev_update)) // Need to have prev == 0 + new == 1
        return
    
    if (typeof window.g_update === 'function') {
        let clone = graphic.cloneNode(true)
        clone.id = "graphicC";
        clone.style.height = "";
        clone.style.width = ""
        let ref = document.getElementById('ref')
        ref.appendChild(clone);
        const graphicS = await waitForElm('#graphicC')
        
        g_updateS(graphicS, changes);
        const n_width  = graphicS.clientWidth;
        const n_height = graphicS.clientHeight;
        console.log("New Width: "+n_width);
        console.log("New Height: "+n_height);
        g_update(changes, n_height, n_width);
        changed = false;
    } else {
        e = async function() {
            let graphicS = document.querySelector('.graphic') 
            console.log(graphicS)
            console.log("Animate Out")
            await animateOut()
            g_updateS(graphicS, changes);
            changed = false;
            console.log("Animate In")
            await animateIn();
        }
        e()
    } 
}

function animateIn() {
    return new Promise((resolve, reject) => {
        const graphic = document.querySelector('.graphic')
        const tl  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});  
        g_height = graphic.clientHeight
        g_width = graphic.clientWidth
        
        // Setup - make the graphic visible with no height or width
        tl.set(graphic, {
            height: 0,
            width: 0,
            opacity: 1
        }, 'start')
        // 1) Grow the width of the graphic:     (extending out the bottom border)
        tl.to(graphic, {
            width: g_width
        }, 'start')
        // 2) Grow the height of the graphic:    (revealing the information)
        tl.to(graphic, {
            height: g_height
        })
        if (typeof window.g_animateIn === 'function')
            g_animateIn(tl)
    })
}

function animateOut() {
    return new Promise((resolve, reject) => {
        const graphic = document.querySelector('.graphic')
        const tl  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});  
        if (typeof window.g_animateOut === 'function')
            g_animateOut(tl)

        // 1) Shrink the height  (hiding everything)
        tl.to(graphic, {
            height: 0
        })
        // 2) Shrink the width   (hiding the bottom border)
        .to(graphic, {
            width: 0
        })
        // End- Make the graphic invisible (allow the graphic to change size)
        .to(graphic, {
            opacity: 0,
            duration: 0.2
        })
        .set(graphic, {
            width: "",
            height: ""
        })

    }).then(()=> {
        if (changed) {
            data = new_data;
            g_updateS(document.querySelector('.graphic'), data)
        }
    })

}


// Helper Functions:
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
let first_line=true
function log(msg) {
    if (!first_line) msg = "\n"+String(msg)
    else first_line = false

    document.getElementById('log').textContent += String(msg)
}
// From: https://stackoverflow.com/a/61511955
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}