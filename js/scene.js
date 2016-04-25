//
// Globals
//
var width = window.innerWidth - 50;
var height = window.innerHeight - 80;

var scene;
var camera;
var rt1, rt2; // rt: render target
var uniforms1;
var renderer;

var stop = false;
var clock;
var clockSpeed = 1.0;

clock = new THREE.Clock();

init();
animate();

//
// UI
//

function onButtonResetClick()
{
    uniforms1.time.value = 0.0;
    uniforms1.rule.value = document.getElementById('numberRule').value;
    uniforms1.seed.value = 100.0 * Math.random();
}

function onChangeSelectInitialState(value)
{
    uniforms1.initialState.value = value;
    console.log(uniforms1.initialState.value);
    
    onButtonResetClick();
}

function onButtonStopClick()
{
    var buttonStop = document.getElementById('buttonStop');
    if(!stop)
    {
        buttonStop.value = "Play";
        stop = true;
    }
    else
    {
        buttonStop.value = "Stop";
        stop = false;
        
        clock.getDelta();
        requestAnimationFrame( animate );
    }
}

function onButtonStepClick()
{
    var buttonStop = document.getElementById('buttonStop');
    buttonStop.value = "Play";
    stop = true;
    
    animate();
}

function onButtonChangeRuleClick()
{
    inputNumberRule = document.getElementById('numberRule');
    
    value = Math.floor(Math.random() * inputNumberRule.max + 0.5);
    inputNumberRule.value = value;
    uniforms1.rule.value = value;
    
    onButtonRandomClick();
}

function onInputNumberRule(value)
{
    uniforms1.rule.value = value;
}

//
// three.js
//
function setupScreen()
{
    uniforms1 = {
        time: { type: "f", value: 0.0 },
        seed: { type: "f", value: 0.0 },
        resolution: { type: "v2", value: new THREE.Vector2() },
        tPrev: { type: "t", value: rt1 },
        rule: { type: "i", value: 114 },
        initialState: { type: "i", value: 0 }
    };
              
    scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 1, 1000 );
    camera.position.z = 1;

    var geometry = new THREE.PlaneGeometry( 2, 2, 1 );
    
    // -----------
    // フィードバックエフェクト用にレンダーターゲットを2つ用意
    // rt1 と rt2
    rt1 = new THREE.WebGLRenderTarget( width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
    rt2 = new THREE.WebGLRenderTarget( width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
    // -----------
    
    var material = new THREE.ShaderMaterial(
        {
            uniforms: uniforms1,
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader' ).textContent
        });
    var mesh = (new THREE.Mesh( geometry, material ));
    
    scene.add( mesh );
}

function init()
{
    setupScreen();
    
    // 画面へのレンダラ
    renderer = new THREE.WebGLRenderer();
    //renderer.setClearColor(0xffffff, 1);
    renderer.setSize( width, height );
    //renderer.autoClear = false;

    // resolution を FS へ送る
    var canvas = renderer.domElement;
    uniforms1.resolution.value.x = canvas.width;
    uniforms1.resolution.value.y = canvas.height;
    
    document.body.appendChild( renderer.domElement );
}

function tick()
{
    uniforms1.time.value += clockSpeed * clock.getDelta();
}

function animate()
{
    if(!stop)
    {
        requestAnimationFrame( animate );
    }
    
    tick();
    
    renderer.render( scene, camera );
    renderer.render( scene, camera, rt1, true );
    
    var temp = rt2;
    rt2 = rt1;
    rt1 = temp;
    uniforms1.tPrev.value = rt2;
}
