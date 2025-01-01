var first = true;
var keys = {"w": false, "a": false, "s": false, "d": false, "g": false, "h": false};
var attackX = 0;
var attackY = 0;
const canvas = document.querySelector("canvas");
const data = {"t1": [0, 500, 50]};
var ch = "t1";
const drawCurve = (ctx, cx, cy, rx, ry) => {
    ctx.save();
    ctx.beginPath();

    ctx.translate(cx-rx, cy-ry);
    ctx.scale(rx, ry);
    ctx.arc(1, 1, 1, 0, Math.PI, true);

    ctx.restore();
    ctx.stroke();
 }
document.addEventListener("click", async (e)=>{
    if(document.pointerLockElement != canvas){
        await canvas.requestPointerLock();
    }
    if(document.fullscreenElement != canvas){
        await canvas.requestFullscreen();
    }
    if(!first){return;}
    first = false;
    document.querySelector('#click').remove();
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var w = window.innerWidth;
    var h = window.innerHeight;
    class RGBColor{
        constructor(r, g, b){
            this.r = r;
            this.g = g;
            this.b = b;
            this.getStr = () => {
                return `rgb(${this.r},${this.g},${this.b})`;
            }
        }
    }
    class Joystick{
        constructor(c, fillColor){
            this.x = 0;
            this.y = 0;
            this.c = c;
            this.r = (window.innerWidth >= window.innerHeight) ? window.innerHeight/10 : window.innerWidth/10;
            this.fillColor = fillColor.getStr();
            this.primaryColor = (fillColor.b >= fillColor.g) ? ((fillColor.b >= fillColor.r) ? "b" : "r") : ((fillColor.g >= fillColor.r) ? "g" : "r");
            this.primaryStrokeColor = `rgb(${this.primaryColor == "r" ? 100 : 0},${this.primaryColor == "g" ? 100 : 0},${this.primaryColor == "b" ? 100 : 0})`;
            var current;
            for(var i = 0; i < 3; i += 1){
                current = ["r","g","b"][i] 
                if(current == this.primaryColor){
                    (fillColor[this.primaryColor] >= 100) ? fillColor[this.primaryColor] -= 100 : fillColor[this.primaryColor] = 0;
                }else{
                    (fillColor[current] >= 200) ? fillColor[current] -= 200 : fillColor.r = 0;
                }
            }
            this.strokeColor = fillColor.getStr();
            this.render = (cx, cy) => {
                c.lineWidth = 1;
                c.beginPath();
                c.strokeStyle=this.strokeColor;
                c.arc(cx, cy, this.r, 0, 2*Math.PI);
                c.stroke();
                c.beginPath();
                c.fillStyle = this.fillColor;
                c.strokeStyle = this.primaryStrokeColor;
                c.lineWidth = 4;
                c.arc((this.x/100)*this.r+cx, (this.y/100)*this.r+cy, this.r/2, 0, 2*Math.PI);
                c.fill();
                c.stroke();
            } 
        }
    }
    var move = new Joystick(ctx, new RGBColor(0, 0, 255));
    var attack = new Joystick(ctx, new RGBColor(200, 50, 50));
    const render = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle="green";
        ctx.fillRect(0, 0, w, h);
        move.render(w/8, h*4/5);
        attack.render(w*7/8, h*4/5);
        var ox = attackX - w/2;
        var oy = attackY - h/2;
        var curveWidth = Math.sqrt(ox*ox+oy*oy);
        if(curveWidth > data[ch][1]){
            curveWidth = data[ch][1]
        }
        if(curveWidth >= 50){
            ctx.save();
            ctx.translate(w/2, h/2);
            var curveDirectionX = attackX >= w/2;
            var curveDirectionY = attackY >= h/2;
            if(curveDirectionX && curveDirectionY){
                var angle = Math.atan(Math.abs(oy)/Math.abs(ox));
            }else if(!curveDirectionX && curveDirectionY){
                var angle = Math.PI-Math.atan(Math.abs(oy)/Math.abs(ox));
            }else if(!curveDirectionX && !curveDirectionY){
                var angle = Math.PI+Math.atan(Math.abs(oy)/Math.abs(ox));
            }else if(curveDirectionX && !curveDirectionY){
                var angle = 2*Math.PI-Math.atan(Math.abs(oy)/Math.abs(ox));
            }
            ctx.rotate(angle);
            ctx.translate(-w/2, -h/2);
            var curvecx = w/2+curveWidth/2;
            if(angle%(Math.PI/2)>=Math.PI/4){
                var height = (Math.PI/4-angle%(Math.PI/4))*4/Math.PI*curveWidth/5+20;
            }else{
                var height = (angle%(Math.PI/4))*4/Math.PI*curveWidth/5+20;
            }
            ctx.beginPath();
            ctx.fillStyle="rgba(255, 255, 255, 0.7)";
            ctx.arc(curveWidth+w/2, h/2, data[ch][2], 0, 2*Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(curvecx, h/2, curveWidth/2, height, 0, 0, Math.PI, true);
            ctx.restore();
            ctx.lineWidth = 20;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.stroke();
        }
    }
    document.addEventListener("mousemove", (e) => {
        attackX += e.movementX;
        attackY += e.movementY;
        if(attackX > w){
            attackX = w;
        }
        if(attackX < 0){
            attackX = 0;
        }
        if(attackY > h){
            attackY = h;
        }
        if(attackY < 0){
            attackY = 0;
        }
        attack.x = attackX*200/w - 100;
        attack.y = attackY*200/h - 100;
    });
    window.addEventListener("resize", async (e)=>{
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        w = window.innerWidth;
        h = window.innerHeight;
        move.r = (window.innerWidth >= window.innerHeight) ? window.innerHeight/10 : window.innerWidth/10;
        attack.r = (window.innerWidth >= window.innerHeight) ? window.innerHeight/10 : window.innerWidth/10;
        render();
        await canvas.requestFullscreen();
        await canvas.requestPointerLock();
    });
    document.addEventListener("keydown", (e) => {
        const k = e.key.toLowerCase();
        if(["w", "a", "s", "d", "g", "h"].indexOf(k) != -1){
            if(k == "w" && !keys["s"]){
                move.y = -100;
            }
            if(k == "a" && !keys["d"]){
                move.x = -100;
            }
            if(k == "s" && !keys["w"]){
                move.y = 100;
            }
            if(k == "d" && !keys["a"]){
                move.x = 100;
            }
            if(k == "w" && keys["s"] || k == "s" && keys["w"]){
                move.y = 0;
            }
            if(k == "d" && keys["a"] || k == "a" && keys["d"]){
                move.x = 0;
            }
            keys[k]= true;
        }
    });
    document.addEventListener("keyup", (e) => {
        const k = e.key.toLowerCase();
        if(["w", "a", "s", "d", "g", "h"].indexOf(k) != -1){
            if(k == "w" || k == "s"){
                move.y = 0;
                if(keys[(k == "w") ? "s" : "w"]){
                    move.y = (k == "w") ? 100 : -100;
                }
            }
            if(k == "a" || k == "d"){
                move.x = 0;
                if(keys[(k == "a") ? "d" : "a"]){
                    move.x = (k == "a") ? 100 : -100;
                }
            }
            keys[k] = false;
        }
    });
    setInterval(render, 60);
});
