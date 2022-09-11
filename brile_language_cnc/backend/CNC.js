import johnny from "johnny-five";
const { Board, Stepper, Button } = johnny;
const board = new Board({repl:false, port:"COM3"});
import EventEmitter from "events";
EventEmitter.defaultMaxListeners = 10000;

// declaring all the components 
var stepperX, stepperY, stepperZ, Xmin, Ymin, Zmin, Xmax, Ymax;

// limitter pins
const Xmin_pin = 3; // x min
const Ymin_pin = 2; // Y min
const Zmin_pin = 4; // z min
const Xmax_pin = 5; // x max
const Ymax_pin = 6; // y max

// initial button conditions
let Xmin_pin_pressed = false;
let Ymin_pin_pressed = false;
let Zmin_pin_pressed = false;
let Xmax_pin_pressed = false;
let Ymax_pin_pressed = false;

let uniform_distance = 100; // the distance between the holes inside of a letter
let letter_count = 0; // number of written words
let line_count = 0; // number of written lines
let letter_length = 3 * uniform_distance; // length of a letter
let letter_width = 2 * uniform_distance; // width of a letter
let letter_space = 50; // space between letters
let line_space = 70; // space between lines
// let new_sheet_on = true; // a boolean if a new sheet is used

board.on("ready", async() => {

  Xmin = new Button(Xmin_pin);
  Ymin = new Button(Ymin_pin);
  Zmin = new Button(Zmin_pin);
  Xmax = new Button(Xmax_pin);
  Ymax = new Button(Ymax_pin);

  Xmin.on("press", function(){
    Xmin_pin_pressed = true;
    console.log("x min pin pressed");
  });
  Ymin.on("press", function(){
    Ymin_pin_pressed = true;
    console.log("y min pin pressed");
  });
  Zmin.on("press", function(){
    Zmin_pin_pressed = true;
    console.log("z min pin pressed");
  });
  Xmax.on("press", function(){
    Xmax_pin_pressed = true;
    console.log("x max pin pressed");
  });
  Ymax.on("press", function(){
    Ymax_pin_pressed = true;
    console.log("y max pin pressed");
  });
  
  stepperX = new Stepper({
    type: Stepper.TYPE.DRIVER,
    stepsPerRev: 200,
    pins: {
      step: 11,
      dir: 10
    }
  });

  stepperY = new Stepper({
    type: Stepper.TYPE.DRIVER,
    stepsPerRev: 200,
    pins: {
      step: 13,
      dir: 12
    }
  });

  stepperZ = new Stepper({
    type: Stepper.TYPE.DRIVER,
    stepsPerRev: 200,
    pins: {
      step: 9,
      dir: 8
    }
  });

  stepperX.rpm(230).ccw();
  stepperY.rpm(230).ccw();
  stepperZ.rpm(230).ccw();
});

// the big print method where everything takes place
function print(Array){
  return new Promise(async (resolve)=>{
    
    await sleep(1000);
    await reset();
    await sleep(1000);

    // await go_to_hole(0,0);
    // console.log(Array);

    for (let i = 0; i < Array.length; i++) {
      let letter = Array[i];
      if(letter === '\n'){
        letter_count = 0;
        line_count++;
        // go to next line
        // await sleep(1000);
        await go_to_next_line();
        // console.log("continue");
        continue;
      }
      
      // console.log(letter);
      for(let y = 0; y < letter.length; y++){
        let row = letter[y];
        for(let x = 0; x < row.length; x++){
          if(row[x] == 1){
            await go_to_hole(x,y);
          }
        }
      }

      await go_to_next_posision();
    }

    letter_count = 0;
    line_count = 0;
    await reset();

    resolve();

  });
}

// reset method plus some initial offset
async function reset(){

  return new Promise( async(resolve) => {
    // stepperX.ccw(); // reverse direction stepperX.cw();
    stepperX.cw();

    stepperY.cw();
    stepperZ.ccw();
    
    while(true){
      
      // if(!Xmin_pin_pressed){  // change to xmax
      if(!Xmax_pin_pressed){
        stepperX.step(5,()=>{});
      }
      
      if(!Ymin_pin_pressed){
        stepperY.step(5,()=>{});// rotate(stepperX,0, stepperY,5, stepperZ,0);
      }
      
      if(!Zmin_pin_pressed){
        stepperZ.step(5,()=>{});
      }
  //     Xmax_pin_pressed
      // if(Xmin_pin_pressed && Ymin_pin_pressed && Zmin_pin_pressed){
      if(Xmax_pin_pressed && Ymin_pin_pressed && Zmin_pin_pressed){
        // Xmin_pin_pressed = false;  // change to xmax 
        Xmax_pin_pressed = false;
        Ymin_pin_pressed = false;
        Zmin_pin_pressed = false;
        break;
      }
      await sleep(1); // be aware of this
    }
    
    stepperX.ccw();  // change to tepperX.ccw();

    stepperY.ccw();
    stepperZ.cw();
    
    await rotate(stepperX,500, stepperY,250, stepperZ,70);
    resolve();
  });
}  

// to rotate all the steppers simultainuously 
// calculate which one has the most steps, then resolve according to that one
function rotate(stepper_X,X_steps, stepper_Y,Y_steps, stepper_Z,Z_steps){

  // console.log(`x: ${X_steps}, y: ${Y_steps}, z: ${Z_steps}`);
  if(X_steps >= Y_steps && X_steps >= Z_steps){
    return new Promise((resolve,reject)=>{
      stepper_X.step(X_steps, async()=>{
        await sleep(10);
        resolve();
      });
      stepper_Y.step(Y_steps,()=>{});
      stepper_Z.step(Z_steps,()=>{});
    });
  }else if(Y_steps >= X_steps && Y_steps >= Z_steps){
    return new Promise((resolve,reject)=>{
      stepper_X.step(X_steps,()=>{});
      stepper_Y.step(Y_steps,async()=>{
        await sleep(10);
        resolve();
      });
      stepper_Z.step(Z_steps,()=>{});
    });
  }else if(Z_steps >= X_steps && Z_steps >= Y_steps){
    return new Promise((resolve,reject)=>{
      stepper_X.step(X_steps,()=>{});
      stepper_Y.step(Y_steps,()=>{});
      stepper_Z.step(Z_steps,async()=>{
        await sleep(10);
        resolve();
      });
    });
  }

}

// if an old sheet is used, go to the last word in the last line then start drilling
async function go_to_posission(letters, lines){
  // await reset();
  return new Promise(async (resolve)=>{
    stepperY.ccw();
    stepperX.cw();
    //                         for spaces between letters     for number of letters
    const stepper_x_distance = ((letters-1) * letter_space) + (letter_width * letters);
    //                         for spaces between lines    for number of lines
    const stepper_y_distance = ((lines-1) * line_space) + (letter_length*lines);
    // stepperX.step(stepper_x_distance, ()=>{});
    // stepperY.step(stepper_y_distance, ()=>{});

    await rotate(stepperX,stepper_x_distance,stepperY,stepper_y_distance,stepperZ,0);
    
    resolve();
  });

}

// go to a specific line
function go_to_next_line(){
  return new Promise(async(resolve)=>{
    // move stepper x until Xmin is true
    // console.log(line_count);
    stepperX.cw();
    while(true){
      // if(!Xmin_pin_pressed){  // change to Xmax_pin_pressed
      if(!Xmax_pin_pressed){
        stepperX.step(5,()=>{});
      }else{
        // Xmin_pin_pressed = false; // change to Xmax_pin_pressed
        Xmax_pin_pressed = false;
        break;
      }
      await sleep(1); // be aware of this
    }
    // move stepper y by letter hight + line space
    let distance = letter_length + line_space;
    // stepperX.cw(); // change to stepperX.ccw();
    stepperX.ccw();

    stepperY.ccw();
    await rotate(stepperX,500, stepperY, distance, stepperZ,0);
    resolve();
  });
}

// go to a specific letter on that line
function go_to_next_letter(){
  return new Promise(async(resolve)=>{
    let distance = letter_width + letter_space;
    // stepperX.cw();  // change to stepperX.ccw();
    stepperX.ccw();
    await rotate(stepperX,distance,stepperY,0,stepperZ,0);
    resolve();
  });
}

// go to the hole position
async function go_to_hole(x_offset, y_offset){ // x_offset is between 1 and 2, y_offset is between 1,3
  return new Promise( async (resolve)=>{
    // stepperX.cw(); // change to stepperX.ccw();
    stepperX.ccw();

    stepperY.ccw();
    const x_distance = x_offset * uniform_distance;
    const y_distance = y_offset * uniform_distance;
    await rotate(stepperX,x_distance,stepperY,y_distance,stepperZ,0);
    await make_hole();
    // stepperX.ccw();  // change to stepperX.cw(); 
    stepperX.cw();

    stepperY.cw();
    await rotate(stepperX,x_distance,stepperY,y_distance,stepperZ,0);
    resolve();
  });
}

// make a hole at the current posision
async function make_hole(){
  return new Promise(async (resolve)=>{
    // await go_down(550);
    await go_down(300);
    // await sleep(2000);
    await go_up();
    resolve();
  });
}

// take the drill down
function go_down(num){
  return new Promise(async (resolve)=>{
    stepperZ.cw();
    stepperZ.step(num,()=>{
      resolve();
    });
  });
}

// bring the drill back up
function go_up(){
  return new Promise(async (resolve)=>{
    stepperZ.ccw();
    while(true){
      if(Zmin_pin_pressed){
        Zmin_pin_pressed = false;
        break;
      }
      stepperZ.step(50,()=>{});
      await sleep(5)
    }
    await go_down(70);
    resolve();
  });
}

// to go to the next letter posision
function go_to_next_posision(){
  return new Promise(async(resolve)=>{
    if(letter_count == 18){
      letter_count = 0;
      if(line_count == 25){
        // no more space to print letters
        // insert a new sheet
        line_count = 0;
        await reset();
      }else{
        line_count++;
        // go to next line
        await sleep(1000);
        await go_to_next_line();
      }
    }else{
      letter_count ++;
      // go to next letter
      await go_to_next_letter();
    }
    resolve();
  });
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default print;