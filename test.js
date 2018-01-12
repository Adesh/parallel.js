/* --- TEST --- */
let parallel = require('./index');


let p1 = new Promise(function(resolve, reject){ 
    var start = new Date().getTime();
    setTimeout(()=>{ 
        resolve(console.log("finished 1 in "+ getTimeDiff(start) + 'sec')); 
    }, 4000) 
});

let p2 = new Promise(function(resolve, reject){ 
    var start = new Date().getTime();
    setTimeout(()=>{ 
        resolve(console.log("finished 2 in "+ getTimeDiff(start) + 'sec')); 
    }, 4000) 
});

let p3 = new Promise(function(resolve, reject){ 
    var start = new Date().getTime();
    setTimeout(()=>{ 
        resolve(console.log("finished 3 in "+ getTimeDiff(start) + 'sec')); 
    }, 4000) 
});

let works = [p1, p2, p3];

function processSequentially(){    
    console.log("processSequentially()");

    p1
    .then(r1=>p2)
    .then(r2=>p3)
    .then(r3=>{})
    .catch(e=>{});    
}

function processParallelyInSameThread(){    
    console.log("processParallelyInSameThread()");

    Promise.all(works)
    .then(r1=>{})
    .catch(e=>{});    
}

function processParallelyInDiffThread(){
    console.log("processParallelyInDiffThread()");

    for(let work of works){
        parallel.addWork(work);
    }
}    

function getTimeDiff(start) {
    time_diff = new Date().getTime() - start
    return time_diff/1000;
}

//console.log(parallel.addWork)
//setTimeout(processSequentially, 1000);
//setTimeout(processParallelyInSameThread, 1000);
setTimeout(processParallelyInDiffThread, 1000);
