

async function getTable() {
    return await new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = false;
        xhr.open("GET", "https://nullsccpeople-5603.restdb.io/rest/participants");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("x-apikey", "67b87527967a7fca0ab4d797");
        xhr.setRequestHeader("cache-control", "no-cache");

        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };

        xhr.send(null);
    })
}


function JSONToHTMLTable(jsonData, elementToBind) {
          
    //This Code gets all columns for header   and stored in array col
    var col = [];
    for (var i = 0; i < jsonData.length; i++) {
        for (var key in jsonData[i]) {
            if (col.indexOf(key) === -1 && (key[0] != "_")) {
                col.push(key);
            }
        }
    }

    //This Code creates HTML table
    var table = document.getElementById("table");
    table.innerHTML = ""

    //This Code getsrows for header creader above.
    var tr = table.insertRow(-1);

    for (var i = 0; i < col.length; i++) {
        var th = document.createElement("th");
        th.innerHTML = col[i];
        tr.appendChild(th);
    }

    //This Code adds data to table as rows
    for (var i = 0; i < jsonData.length; i++) {

        tr = table.insertRow(-1);

        for (var j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);
            tabCell.innerHTML = jsonData[i][col[j]];
        }
    }

    //This Code gets the all columns for header
}

let state = 1

function play() {
    if (state == 1) {
        animateIn()
        state = 2
    } else {
        animateOut()
        state = 1
    }
}

function setOffScreen( el ){
    var rect = el.getBoundingClientRect();
    return -1 * (screen.height - rect.top + el.offsetHeight/2);
  }

function animateIn() {
    return new Promise((resolve, reject) => {
        const graphic = document.querySelector('.graphic')

        const t1  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});  
        t1.set(graphic, {
            y: setOffScreen(graphic),
            opacity: 1
        })
        t1.to(graphic, {
            y: 0
        }, 'start')
        
    })
}

function animateOut() {
    return new Promise((resolve, reject) => {
        const graphic = document.querySelector('.graphic')

        const t1  = new gsap.timeline({ease: 'power1.in', onComplete: resolve});  
        t1.to(graphic, {
            y: setOffScreen(graphic)
        })
        t1.set(graphic, {
            opacity: 0,
            y: 0
        })
    })
}


async function update(incomingChange) {
    data = await getTable()
    j_data = JSON.parse(data)
    
    JSONToHTMLTable(j_data.slice(0,25))
    console.log(data)
}

update()



