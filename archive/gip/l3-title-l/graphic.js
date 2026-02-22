gsap.registerPlugin(SplitText)

// function g_updateS(graphicS, changes) {
// }
// function g_update(changes, n_height, n_width) {
// }

let titleText = "Sample Title"
let subtitleText  = "Sample Subtitle"


function g_animateIn(tl) {
    
    tl.set('.inner', {
        opacity: 1
    })
    // let title = document.querySelector('.title');
    // title.textContent = titleText
    // let subtitle = document.querySelector('.subtitle');
    // subtitle.textContent = subtitleText

    // let splitTitle = SplitText.create(title, { type: "words, lines" });
    // let splitSubtitle = SplitText.create(subtitle, { type: "words, lines" });
    // tl.set('.title', {
    //     text: ""
    // })
    // tl.set('.subtitle', {
    //     text: ""
    // })
    tl.to('.logo', {
        opacity: 1
    })
    tl.from('.divider', {
        height: 0
    }, ">-=0.2")
    tl.to('.title', {
        opacity: 1
    }, ">-=0.3")
    tl.to('.subtitle', {
        opacity: 1
    }, "<+0.3")
    // tl.from(splitTitle.words, {
    //     duration: 0.5, 
    //     y: 100,       // animate from 100px below
    //     autoAlpha: 0, // fade in from opacity: 0 and visibility: hidden
    //     stagger: 0.05 // 0.05 seconds between each
    // }, ">-=0.2")
    // tl.from(splitSubtitle.words, {
    //     duration: 0.5, 
    //     y: 100,       // animate from 100px below
    //     autoAlpha: 0, // fade in from opacity: 0 and visibility: hidden
    //     stagger: 0.05 // 0.05 seconds between each
    // }, "<+=0.3")
    // tl.from('.subtitle', {
    //     opacity: 0,
    //     y: 20
    // })
    tl.to('.crest', {
        opacity: 1
    })
    
}
function g_animateOut(tl) {
    tl.to('.inner', {
        opacity: 0
    })
    // tl.to('.logo', {
    //     opacity: 0
    // }, '<')
    // tl.to('.title', {
    //     opacity: 0
    // }, '<')
    // tl.to('.subtitle', {
    //     opacity: 0
    // }, '<')
    // tl.to('.crest', {
    //     opacity: 0
    // }, '<')
    tl.set('.logo', {
        opacity: 0
    })
    tl.set('.crest', {
        opacity: 0
    })
    tl.set('.title', {
        opacity: 0
    })
    tl.set('.subtitle', {
        opacity: 0
    })
}

function g_updateS(graphicS, changes) {
    if(changes.title) 
        document.querySelector('.title').textContent = changes.title
    if(changes.subtitle)
        document.querySelector('.subtitle').textContent = changes.subtitle
    if(changes.colour) {
        graphicS.style.borderBottomColor = changes.colour
        graphicS.style.backgroundColor = changes.colour
    }  
}

// animateIn()