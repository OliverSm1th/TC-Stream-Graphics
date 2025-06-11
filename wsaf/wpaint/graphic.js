let state = 0;

async function play() {
  while (true) {
    if (state === 0) {
      state = 1;
    }
    if (state === 1) {
      await animateIn();
    } else {
      await animateOut();
    }
    state = (state % 2) + 1;

    await new Promise((res) => setTimeout(res, 2000));
  }
}

function animateIn() {
  return new Promise((resolve, reject) => {
    // 1) Fetch the components which will be animated / updated
    const t_l = gsap.timeline({ ease: "power1.in", onComplete: resolve });
    // 2) Use the timeline to animate the element properties  (can change ease)
    // - Instantaneously update properties          (property=value)                https://gsap.com/docs/v3/GSAP/Timeline/set()
    // t_l.set( __componentSelector__, {__property__: __value__, ...},  __startTime__);
    // - Animate properties over a duration         (property: original->value)     https://gsap.com/docs/v3/GSAP/Timeline/to()
    // t_l.to(  __componentSelector__, {__property__: __value__, ..., duration: __time__, ?ease: __ease__}, __startTime__)
    // - Animate property from a value -> original (property: value->original)      https://gsap.com/docs/v3/GSAP/Timeline/from()
    // t_l.from(__componentSelector__, {__property__: __value__, ..., duration: __time__, ?ease: __ease__}, __startTime__)
    // Without a __startTime__ provided, these functions will perform in sequence
    console.log("Animating in...");
    rerollImage();
  });
}

function animateOut() {
  return new Promise((resolve, reject) => {
    console.log("Animating out...");
    const t_l = gsap.timeline({ ease: "power1.in", onComplete: resolve });
  });
}

function rerollImage() {
  const img = document.getElementById("random-image");
  img.src = `https://wsaf.org.uk/api/random-image?t=${Date.now()}`;
}
