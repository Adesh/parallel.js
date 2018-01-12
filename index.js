let cluster = require('cluster');

let PENDING_WORKS = [];
let CPUS = {};

function ifIdleCluster () {
    for(let i in CPUS){
        if(CPUS[i] == 'idle'){
            return i;
        }
    }
    return false;
}

function addWork (work) {
    if(isPromise(work)) {
        //console.log("Work added");
        PENDING_WORKS.push(work);
    }
    else {
        console.log("addWork work failed, work must be promise")
    }
}

function isPromise (x) {
  
  return x && Object.prototype.toString.call(x) === "[object Promise]"
}

module.exports.addWork = addWork;

if(cluster.isMaster) {
    const cpus = require('os').cpus().length;
    
    for(let i=0; i<cpus; i++) {
        CPUS[i] = 'idle';
    }

    //cluster.on('exit', function(worker, code, signal) {
    //    console.log('Worker died', worker.process.pid, code, signal);
    //});

    cluster.on('message', (worker, message, handle) => {
        console.log("message from worker: ", message, handle)
    });


    setInterval(()=>{
        const idleCpu = ifIdleCluster();
        const pendingWorks = PENDING_WORKS.length;

        if(pendingWorks > 0 && idleCpu) {
            CPUS[idleCpu] = 'busy';
            console.log('Assigning work to cpu: ',idleCpu);
            let work = PENDING_WORKS.pop();
            console.log(work)
            cluster.fork().send({idleCpu:idleCpu, work:work })
        }
    },100);
}
else{
    process.on('message', (msg) => {
        console.log('msg from master',msg);  

        let idleCpu = msg['idleCpu'];
        let work    = msg['work'];

        if(isPromise(work) == false) {
            console.log("work must be a promise, found: ", typeof work, work);
            process.send({
                success:false, 
                msg: "work must be a promise, found", 
                pid: process.pid
            })
            process.exit(0)
        }
        else {
            work
            .then(res=>{
                console.log("Freeing CPU with response ",idleCpu,res);
                CPUS[idleCpu] = 'idle';
                process.send({
                    success:true, 
                    msg: res, 
                    pid: process.pid
                })
                process.exit(0)
            })
            .catch(e=>{
                console.log("Freeing CPU with error ",idleCpu,e);   
                CPUS[idleCpu] = 'idle';
                process.send({
                    success:false, 
                    msg: e, 
                    pid: process.pid
                })
                process.exit(0)
            });
        }
    });   
}
