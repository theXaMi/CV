var busy = false;
var workingcat = null;
var empty = document.getElementById("emptycategory");
var savedleft = 0;
var savedtop = 0;
var savedheight = 0;
var animationspeed = 10;

function getCatFromEmpty() {
    return (workingcat);
}

async function init() {
    let cats = document.querySelectorAll(".category");
    i = cats[0].offsetTop-15;
    for (const c of cats) {
        if (c==empty) continue;
        c.style.top = i;
        if (c == cats[0])
            savedleft = c.offsetLeft;
        savedheight = c.offsetHeight - 9;
        c.style.left = c.offsetLeft;
        i += ((document.body.clientHeight-document.getElementById("head").offsetHeight) / (cats.length-1))-2;
    }
    let flag = document.getElementById("langicon");
    flag.style.left = document.body.clientWidth-flag.offsetWidth-document.getElementById("cvtext").offsetWidth-8;
    flag.style.top = 0;

    empty.style.top = cats[0].offsetTop;

    canvas = document.getElementById("canvas");
    canvassvg = document.getElementById("canvassvg");

    canvas.style.height = document.body.clientHeight;
    canvas.style.width = document.body.clientWidth;

    canvassvg.style.height = document.body.clientHeight;
    canvassvg.style.width = document.body.clientWidth;

    //let t=new Date().getTime();
    createcanvasitems();
    //let delta=new Date().getTime()-t;
    //alert(delta);
    //animationspeed=parseInt(delta/80); // optimizing app for slow devices
    while (1) {
        tick();
        await new Promise(r => setTimeout(r, 1));
    }
}

function changelang(obj) {
    if (obj.alt == "POL") { // to polish
        obj.alt = "ENG";
        obj.src = "https://raw.githubusercontent.com/lipis/flag-icon-css/master/flags/4x3/us.svg";
        for (const o of document.querySelectorAll(".lang-en")) {
            o.style.display = "none";
        }
        for (const o of document.querySelectorAll(".lang-pl")) {
            o.style.display = "block";
        }
    }
    else { // to english
        obj.alt = "POL";
        obj.src = "https://raw.githubusercontent.com/lipis/flag-icon-css/master/flags/4x3/pl.svg"
        for (const o of document.querySelectorAll(".lang-pl")) {
            o.style.display = "none";
        }
        for (const o of document.querySelectorAll(".lang-en")) {
            o.style.display = "block";
        }
    }
    for (const o of document.querySelectorAll(".progressbars br")) {
        o.style.display = "none";
    }
    for (const o of document.querySelectorAll("br.nodel")) {
        o.style.display = "block";
    }
}

async function expandcat(cat, openonly=false) {
    if (busy) return;
    if (cat == null) return;
    busy = true;
    let left = cat.offsetLeft;
    //empty.style.display="block";
    for (const c of document.querySelectorAll(".category")) { // closing opened category if there is one
        if (c == document.getElementById("emptycategory")) continue;
        if (c==cat && openonly) continue;
        let left = c.offsetLeft;
        if (left < window.innerWidth * .45) {
            continue;
        }
        let top = c.offsetTop;
        let height = parseInt(c.style.height);
        c.style.top = top;
        c.style.border = "1px solid";
        c.style.boxShadow = "inset 0 0 10px #445";
        for (let i = 0; top < savedtop || height > savedheight; i++) { // collapse
            if (top < savedtop) {
                top++;
                c.style.top = top;
            }

            if (height > savedheight && !(top + height < savedtop + savedheight)) {
                height -= 2;
                c.style.height = height;
            }
            else if (height <= savedheight) {
                height -= 1;
                c.style.height = height;
            }
            if (i % animationspeed == 0)
                await new Promise(r => setTimeout(r, 1));
        }
        for (; left > savedleft; left--) {
            c.style.left = left;
            empty.style.width = left + 20;
            if (left % animationspeed == 0)
                await new Promise(r => setTimeout(r, 1));
        }
        c.style.left = savedleft;
        break;
    };

    if (workingcat == cat) {
        busy = false;
        if (!openonly)
        workingcat = null;
        return;
    }
    workingcat = cat;

    //catright=cat.offsetLeft+cat.clientWidth;
    catleft = cat.offsetLeft;
    //empty.style.top = cat.offsetTop+cat.offsetHeight-55.5;

    empty.style.top = cat.style.top;
    for (; catleft < window.innerWidth * 0.5; catleft++) { // opening selected category
        cat.style.left = catleft;
        empty.style.width = catleft + 20;
        if (catleft % animationspeed == 0)
            await new Promise(r => setTimeout(r, 1));
    };
    //cat.style.height=cat.offsetHeight-cat.offsetMargin;
    cat.style.border = "8px solid";
    cat.style.boxShadow = "inset 0 0 50px #445";
    savedtop = parseInt(cat.style.top);
    let f = 0;
    for (let i = 0; ; i++) {
        let did = 0;
        if (parseInt(cat.style.height) < window.innerHeight / 1.5 || cat.style.height == "")
            cat.style.height = cat.offsetHeight - 10;
        else did++;
        //alert(cat.style.height);
        if (parseInt(cat.style.top) > window.innerHeight / 9)
            cat.style.top = parseInt(cat.style.top) - 5;
        else did++;
        if (parseInt(cat.style.top) > window.innerHeight / 4)
            cat.style.top = parseInt(cat.style.top) - 7;
        else did++;
        if (i<30) f=i;
        //cat.style.borderWidth="5px";
        if (i % animationspeed / 4 == 0)
            if (did==3) break;
            await new Promise(r => setTimeout(r, 1 * f)); // this animation isn't sped up on purpose, it looks nice that way
    }

    busy = false;
}


const points = [];
const lines = [];

var ballmovementcooldown = 0;
var ballmovementspeed = (window.devicePixelRatio*0.8)**2;

async function tick() {
    //print(busy);
    if (busy) return;
    for (const p of points) { // moving points
        if (p[3] > 0 && ballmovementcooldown != 0) {
            p[3]--;
            continue;
        }
        else {
            p[3] += ballmovementcooldown;
        }
        let left = parseFloat(p[0].style.left);
        let top = parseFloat(p[0].style.top);

        if (left < 0 || left > document.body.clientWidth && 0) {
            p[1] = -p[1];
            if (left < 0) left = 0;
            else left = document.body.clientWidth;
        }
        if (top < 0 || top > document.body.clientHeight && 0) {
            p[2] = -p[2];
            if (top < 0) top = 0;
            else top = document.body.clientHeight;
        }

        p[0].style.left = left + p[1];
        p[0].style.top = top + p[2];

    }

    for (const l of lines) { // moving lines
        if (Math.abs(l[0].x2.baseVal.value - l[0].x1.baseVal.value) > 100 || Math.abs(l[0].y2.baseVal.value - l[0].y1.baseVal.value) > 100) {
            for (const p of points) {
                if (l[1] == p[0] || l[2] == p[0]) {
                    p[1] = Math.random() * ballmovementspeed - ballmovementspeed/2;
                    p[2] = Math.random() * ballmovementspeed - ballmovementspeed/2;
                }
            }
        }

        l[0].setAttribute("x1", parseFloat(l[1].style.left) + 2);
        l[0].setAttribute("y1", parseFloat(l[1].style.top) + 2);
        l[0].setAttribute("x2", parseFloat(l[2].style.left) + 2);
        l[0].setAttribute("y2", parseFloat(l[2].style.top) + 2);
    }
}


function createcanvasitems(density = 200) {
    allpx = document.body.clientHeight * document.body.clientWidth;
    for (let i = 0; i < density; i++) {
        const newPt = document.createElement("div");
        document.getElementById("canvas").appendChild(newPt);
        points.push([newPt, Math.random() * ballmovementspeed - ballmovementspeed/2, Math.random() * ballmovementspeed - ballmovementspeed/2, Math.random() * 20]);
        newPt.className = "canvasitem"
        newPt.style.top = Math.random() * document.body.clientHeight;
        newPt.style.left = Math.random() * document.body.clientWidth;
    }
    const plines = [];
    for (const p of points) {
        for (const ap of points) {
            if (Math.pow(Math.abs(ap[0].offsetLeft - p[0].offsetLeft), 2) +
                Math.pow(Math.abs(ap[0].offsetTop - p[0].offsetTop), 2)
                < (allpx / density) * 2) {
                //alert(document.body.clientHeight*document.body.clientWidth)
                plines.push([p[0], ap[0]]);
            }
        }
    }
    for (const p of plines) {
        let l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        //let l = document.createElement("line");
        l.setAttribute("x1", p[0].offsetLeft);
        l.setAttribute("y1", p[0].offsetTop);
        l.setAttribute("x2", p[1].offsetLeft);
        l.setAttribute("y2", p[1].offsetTop);

        document.getElementById("canvassvg").appendChild(l);
        lines.push([l, p[0], p[1]]);
    }
}
