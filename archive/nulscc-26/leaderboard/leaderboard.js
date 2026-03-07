const CLOUDINARY_CLOUD_NAME = 'dzbir1huh'
const TAG_NAME = 'uni'

let state = 0
let g_height = -1;
let prepped_uni = false;

// let data = {rows:[]};
let data = {};

let uni_info_dict
let cached = {}
let selected = -1
let to_select = -1

// gsap.registerPlugin(SplitText)
// https://res.cloudinary.com/dzbir1huh/image/upload/NOT.png


async function play() {
    if (state == 0) {
        addRows()
        state = 1
    }
    if (state == 1) {
        state = 1.1
        await animateIn()
        state = 2
        if(to_select) {
            select(to_select)
            to_select = -1
        }
    } else if(state == 2) {
        state = 1.5
        await animateOut()
        state = 1
    }
}

const flip = f => (a, b) => f(b, a)

const foldr = (f, acc, arr) =>
  arr.reduceRight(flip(f), acc)


async function prep_uni() {
    let uni_data = await (await fetch(`https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/list/${TAG_NAME}.json`)).json()
    console.log(uni_data)
    uni_info_dict = uni_data['resources'].reduce((prev, cur) => ((!('context' in cur)) ? prev : {...prev, [cur['public_id']]:{colour: cur['context']['custom']['colour']}}), {})
    fetch_unis = true
}

function cacheUni(uni_code_p) {
    
    let uni_code = uni_code_p.toUpperCase()
    if (!(uni_code in uni_info_dict)){
        console.log(`Invalid Uni ID: ${uni_code}`)
        return
    }
    if(!(uni_code in cached)) {
        img = new Image()
        img.src = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${uni_code}`
        cached[uni_code] = img
        // console.log(`Cached ${uni_code_p}`)
    }
}

async function updateUni(row_inner, uni_code_p) {
    let uni_code = uni_code_p.toUpperCase()
    if (!(uni_code in uni_info_dict)){
        console.log(`Invalid Uni ID: ${uni_code}`)
        return
    }
    uni_info = uni_info_dict[uni_code]  // {colour}

    // if(!cached.includes(uni_code)) {
    //     img = new Image()
    //     img.src = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${uni_code}`
    //     cached.push(uni_code)
    // }

    row_inner.querySelector('.logo').src = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${uni_code}`
    row_inner.querySelector('.position').style.backgroundColor = `#${uni_info.colour}`
    row_inner.querySelector('.mask2').style.fill = `#${uni_info.colour}`
    // row_inner.querySelector('.name').style.color = `#${uni_info.colour}`
}

function addRows(){
    let row_template = document.querySelector('#row-template');
    let parent = document.querySelector('.rows')
    let rows_data = data.rows
    let pos_max = foldr((x, acc) => Math.max(x.pos, acc), 0, rows_data)
    // row_template.querySelector('.position-number').width = pos_max.length + 'ch';

    for (let i=0; i<data.rows.length; i++) {
        let row_data = rows_data[i]
        let row = row_template.content.cloneNode(true).querySelector('.graphic');
        row.querySelector('.position-number').style.width = (pos_max > 0) ? pos_max.toString().length + 'ch' : 0;
        row.querySelector('.position-number').textContent = row_data['pos']
        row.querySelectorAll('.name').forEach((elem) => {
            elem.textContent = row_data['name']
            if(row_data['name'].length > 22) {
                elem.style.fontSize = '3vh'
            }
        })
        updateUni(row, row_data['id'])
        row.id = 'row-'+i
        // row.querySelector('.info svg').id = i
        row.querySelector('#theClipPath').id = `theClipPath${i}`
        row.querySelector('.info-text').style.clipPath = `url(#theClipPath${i})`
        parent.appendChild(row)
    }
}
function select(new_i) {
    const tl  = new gsap.timeline({ease: 'power1.in'});
    if(new_i == selected) {return}

    if (selected > -1) {
        select_out(selected, tl)
    }
    select_in(new_i)
    selected = new_i
}
function neighbour_selectors(select_i, after="") {
    let row_selector = '#row-'+select_i+after
    if(select_i > 0)                    row_selector += ', #row-'+(select_i-1)+after
    if(select_i < data.rows.length-1)   row_selector += ', #row-'+(select_i+1)+after
    return row_selector
}
function select_in (select_i, tl=new gsap.timeline({ease: 'power1.in'})) {
    const masker = document.querySelectorAll('#row-'+select_i +" .inner .masker")
    tl.to(masker, {scaleX:1, duration: 0.4});

    // let row_selector = neighbour_selectors(select_i)
    // const info     = document.querySelectorAll(neighbour_selectors(select_i, " .info"))
    // const position = document.querySelectorAll(neighbour_selectors(select_i, " .position"))
    // // console.log(row_selector +" .info")
    // tl.to(info, {borderBottomColor: masker[1].style.fill})
    // tl.set(info, {borderImage: `linear-gradient(to right, #${masker[1].style.fill} 33vw, transparent 33vw) 100% 1`})
    // tl.to(position, {borderBottomColor: '#ffffff00'})

}
function select_out(select_i, tl=new gsap.timeline({ease: 'power1.in'})) {
    const masker = document.querySelectorAll('#row-'+select_i +" .inner .masker")
    tl.to(masker, {scaleX:0, duration: 0.4});
  
    // const info     = document.querySelectorAll(neighbour_selectors(select_i, " .info"))
    // const position = document.querySelectorAll(neighbour_selectors(select_i, " .position"))

    // tl.to(info, {borderBottomColor: 'black'})
    // tl.to(position, {borderBottomColor: 'black'})
}
 
function animateIn() {
    return new Promise((resolve, reject) => {
        const tl  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});
        for (let i=0; i<data.rows.length; i++) {
            animateInR(tl, document.querySelector('#row-'+i +" .inner"), i)
        }
        // animateInR(document.querySelector())
    })
}
function animateOut() {
    return new Promise((resolve, reject) => {
        const tl  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});
        for (let i=0; i<data.rows.length; i++) {
            animateOutR(tl, document.querySelector('#row-'+i+" .inner"), i)
        }
        // animateInR(document.querySelector())
    })
}

function animateInR(tl, row_inner, i) {
    g_height = row_inner.clientHeight
    let img = row_inner.querySelector('.logo')
    let info = row_inner.querySelector('.info svg')
    // g_width = graphic.clientWidth
    
    // Setup - make the graphic visible with no height or width
    tl.set(row_inner, {
        height: 0,
        // width: 0,
        opacity: 1
    }, 'start')

    // Grow the height of the graphic:    (revealing the information)
    tl.to(row_inner, {
        height: g_height,
        duration: 0.25
    }, i*0.2)
    
    // tl.to(img, {
    //     opacity: 1,
    //     duration: 0.3
    // }, "<")
    tl.from(info, {
        width: 0,
        duration: 0.3
    }, "<+=0.5")
}

function animateOutR(tl, row_inner, i) {
    // 1) Shrink the height  (hiding everything)
    tl.to(row_inner, {
        height: 0,
        duration:0.2+(0.1*i)
    }, 0)//Math.max((i*0.2)-0.15, 0))
    tl.to(row_inner, {
        opacity: 0,
        duration: 0.1
    }, (0.1*i))
    .set(row_inner, {
        opacity: 0,
        height: ""
    },(data.rows.length+1)*0.2)
}

function update(incomingChange) {
    if(!fetch_unis) {setTimeout(() => {update(incomingChange)}, 100); return }
    const graphic = document.querySelector('.graphic')
    const changes_json = JSON.parse(incomingChange)
    console.log(changes_json)
    let changes = {}
    if("rows" in changes_json) {
        changes["rows"] = changes_json["rows"].split("/").map(
            row_str => {let row_arr=row_str.split("|"); return {'pos': row_arr[0], 'id': row_arr[1], 'name': row_arr[2]}}
        )
        changes["rows"].forEach((row) => cacheUni(row['id']))
    }
    if("selected" in changes_json) {
        if(state == 2) {
            select(changes_json["selected"])
        } else {
            to_select = changes_json["selected"]
        }
        
    }
    console.log(changes)
    if (Object.keys(changes).length == 0) // Nothing sent to change
        return
    if (Object.assign({}, data, changes) == data) // No change to make
        return
    data = Object.assign({}, data, changes)
}
prep_uni()

// rows:[{'pos': 1, 'id':'SUR', 'name':"Oliver Smith"},{'pos': 2, 'id':'SHT', 'name':"Adam Skrzymowski"},{'pos': 3, 'id':'WRW', 'name':"Makka Pakka"}]
update(JSON.stringify({"rows": "|SUR|Oliver Smith/|SHT|Christopher Smith-Rasmussen/|WRW|Makka Pakka"}))

// play()

// addRows()

