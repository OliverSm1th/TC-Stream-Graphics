const CLOUDINARY_CLOUD_NAME = 'dzbir1huh'
const TAG_NAME = 'uni'

let state = 0
let data = {}
let uni_info_dict;
let fetch_unis = false;
let load_uni = true;
let cached;

let g_height = 0;
let g_width = 0;

let first_line = true
let side = "right"

let ws_url = 'ws://localhost:8765'

function log(msg) {
    if (!first_line) msg = "\n" + String(msg)
    else first_line = false

    document.getElementById('log').textContent += String(msg)
}

function play() {
    if (state == 0) {
        // Prep the Graphic - get the initial height + width so it can be reset later
        const graphic = document.querySelector('.graphic')
        const helper = graphic.querySelector('.helper')
        g_height = graphic.clientHeight
        g_width = helper.clientWidth
        state = 1
    }
    if (state == 1) {
        if (!load_uni) { setTimeout(play, 100); return }
        animateIn()
        state = 2
    } else {
        animateOut()
        state = 1
    }
}

async function prep_uni() {
    uni_data = await (await fetch(`https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/list/${TAG_NAME}.json`)).json()
    console.log(uni_data)
    uni_info_dict = uni_data['resources'].reduce((prev, cur) => ((!('context' in cur)) ? prev : { ...prev, [cur['public_id']]: { colour: cur['context']['custom']['colour'], name: cur['context']['custom']['name'] } }), {})
    fetch_unis = true
}


async function updateUni(uni_code_p) {
    let uni_code = uni_code_p.toUpperCase()
    if (!(uni_code in uni_info_dict)) {
        console.log(`Invalid Uni ID: ${uni_code}`)
        return
    }
    uni_info = uni_info_dict[uni_code]  // {colour}

    load_uni = false
    img = new Image()
    img.onload = () => { load_uni = true }
    img.src = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${uni_code}`
    cached = img

    document.querySelector('.logo').src = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${uni_code}`
    document.querySelector('.graphic .inner').style.color = `#${uni_info.colour}`
    document.querySelector('.graphic .right').style.backgroundColor = `#${uni_info.colour}`
    document.querySelector('.graphic .helper').style.backgroundColor = `#${uni_info.colour}`
    document.querySelector('.graphic #line2').style.backgroundColor = `#${uni_info.colour}`
    document.querySelector('#line3').textContent = uni_info.name
    // row_inner.querySelector('.name').style.color = `#${uni_info.colour}`
}


function update(incomingChange) {
    if (!fetch_unis) { setTimeout(() => { update(incomingChange) }, 100); return }
    newData = Object.assign({}, data, JSON.parse(incomingChange));

    // Update text values (number, name + lines)
    const num = document.querySelector('.num')
    num.textContent = (newData["p_number"] || "").trim().padStart(2, "0")
    const name = document.querySelector('.top')
    name.textContent = (newData["p_name"] || "").trim()

    const line1 = document.querySelector('#line1')
    line1.textContent = (newData["p_info"] || "").trim()

    const line2 = document.querySelector('#line2')
    line2.textContent = (newData["p_extra"] || "").trim()

    side = newData["side"] || "right"

    // Update websocket URL
    if (newData["ws-url"] && newData["ws-url"] != ws_url) {
        if (ws) ws.close();
        ws_url = newData["ws-url"];
        ws = new WebSocket(ws_url);
        ws.onmessage = (event) => {
            update_timer_data(event);
        };
        ws.onclose = () => console.log("Disconnected from Gateway");
    }

    // Update logo
    if (newData["uni_id"] != data["uni_id"]) {
        updateUni(newData["uni_id"])
    }

    g_width = document.querySelector('.graphic .helper').clientWidth;
    data = newData;
}

function animateIn() {
    return new Promise((resolve, reject) => {
        const graphic = document.querySelector('.graphic')
        const helper = graphic.querySelector('.helper')
        const inner = graphic.querySelector('.inner')
        const num = graphic.querySelector('.right')
        const logo = graphic.querySelector('.logo')
        const tl = new gsap.timeline({ ease: 'power1.in', onComplete: resolve });
        // Setup - make the graphic visible with no height or width
        tl.set(inner, {
            width: 0
        })
        tl.set(num, {
            opacity: 0
        })
        tl.set(graphic, {
            height: helper.clientHeight,
            opacity: 1
        }, 'start')

        tl.from(logo, {
            rotation: -45,
            scale: 0.1,
            duration: 0.3,
            opacity: 0
        })
        // 1) Grow the width of the graphic:     (extending out the bottom border)
        tl.to(inner, {
            width: g_width
        })
        tl.set(num, {
            opacity: 1
        })
        // 2) Grow the height of the graphic:    (revealing the information)
        tl.to(graphic, {
            height: g_height
        })
    })
}
function animateOut() {
    return new Promise((resolve, reject) => {
        const graphic = document.querySelector('.graphic')
        const t1 = new gsap.timeline({ ease: 'power1.in', onComplete: resolve });
        // 1) Shrink the height  (hiding everything)
        t1.to(graphic, {
            height: 0
        })
            // 2) Shrink the width   (hiding the bottom border)
            // .to(graphic, {
            //     width: 0
            // })
            // End- Make the graphic invisible
            .set(graphic, {
                opacity: 0,
                height: ""
            })
    })
}

// `totalMs` comes from the server as integer milliseconds.
function formatTime(totalMs) {
    const s = Math.floor((totalMs / 1000) % 100);
    const ms = totalMs % 1000;
    return `${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

function updateLane(time, rx, status) {
    const timerEl = document.querySelector('.time');
    // const statusEl = document.getElementById(`status-${side}`);
    // const rxEl = document.getElementById(`rx-${side}`);
    const rxEl = document.getElementById(`reaction-time`);

    // Update Text
    timerEl.innerText = status === "FS" ? "FS" : formatTime(time);
    // rx is now milliseconds; display in seconds with three decimals
    rxEl.innerText = rx > 0 ? `${(rx / 1000).toFixed(3)}` : '0.000';
    // statusEl.innerText = status === "RUNNING" ? "" : status;

    // Update CSS Classes [cite: 51, 52, 53]
    // laneEl.className = `lane ${status}`;

    // Custom Handling for WIN
    // if (status === "WIN") statusEl.innerText = "WINNER!";
}



function update_timer_data(event) {
    const timer_data = JSON.parse(event.data);
    if (side === "right") {
        updateLane(timer_data.right_time, timer_data.right_rx, timer_data.right_status);
    } else if (side === "left") {
        updateLane(timer_data.left_time, timer_data.left_rx, timer_data.left_status);
    }
}

ws = new WebSocket(ws_url);
ws.onmessage = (event) => {
    update_timer_data(event);
};
ws.onclose = () => console.log("Disconnected from Gateway");

prep_uni()
