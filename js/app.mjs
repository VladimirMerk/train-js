import {Train} from './Train.mjs';

{
  const myTrain = new Train(10);
  myTrain.setRailway(document.querySelector('#railway'))

  const myTrainTwo = new Train(7);
  myTrainTwo.setRailway(document.querySelector('#railway-two'))

  const handler = document.querySelector('#handler')
  const loop = document.querySelector('#loop')

  let n = 0;
  let timer = null;

  handler.addEventListener('input', (e) => {
    runTrains(e.target.value);
    stopTimer();
  })

  loop.addEventListener('click', (e) => {
    const active = +!+loop.dataset.active
    if (active) {
      startTimer();
    } else {
      stopTimer();
    }
  })

  function runTrains(n) {
    myTrain.run(n);
    myTrainTwo.run(n);
  }

  function startTimer() {
    loop.dataset.active = 1
    loop.value = "Pause";
    timer = setInterval(()=>{
      runTrains(++n);
    }, 20);
  }

  function stopTimer() {
    loop.dataset.active = 0
    loop.value = "Play";
    clearInterval(timer)
    timer = null
  }
}
