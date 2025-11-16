gsap.registerPlugin(SplitText) 

function g_updateS(graphicS, changes) {
    if (!changes['roles']) return
    console.log(changes['roles'].split('\n'))
    graphicS.querySelector('.inner').innerHTML = '';

    changes['roles'].split('\\n').forEach(line => {
        items = line.split('|').map(item => item.trim())
        console.log(items)
        if(items.length == 2) {
            var personC = document.querySelector('#ref #person').cloneNode(true)
            personC.querySelector('.name').textContent = items[0]
            personC.querySelector('.role').textContent = items[1]
            graphicS.querySelector('.inner').appendChild(personC);
        } 
    });
}
// function g_update(changes, n_height, n_width) {
// }


function g_animateIn(tl) {
    
}
function g_animateOut(tl) {

}