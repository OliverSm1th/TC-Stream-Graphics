// https://dietcode.io/p/topographic/
import * as THREE from 'three'; 

const height = document.body.clientHeight;
const width = document.body.clientWidth;
console.log(`${height} x ${width}`)

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(0, width, 0, height, 1, 3);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

const geometry = new THREE.PlaneGeometry(width, height);
geometry.translate(width/2, height/2, 0);

const f_shader = document.getElementById('fragmentshader').textContent;
const v_shader = document.getElementById('vertexshader').textContent;

const white_mat = new THREE.ShaderMaterial({
    vertexShader: v_shader,
    fragmentShader: f_shader,
    side: THREE.DoubleSide,
})
scene.add(new THREE.Mesh(geometry, white_mat));

document.getElementById("bg").appendChild(renderer.domElement);
function frame() {
    requestAnimationFrame(frame);
    renderer.render(scene, camera);
}
frame();