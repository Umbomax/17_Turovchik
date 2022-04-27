const dates = document.querySelectorAll('input[name="date"]');
const firstDate = document.getElementById("firstdate");
const secondDate = document.getElementById("seconddate");
const submitBtn = document.getElementById("submit");
const minField = document.querySelector('.min')
const maxField = document.querySelector('.max')

const DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000

let firstDateValue;
let secondDateValue;

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
let currentDay = new Date().getDate();

const correctDate = function (num) {
  return num < 10 ? `0${num}` : num;
};

secondDate.value = `${currentYear}-${correctDate(currentMonth)}-${correctDate(currentDay)}`;
secondDate.max = secondDate.value;
firstDate.max = secondDate.value;

dates.forEach((el) =>
  el.addEventListener("input", () => {
    if (!firstDate.value || !secondDate.value) {
      return;
    }

    firstDateValue = new Date(firstDate.value).getTime();
    secondDateValue = new Date(secondDate.value).getTime();
    console.log(firstDateValue);
    console.log(new Date(firstDateValue));
    firstDateValue < secondDateValue ? (submitBtn.disabled = false) : (submitBtn.disabled = true);
  })
);

submitBtn.addEventListener("click", async() => {
  const arr = getArrayOfDates(firstDateValue, secondDateValue);
  const objOfDates = {};
  firstDate.disabled = true;
  secondDate.disabled = true;
  submitBtn.disabled = true
  await Promise.all(arr.map((el) => fetch(`https://www.nbrb.by/api/exrates/rates/USD?parammode=2&periodicity=0&ondate=${el}`)))
  .then((res) =>{
    return Promise.all(res.map(r => r.json()))})
  .then((res) => {
      res.forEach(el=>{
        objOfDates[el.Date.slice(0,10)] = el.Cur_OfficialRate 
      })
      
      let maxCur = {'date':0}
      let minCur = {'date': Number.MAX_SAFE_INTEGER}
      for(let key in objOfDates){

            // конвертируем валюту до деноминации 
            if(objOfDates[key]>100){
                objOfDates[key] = objOfDates[key]/10000
            }

          if(objOfDates[key]>maxCur[Object.keys(maxCur)[0]]){
            let oldKey = Object.keys(maxCur)[0]
            delete Object.assign(maxCur, {[key]: maxCur[oldKey] })[oldKey];
            maxCur[key] = objOfDates[key]
          }
          if(objOfDates[key]<minCur[Object.keys(minCur)[0]]){
            let oldKey = Object.keys(minCur)[0]
            delete Object.assign(minCur, {[key]: minCur[oldKey] })[oldKey];
            minCur[key] = objOfDates[key]
          }
        
      }
      createText(maxCur, maxField)
      createText(minCur, minField)


      firstDate.disabled = false;
      secondDate.disabled = false;
      submitBtn.disabled = false
  });

  //   //   https://www.nbrb.by/api/exrates/rates?periodicity=0&ondate=${date}
//   then(responses => Promise.all(responses.map(r => r.json())))
});

function getArrayOfDates(startDate, finishDate) {
  let arrOfDates = [];

  while (startDate <= finishDate) {
    arrOfDates.push(convertFromMilisecondsToDate(startDate));
    startDate += DAY_IN_MILISECONDS;
  }
  return arrOfDates;
  // let start =

  // 24 * 60 * 60 * 1000 - сутки в милисекундах
}

function convertFromMilisecondsToDate(mSec) {
  let year = new Date(mSec).getFullYear();
  let month = new Date(mSec).getMonth() + 1;
  let day = new Date(mSec).getDate();
  return `${year}-${correctDate(month)}-${correctDate(day)}`;
}

function createText(obj, parent){
    let p = parent.querySelector('.date_value')
    p.innerHTML = `${Object.keys(obj)[0]} : ${obj[Object.keys(obj)[0]]}`
    
}