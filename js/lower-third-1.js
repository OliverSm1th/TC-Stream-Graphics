'use strict';

// lower-third.1.js

const _graphic = (function() {
    let state = 0;
        // Defines where the graphic is in the play out process
        //  0 = loading
        //  1 = ready to be played
        //  2 = has been played + can be stopped
    let activeStep = 0;
        // The title currently being shown
    let currentStep = 0;
        // Which title is going to be shown after all animations play out
    let data = [];
        // Array to titles and subtitles
    let style;
        // Contains the primary colour + text colour data
    const animationQueue = [];
    const animationThreshold = 3;

    // Variables and function defined here will not
    // be available in the global scope

    (function () { // Basically an initialiser
        // Runs after the rest of the parent function parses
        window['update'] = (raw) => update(raw);
        window['play']   = play;
        window['next']   = next;
        window['stop']   = stop;
        window['remove'] = remove;
        window['previous'] = previous;
        window['reset'] = reset;
    })();

    // Required:
    function update(raw) {
        let parsed;
        try{
            parsed = JSON.parse(raw);
            if(!Object.keys(parsed).length)
                throw new Error("Empty objects are invalid");
            if(!parsed.style) {
                if(!parsed.data)
                    throw new Error("Invalid data object");

            }
        } catch (e) {
            handleError(e);
            return;
        }
        Array.isArray(parsed.data)
            ? data = data.concat(parsed.data)
            : data.push(parsed.data)
        style = parsed.style;
    
        if(state == 0) { // Is the graphic being loaded?
            try{
                applyData();
                applyStyle();
                state = 1;
            } catch (error) {
                handleError(error);
                return;
            }
        }
    }
    function play() {
        if (state == 0) {
            update({
                "data": [
                    {
                        "title": "Title One",
                        "subtitle": "Subtitle One"
                    },
                    {
                        "title": "Title Two",
                        "subtitle": "Subtitle Two"
                    }
                ],
                "style": {
                    "primaryColor": "lightblue",
                    "textColor": "black",
                    "position": "center"
                }
            })
        }

        if(state <= 1) {
            animateIn();
            state = 2;
        } 
    }
    function next() {
        if(state === 1) play();
        else if(state === 2) {
            if(data.length > currentStep + 1){ // There are more titles
                currentStep++;
                const animation = () => animateOut().then(() => {
                    activeStep++;
                    applyData();
                    return;
                }).then(animateIn);
                addPlayoutCommand(animation);
            } else handleError('No more titles to display');
        } else handleError('Graphic cannot be advanced in state: '+state)
    }
    function stop() {
        if(state === 2) {
            animateOut();
            state = 1;
        }
    }
    function reset() {
        if(currentStep === 0) {
            handleError('The graphic is already on its first item');
            return;
        }
        let animation;
        if(state===1) { // Graphic is not visible
            currentStep = 0;
            animation = () => new Promise((resolve, reject) => {
                activeStep = 0;
                applyData();
                resolve();
            })
        } else if(state === 2) {
            currentStep = -1;
            animation = () => new Promise((resolve, reject) => {
                activeStep = -1;
                resolve();
            }).then(next);
        } else {
            handleError('Cannot reset a graphic that has not been loaded.');
            return;
        }
        addPlayoutCommand(animation);
    }
    function previous() {
        if(currentStep > 0) { // We can go backwards
            let animation;
            if(state === 2) {
                currentStep -= 2;
                animation = () => new Promise((resolve, reject) => {
                    activeStep -= 2;
                    resolve();
                }).then(next);
            } else if(state === 1) {
                currentStep -= 1;
                animation = () => new Promise((resolve, reject) => {
                    activeStep -= 1;
                    applyData();
                    resolve();
                })
            } else {
                handleError('Graphic can not go back one title in the current state');
                return;
            }
            addPlayoutCommand(animation);
        } else {
            handleError('There is no graphic to go backwards to.');
        }
    }
    async function remove() {
        if(state===2) await animateOut();
    }

    function handleError(e) {console.error(e)}
    function handleWarning(w) {console.log(w)}


    // Helper Functions
    function executePlayOutCommand() {
        animationQueue[0]().then(() => {
            animationQueue.splice(0,1);
            // If there are more, run them
            if(animationQueue.length) executePlayOutCommand();
        }).catch(e => handleError(e));
    }
    function addPlayoutCommand(prom) {
        if(animationQueue.length < animationThreshold)
            animationQueue.push(prom);
        if(animationQueue.length == animationThreshold)
            handleWarning("Animation threshold met");
        if(animationQueue.length === 1) executePlayOutCommand();
    }


    // - For Update:
    function applyData() {
        const graphic = document.querySelector('.lt-style-one .graphic');
        const title   = graphic.querySelector('h1');
        const subtitle= graphic.querySelector('p');
        title.textContent = data[activeStep].title;
        subtitle.textContent = data[activeStep].subtitle;
    }
    function applyStyle() {
        const container = document.querySelector('.lt-style-one');
        const graphic = container.querySelector('.graphic');
        const [pathLeft, pathRight] = graphic.querySelectorAll('svg path');
        const title = graphic.querySelector('h1');
        const subtitle = graphic.querySelector('.subtitle');

        // Set the elements CSS styles
        pathLeft.style.stroke = style.primaryColor;
        pathRight.style.stroke = style.primaryColor;
        title.style.color = style.textColor;
        subtitle.style.color = style.textColor;
        subtitle.style.backgroundColor = style.primaryColor;

        // Position the graphic on screen
        switch(style.position) {
            case 'left':
                container.style.marginRight = 'auto';
                break;
            case 'center':
                container.style.margin = '4vh auto';
                break;
            default:
                container.style.marginLeft = 'auto';
                break;
        }
    }
    // - For Play:
    function animateIn() {
        return new Promise((resolve, reject) => {
            const graphic = document.querySelector('.lt-style-one .graphic');
            const [pathLeft, pathRight] = graphic.querySelectorAll('svg path');
            const title = graphic.querySelector('h1');
            const subtitleCon = graphic.querySelector('.subtitle');
            const subtitle = subtitleCon.querySelector('p');

            const graphicWidth = getComputedStyle(graphic, 'width')[0];
            // Our path wraps around our graphic making it's path width swice as big
            const pathWidth = graphicWidth * 2;

            const t1 = new gsap.timeline({duration: 1, ease: 'power1.out', onComplete: resolve});
            t1.set([pathLeft, pathRight], {
                strokeDashoffset: pathWidth,
                strokeDasharray: pathWidth
            }).set(title, {y: '15vh'})
            .set(subtitleCon, {y: '10vh'})
            .set(subtitle, {y: '20vh'})
            // Reveal the graphic
            .set(graphic, {opacity: 1})
            .to([pathLeft, pathRight], {
                strokeDashoffset: 0,
                duration: 1.5 // Overrides the default duration
            })
            .to(title, {y:0}, '-=1')
            .to(subtitleCon, {y:0}, '-=.9')
            .to(subtitle, {y:0}, "-=1")
        })
        
    }
    function animateOut() {
        return new Promise((resolve, reject) => {
            /* The same vas the animateIn function */
            const graphic = document.querySelector('.lt-style-one .graphic');
            const [pathLeft, pathRight] = graphic.querySelectorAll('svg path');
            const title = graphic.querySelector('h1');
            const subtitleCon = graphic.querySelector('.subtitle');
            const subtitle = subtitleCon.querySelector('p');
            const titleWidgth = getComputedStyle(graphic, 'width')[0];
            const pathLength = titleWidgth * 2;
            
            const tl = new gsap.timeline({duration: 1, ease: 'power1.in', onComplete: resolve});
            tl.to(title, {y: '15vh'})
                .to(subtitleCon, {y: '10vh'}, '-=.75')
                .to(subtitle, {y: '20vh'}, '-=.55')
                .to([pathLeft, pathRight], {
                    strokeDashoffset: pathLength, 
                    ease: 'power1.inOut', 
                    duration: 2
                }, '-=1')
                .to(graphic, {opacity: 0}, '-=.25');
        })
    }

    // getComputedStyle:
    // Gets the CSS values used by the browser
    // @param {DOM Node} elem - The element whos styles you want
    // @param {string | string[]} styles - The CSS properties needed
    // @returns {any[]} An array of strings and/or numbers
    function getComputedStyle(elem, styles) {
        // Get the element's computed styles
        const computedStyles = window.getComputedStyle(elem);
        // Create an array to hold the requested results
        const values = [];
        if(Array.isArray(styles)) {
            // Loop over each style requested and all the value to the result
            styles.forEach(s => 
                values.push(computedStyles.getPropertyValue(s)));
        } else {
            values.push(computedStyles.getPropertyValue(styles));
        }
        return values.map(v => {
            // Clean up pixel values
            if(v.includes('px')) v = Number(v.substring(0, v.length - 2));
            return v;
        });
    }


    return { }

})();