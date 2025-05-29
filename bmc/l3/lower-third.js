let state = 0
let data = {}
let tags = {}
let tags_k = []
const size = 1.3

const vh = document.documentElement.clientHeight/ 100;
const vw = document.documentElement.clientWidth / 100;
let g_width = 0;
let NUM_HEIGHT = 15*vh
let TITLE_HEIGHT = 8*vh;
let SUB_TITLE_HEIGHT = 5*vh;
let TAG_HEIGHT = 4*vh
let g_height = TITLE_HEIGHT;

let first_line=true
function log(msg) {
    if (!first_line) msg = "\n"+String(msg)
    else first_line = false

    document.getElementById('log').textContent += String(msg)
}

async function play() {
    // log(`play: state=${state}`)
    if (state == 0) {
        // Prep the Graphic - get the initial height + width so it can be reset later
        const graphic = document.querySelector('.graphic')
        // g_height = graphic.clientHeight
        g_width = graphic.clientWidth
        state = 1
    }
    if (state == 1) {
        state = 1.1
        await animateIn()
        state = 2
    } else {
        state = 1.5
        await animateOut()
        state = 1
    }
}


function update(incomingChange) {
    // log(`update: change=${incomingChange}`)
    data = Object.assign({}, data, JSON.parse(incomingChange));
    data_change = JSON.parse(incomingChange)
    let new_height = TITLE_HEIGHT
    
    // Update text values (number, name + lines)
    const num = document.querySelector('.num')
    if (data_change["p_number"])
        num.textContent = data["p_number"] ? data["p_number"].padStart(2, "0") : ""
    const name = document.querySelector('.top')
    name.textContent = data["p_name"] || ""

    const line1 = document.querySelector('#line1')
    if(data["p_info"]) {
        if (data["p_info"].length > 0) {
            new_height += SUB_TITLE_HEIGHT
        }
        
        // if (data["p_info"].length > 0 && line1.textContent.length == 0)
        //     delta_height += SUB_TITLE_HEIGHT
        // else if(data["p_info"].length == 0 && line1.textContent.length > 0)
        //     delta_height -= SUB_TITLE_HEIGHT
        line1.textContent = data["p_info"]
    }

    // const line2 = document.querySelector('#line2')
    if (data["p_tags"]) {
        // if (data["p_tags"].length > 0 && line2.childElementCount == 0)
        //     delta_height += TAG_HEIGHT
        // else if (data["p_tags"].length == 0 && line2.childElementCount > 0)
        //     delta_height -= TAG_HEIGHT
        if (data["p_tags"].length > 0 ) {
            new_height += TAG_HEIGHT
        }
    }
    changeTags(data["p_tags"] || "")
    

    // Update logo
    const logo = document.querySelector('.logo')
    logo.src = data["logo"] || ""
    
    // Update colour (text colour, border & number background)
    const graphic = document.querySelector('.graphic')
    if (data["colour"]) {
        const col = data["colour"].padEnd(9,"c")
        graphic.style.borderBottomColor =  col
        num.style.backgroundColor = col

        const info = document.querySelector('.info')
        info.style.color = col
    }
    graphic.style.width = "max-content"
    g_width = graphic.clientWidth;
    if(state == 2)
        setHeight(new_height)
    else if(state == 1.1) {
        
        sleep(1000).then(() => {
            if(g_height != new_height)
                setHeight(new_height)
        })
    }
    // log(`Update => g_width=${g_width}`)
}
function setHeight(new_height) {
    g_height = new_height
    console.log(`Changing height: ${g_height}`)
    const graphic = document.querySelector('.graphic')
    const t_l  = new gsap.timeline({ease: 'power1.in', overwrite: 'auto'});  
    t_l.to(graphic, {height: Math.max(g_height, NUM_HEIGHT)})
}

function animateIn() {
    return new Promise((resolve, reject) => {
        const graphic = document.querySelector('.graphic')
        const t1  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});  
        const g_width_s = g_width
        
        // Setup - make the graphic visible with no height or width
        t1.set(graphic, {
            height: 0,
            width: 0,
            opacity: 1
        }, 'start')
        // 1) Grow the width of the graphic:     (extending out the bottom border)
        t1.to(graphic, {
            width: g_width_s
        }, 'start')
        // t1.set(graphic, {
        //     width: 'max-content',
        //     height: 'max-content'
        // })
        // 2) Grow the height of the graphic:    (revealing the information)
        t1.to(graphic, {
            height: Math.max(g_height, NUM_HEIGHT)
        })
        // log(`Animating: g_width=${g_width}`)
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function changeTags(new_tags) {
    const line2 = document.querySelector('#line2')
    const tag_arr = new_tags.trim().split(',').filter((e) => e != "")
    console.log(tag_arr)
    const removed = tags_k.filter((x) => !tag_arr.includes(x))
    const added = tag_arr.filter((x) => !(x in tags))
    for (const remove of removed) {
        tags_k.splice(tags_k.indexOf(remove), 1)
        await animateTagOut(tags[remove], (tags_k.length == 0))
        line2.removeChild(tags[remove])
        delete tags[remove]
    }
    
    let new_children = [];
    let isFirst = tags_k.length == 0
    for (const add of added) {
        const add_child = line2.appendChild(document.querySelector('#l2-template').cloneNode(true))
        new_children.push(add_child);
        const add_item = add_child.querySelector('.tag-item');
        add_item.textContent = add
        tags[add] = add_child
        tags_k.unshift(add)
        add_child.id = `l2-${add}`
    };
    await sleep(100).then(async () => {
        for(const [i, add_child] of new_children.entries()) {
            const add_item = add_child.querySelector('.tag-item');
            add_child.style.opacity = 1
            
            await animateTagIn(add_child, add_item.clientWidth, isFirst && i==0)
            
        }
    })
}


function animateTagIn(tag, width, first=false) {
    return new Promise((resolve, reject) => {
        const t_l  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});
        // if (first) {
        //     console.log
        //     changeHeight(TAG_HEIGHT)
        //     // const l2 = document.querySelector('#line2')
        //     // const l2t = document.querySelector('#l2-template')
        //     // console.log(l2t.clientHeight)
        //     // t_l.to(l2, {height: '4vh'})  
        // }
            
        
        t_l.to(tag, {width: `${width}px`, duration: .5})
    })
}
function animateTagOut(tag, last=false) {
    return new Promise((resolve, reject) => {
        const t_l  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});  
        t_l.to(tag, {width: 0})
        // if (last) {
        //     changeHeight(-1*TAG_HEIGHT)
        //     // const l2 = document.querySelector('#line2')
        //     // t_l.to(l2, {height: 0})  
        // }
    })
}