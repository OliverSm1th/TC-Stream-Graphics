gsap.registerPlugin(TextPlugin) 
function g_updateS(graphicS, changes) {
    if(changes.title) 
        graphicS.querySelector('.title').textContent = changes.title
    if(changes.description)
        graphicS.querySelector('.description').textContent = changes.description
}
function g_update(changes, n_height, n_width) {
    const tl  = new gsap.timeline({ease: 'power1.in'})
    if (changes.title) {
        tl.to('.title', {opacity: 0})
        tl.set('.title', {text: changes.title})
        tl.to('.graphic', {width: n_width}, 'show')
        tl.to('.graphic', {height: n_height}, 'show')
        tl.to('.title', {opacity: 1}, 'show')
    }
}