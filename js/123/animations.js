(function(){
    const canvas = document.getElementById('heroParticles');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, mouse = {x:-999, y:-999};
    let lastMouseMoveTime = 0;
    const MOUSE_THROTTLE = 16; // ~60fps

    function resize(){
        const rect = canvas.parentElement.getBoundingClientRect();
        W = canvas.width = rect.width;
        H = canvas.height = rect.height;
    }
    window.addEventListener('resize', resize);
    resize();

    const heroSection = document.getElementById('hero');
    heroSection.addEventListener('mousemove', function(e){
        const now = Date.now();
        if(now - lastMouseMoveTime < MOUSE_THROTTLE) return;
        lastMouseMoveTime = now;
        
        const rect = heroSection.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    heroSection.addEventListener('mouseleave', function(){ mouse.x=-999; mouse.y=-999; });

    /* ========== HELPERS ========== */
    function drawFish(cx, cy, vx, vy, s, colors, tailPhase, alpha){
        alpha = alpha===undefined?1:alpha;
        const angle = Math.atan2(vy, vx);
        const tailWag = Math.sin(tailPhase)*0.45;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        // tail
        ctx.save(); ctx.rotate(tailWag);
        ctx.beginPath();
        ctx.moveTo(-s*0.9,0);
        ctx.lineTo(-s*1.9,-s*0.6);
        ctx.lineTo(-s*1.9,s*0.6);
        ctx.closePath();
        ctx.fillStyle=colors.tail;
        ctx.fill();
        ctx.restore();
        // body
        ctx.beginPath();
        ctx.ellipse(0,0,s,s*0.45,0,0,Math.PI*2);
        ctx.fillStyle=colors.body;
        ctx.fill();
        // dorsal fin
        ctx.beginPath();
        ctx.moveTo(-s*0.1,-s*0.45);
        ctx.quadraticCurveTo(s*0.2,-s*0.9,s*0.5,-s*0.4);
        ctx.lineTo(-s*0.1,-s*0.45);
        ctx.fillStyle=colors.fin;
        ctx.fill();
        // eye
        ctx.beginPath();
        ctx.arc(s*0.55,-s*0.1,s*0.12,0,Math.PI*2);
        ctx.fillStyle='rgba(255,255,255,0.9)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s*0.57,-s*0.1,s*0.07,0,Math.PI*2);
        ctx.fillStyle='#111';
        ctx.fill();
        ctx.restore();
    }

    /* ========== FISH CLASS ========== */
    const PALETTES = [
        {body:'rgba(220,0,30,0.75)',  fin:'rgba(255,60,80,0.5)',   tail:'rgba(180,0,20,0.6)'},
        {body:'rgba(255,30,55,0.7)',  fin:'rgba(255,100,110,0.45)',tail:'rgba(200,10,30,0.55)'},
        {body:'rgba(255,80,90,0.65)', fin:'rgba(255,140,150,0.4)', tail:'rgba(220,40,55,0.5)'},
        {body:'rgba(200,200,220,0.5)',fin:'rgba(255,255,255,0.3)', tail:'rgba(180,180,200,0.4)'},
    ];
    function Fish(i){ this.index=i; this.caught=false; this.alpha=1; this.reset(); }
    Fish.prototype.reset = function(){
        this.x=Math.random()*W;
        this.y=Math.random()*H;
        const a=Math.random()*Math.PI*2, sp=Math.random()*0.8+0.4;
        this.vx=Math.cos(a)*sp;
        this.vy=Math.sin(a)*sp;
        this.size=Math.random()*7+5;
        this.tailPhase=Math.random()*Math.PI*2;
        this.tailSpeed=Math.random()*0.08+0.05;
        this.colors=PALETTES[Math.floor(Math.random()*PALETTES.length)];
        this.caught=false;
        this.alpha=1;
    };
    Fish.prototype.update = function(){
        if(this.caught) return;
        const dx=mouse.x-this.x, dy=mouse.y-this.y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<80&&dist>0){ this.vx-=(dx/dist)*0.18; this.vy-=(dy/dist)*0.18; }
        else if(dist<220&&dist>0){ this.vx+=(dx/dist)*0.012; this.vy+=(dy/dist)*0.012; }
        this.vx+=(Math.random()-0.5)*0.04;
        this.vy+=(Math.random()-0.5)*0.04;
        const sp=Math.sqrt(this.vx*this.vx+this.vy*this.vy);
        if(sp>2.2){this.vx=this.vx/sp*2.2;this.vy=this.vy/sp*2.2;}
        if(sp<0.3&&sp>0){this.vx=this.vx/sp*0.3;this.vy=this.vy/sp*0.3;}
        this.x+=this.vx;
        this.y+=this.vy;
        this.tailPhase+=this.tailSpeed;
        const pad=20;
        if(this.x<-pad)this.x=W+pad;
        if(this.x>W+pad)this.x=-pad;
        if(this.y<-pad)this.y=H+pad;
        if(this.y>H+pad)this.y=-pad;
    };
    Fish.prototype.draw = function(){
        if(this.caught) return;
        drawFish(this.x,this.y,this.vx,this.vy,this.size,this.colors,this.tailPhase,this.alpha);
    };

    /* ========== BUBBLE CLASS ========== */
    function Bubble(){ this.reset(); }
    Bubble.prototype.reset=function(){
        this.x=Math.random()*W;
        this.y=Math.random()*H;
        this.r=Math.random()*1.5+0.3;
        this.alpha=Math.random()*0.25+0.04;
        this.vx=(Math.random()-0.5)*0.4;
        this.vy=(Math.random()-0.5)*0.4;
        this.life=Math.random()*300+100;
        this.age=Math.random()*this.life;
    };
    Bubble.prototype.update=function(){
        this.x+=this.vx;
        this.y+=this.vy;
        this.age++;
        if(this.x<0)this.x=W;
        if(this.x>W)this.x=0;
        if(this.y<0)this.y=H;
        if(this.y>H)this.y=0;
        if(this.age>this.life)this.reset();
    };
    Bubble.prototype.draw=function(){
        const fade=this.age<20?this.age/20:this.age>this.life-20?(this.life-this.age)/20:1;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
        ctx.fillStyle='rgba(255,0,38,'+(this.alpha*fade)+')';
        ctx.fill();
    };

    /* ========== CRAB CLASS ========== */
    function Crab(){
        this.phase = 'wait';
        this.cooldown = 400 + Math.random()*300;
        this.x = -60;
        this.y = H - 30;
        this.vx = 0;
        this.legPhase = 0;
        this.targetFish = null;
        this.caughtFish = null;
        this.exitTimer = 0;
        this.size = 18;
        this.mood = 'normal';
        this.moodTimer = 0;
        this.bubbleText = '';
        this.bubbleTimer = 0;
    }
    Crab.prototype.drawCrab = function(x, y, size, legPhase, mood){
        const s = size;
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath(); ctx.ellipse(0, 8, s*1.2, s*0.25, 0, 0, Math.PI*2);
        ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.fill();
        ctx.strokeStyle='rgba(200,60,0,0.85)'; ctx.lineWidth=2;
        for(let i=0;i<4;i++){
            const legWag = Math.sin(legPhase + i*0.8) * 0.3;
            ctx.save(); ctx.translate(-s*0.5, s*0.1);
            ctx.rotate(-0.4 - i*0.18 + legWag);
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-s*0.9, s*0.4); ctx.stroke();
            ctx.restore();
            ctx.save(); ctx.translate(s*0.5, s*0.1);
            ctx.rotate(0.4 + i*0.18 - legWag);
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(s*0.9, s*0.4); ctx.stroke();
            ctx.restore();
        }
        ctx.beginPath(); ctx.ellipse(0, 0, s, s*0.65, 0, 0, Math.PI*2);
        const cg = ctx.createRadialGradient(-s*0.3,-s*0.2,0,0,0,s);
        cg.addColorStop(0,'rgba(255,90,20,0.95)');
        cg.addColorStop(1,'rgba(180,30,0,0.9)');
        ctx.fillStyle=cg; ctx.fill();
        ctx.strokeStyle='rgba(255,120,40,0.5)'; ctx.lineWidth=1; ctx.stroke();
        const clawWag = mood==='excited' ? Math.sin(legPhase*3)*0.5 : Math.sin(legPhase)*0.15;
        ctx.save(); ctx.translate(-s*1.0, -s*0.1);
        ctx.rotate(-0.3 + clawWag);
        ctx.beginPath(); ctx.ellipse(0,0,s*0.5,s*0.35,0,0,Math.PI*2);
        ctx.fillStyle='rgba(220,60,0,0.9)'; ctx.fill();
        ctx.restore();
        ctx.save(); ctx.translate(s*1.0, -s*0.1);
        ctx.rotate(0.3 - clawWag);
        ctx.beginPath(); ctx.ellipse(0,0,s*0.5,s*0.35,0,0,Math.PI*2);
        ctx.fillStyle='rgba(220,60,0,0.9)'; ctx.fill();
        ctx.restore();
        ctx.fillStyle='white';
        ctx.beginPath(); ctx.arc(-s*0.35,-s*0.5,s*0.18,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc( s*0.35,-s*0.5,s*0.18,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#111';
        const eyeWag = mood==='happy' ? -0.1 : 0;
        ctx.beginPath(); ctx.arc(-s*0.35+eyeWag,-s*0.5,s*0.1,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc( s*0.35+eyeWag,-s*0.5,s*0.1,0,Math.PI*2); ctx.fill();
        ctx.beginPath();
        if(mood==='happy'){
            ctx.arc(0, -s*0.1, s*0.25, 0.1, Math.PI-0.1);
        } else if(mood==='excited'){
            ctx.arc(0, -s*0.1, s*0.2, 0.3, Math.PI-0.3);
        } else {
            ctx.moveTo(-s*0.2,-s*0.05); ctx.lineTo(s*0.2,-s*0.05);
        }
        ctx.strokeStyle='rgba(80,0,0,0.7)'; ctx.lineWidth=1.5; ctx.stroke();
        if(this.bubbleTimer > 0){
            ctx.save();
            ctx.font = 'bold 11px sans-serif';
            const tw = ctx.measureText(this.bubbleText).width;
            const bx = -tw/2-6, by = -s*1.8-22, bw = tw+12, bh = 20;
            ctx.fillStyle='rgba(255,255,255,0.92)';
            ctx.beginPath();
            ctx.roundRect(bx, by, bw, bh, 5);
            ctx.fill();
            ctx.fillStyle='#333';
            ctx.fillText(this.bubbleText, -tw/2, by+14);
            ctx.restore();
        }
        ctx.restore();
    };
    Crab.prototype.update = function(fishes){
        this.legPhase += 0.12;
        if(this.moodTimer>0) this.moodTimer--;
        else this.mood='normal';
        if(this.bubbleTimer>0) this.bubbleTimer--;
        if(this.phase==='wait'){
            this.cooldown--;
            if(this.cooldown<=0){ this.start(fishes); }
            return;
        }
        if(this.phase==='enter'){
            this.vx = 1.2;
            this.x += this.vx;
            if(this.x > W*0.15){
                this.phase='hunt';
                this.mood='excited'; this.moodTimer=60;
                this.bubbleText='🐟 got you!'; this.bubbleTimer=80;
                this.pickTarget(fishes);
            }
        }
        if(this.phase==='hunt'){
            if(!this.targetFish || this.targetFish.caught){
                this.pickTarget(fishes);
            }
            if(this.targetFish){
                const dx = this.targetFish.x - this.x;
                this.vx += dx>0 ? 0.15 : -0.15;
                this.vx *= 0.85;
                this.x += this.vx;
                this.y = H - 30;
                const dist = Math.abs(dx);
                if(dist < 30){
                    this.targetFish.caught = true;
                    this.caughtFish = this.targetFish;
                    this.phase = 'celebrate';
                    this.mood='happy'; this.moodTimer=180;
                    this.bubbleText='😄 Yummy!'; this.bubbleTimer=120;
                    this.exitTimer=90;
                }
            }
        }
        if(this.phase==='celebrate'){
            this.vx = Math.sin(this.legPhase*2)*0.5;
            this.x += this.vx;
            this.exitTimer--;
            if(this.exitTimer<=0){ this.phase='exit'; }
        }
        if(this.phase==='exit'){
            this.vx += 0.12;
            this.x += this.vx;
            if(this.x > W+80){
                if(this.caughtFish){
                    this.caughtFish.caught = false;
                    this.caughtFish.reset();
                }
                this.phase='wait';
                this.cooldown=500+Math.random()*400;
                this.x=-60;
                this.vx=0;
                this.caughtFish=null;
                this.targetFish=null;
            }
        }
    };
    Crab.prototype.start = function(fishes){
        this.phase='enter';
        this.x=-60;
        this.y=H-30;
        this.vx=0;
    };
    Crab.prototype.pickTarget = function(fishes){
        const available = fishes.filter(f=>!f.caught);
        if(available.length===0){ this.phase='exit'; return; }
        available.sort((a,b)=>b.y-a.y);
        this.targetFish = available[0];
    };
    Crab.prototype.draw = function(){
        if(this.phase==='wait') return;
        if(this.caughtFish){
            const f = this.caughtFish;
            f.x = this.x - this.size*1.2;
            f.y = this.y - this.size*0.8;
            drawFish(f.x, f.y, -1, 0.3, f.size, f.colors, f.tailPhase+=0.08, 0.9);
        }
        this.drawCrab(this.x, this.y, this.size, this.legPhase, this.mood);
    };

    /* ========== FISHING ROD ========== */
    function FishingRod(){
        this.phase = 'wait';
        this.cooldown = 600 + Math.random()*400;
        this.rodX = 0;
        this.lineY = 0;
        this.hookY = 0;
        this.targetLineY = 0;
        this.hookFish = null;
        this.nibbleTimer = 0;
        this.nibbleCount = 0;
        this.pullSpeed = 0;
        this.baitWag = 0;
        this.caught = false;
        this.exitY = 0;
    }
    FishingRod.prototype.update = function(fishes){
        this.baitWag += 0.05;
        if(this.phase==='wait'){
            this.cooldown--;
            if(this.cooldown<=0){ this.startDrop(); }
            return;
        }
        if(this.phase==='lower'){
            this.lineY += 2.5;
            this.hookY = this.lineY;
            if(this.lineY >= this.targetLineY){ this.phase='waiting'; this.nibbleTimer=80+Math.random()*120; }
        }
        if(this.phase==='waiting'){
            this.nibbleTimer--;
            const hx = this.rodX, hy = this.hookY;
            for(let f of fishes){
                if(f.caught) continue;
                const dx=f.x-hx, dy=f.y-hy;
                if(Math.sqrt(dx*dx+dy*dy)<40){
                    f.vx += dx<0?-0.08:0.08;
                    f.vy += dy<0?-0.05:0.05;
                }
            }
            if(this.nibbleTimer<=0){
                let best=null, bestD=999;
                for(let f of fishes){
                    if(f.caught) continue;
                    const dx=f.x-hx, dy=f.y-hy;
                    const d=Math.sqrt(dx*dx+dy*dy);
                    if(d<bestD){bestD=d;best=f;}
                }
                if(best && bestD < 120){
                    this.hookFish=best;
                    this.phase='nibble';
                    this.nibbleCount=3+Math.floor(Math.random()*3);
                    this.nibbleTimer=20;
                } else {
                    this.phase='pull';
                    this.caught=false;
                }
            }
        }
        if(this.phase==='nibble'){
            this.nibbleTimer--;
            if(this.hookFish){
                const dx=this.rodX-this.hookFish.x, dy=this.hookY-this.hookFish.y;
                const d=Math.sqrt(dx*dx+dy*dy)+0.1;
                this.hookFish.vx += (dx/d)*0.4;
                this.hookFish.vy += (dy/d)*0.4;
            }
            if(this.nibbleTimer<=0){
                this.nibbleCount--;
                this.nibbleTimer=25;
                this.hookY += (this.nibbleCount%2===0)?8:-8;
                if(this.nibbleCount<=0){
                    const dx=this.rodX-(this.hookFish?.x||9999), dy=this.hookY-(this.hookFish?.y||9999);
                    const d=Math.sqrt(dx*dx+dy*dy);
                    if(d < 55){
                        this.hookFish.caught=true;
                        this.caught=true;
                        this.phase='pull';
                    } else {
                        this.caught=false;
                        this.hookFish=null;
                        this.phase='pull';
                    }
                }
            }
        }
        if(this.phase==='pull'){
            this.hookY -= 3.5;
            if(this.hookFish && this.caught){
                this.hookFish.x = this.rodX;
                this.hookFish.y = this.hookY;
            }
            if(this.hookY <= -40){
                this.phase='wait';
                this.cooldown=500+Math.random()*500;
                this.hookY=0; this.lineY=0;
                if(this.hookFish){ this.hookFish.caught=false; this.hookFish.reset(); }
                this.hookFish=null; this.caught=false;
            }
        }
    };
    FishingRod.prototype.startDrop = function(){
        this.rodX = W*0.25 + Math.random()*W*0.5;
        this.lineY = 0;
        this.hookY = 0;
        this.targetLineY = H*0.3 + Math.random()*H*0.45;
        this.phase='lower';
        this.hookFish=null; this.caught=false;
    };
    FishingRod.prototype.draw = function(){
        if(this.phase==='wait') return;
        const rx = this.rodX;
        const topY = 0;
        ctx.save();
        ctx.strokeStyle='rgba(180,120,60,0.9)';
        ctx.lineWidth=3;
        ctx.beginPath(); ctx.moveTo(rx-8, topY); ctx.lineTo(rx, topY+18); ctx.stroke();
        ctx.strokeStyle='rgba(200,200,200,0.55)';
        ctx.lineWidth=1;
        ctx.setLineDash([4,3]);
        ctx.beginPath(); ctx.moveTo(rx, topY+18); ctx.lineTo(rx, this.hookY); ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle='rgba(220,220,220,0.85)';
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.arc(rx+6, this.hookY+8, 8, Math.PI*0.8, Math.PI*2.2);
        ctx.stroke();
        const bwag = Math.sin(this.baitWag)*3;
        ctx.fillStyle='rgba(255,160,80,0.9)';
        ctx.beginPath(); ctx.ellipse(rx+6+bwag, this.hookY+16, 5, 3, 0.3, 0, Math.PI*2); ctx.fill();
        if(this.hookFish && this.caught){
            const f=this.hookFish;
            drawFish(f.x, f.y, -1, -0.5, f.size, f.colors, f.tailPhase+=0.1, 1);
        }
        ctx.restore();
    };

    const FISH_COUNT = 8;
    const BUBBLE_COUNT = 35;
    const fishes  = Array.from({length:FISH_COUNT}, (_,i)=>new Fish(i));
    const bubbles = Array.from({length:BUBBLE_COUNT}, ()=>new Bubble());
    const crab    = new Crab();
    const rod     = new FishingRod();

    function animate(){
        ctx.clearRect(0,0,W,H);
        bubbles.forEach(b=>{b.update();b.draw();});
        fishes.forEach(f=>f.update());
        rod.update(fishes);
        crab.update(fishes);
        fishes.forEach(f=>f.draw());
        rod.draw();
        crab.draw();
        requestAnimationFrame(animate);
    }
    animate();
})();

(function(){
    const canvas = document.getElementById('walkingCatStrip');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize(){
        canvas.width = window.innerWidth;
        canvas.style.width = '100vw';
        canvas.height = 80;
    }
    resize();
    window.addEventListener('resize', resize);

    let mouseX = -9999, mouseOnCanvas = false;
    canvas.addEventListener('mousemove', function(e){
        const r = canvas.getBoundingClientRect();
        mouseX = (e.clientX - r.left) * (canvas.width / r.width);
        mouseOnCanvas = true;
    });
    canvas.addEventListener('mouseleave', function(){ mouseOnCanvas = false; mouseX = -9999; });

    let state    = 'walk';
    let x        = -60;
    let dir      = 1;
    let frame    = 0;
    const WALK_SPEED  = 1.2;
    const CHASE_SPEED = 3.2;
    const BALL_RUN_SPEED = 2.8;
    const CAT_H  = 44;
    const CY     = canvas.height - 30;

    let noticeTimer  = 0;
    let arrivedTimer = 0;
    let bubbleText   = '';
    let bubbleAlpha  = 0;
    let bubbleFloatY = 0;
    let mouseCooldown = 0;

    let ball = null;
    let ballTimer = 500;

    function spawnBall(){
        if(ball) return;
        const W = canvas.width;
        ball = {
            x: 40 + Math.random() * (W - 80),
            y: -14,
            vy: 2.5,
            vx: (Math.random() - 0.5) * 1.4,
            r: 7,
            bounce: 0,
            held: false
        };
    }

    function tickBall(){
        ballTimer--;
        if(ballTimer <= 0 && !ball && (state === 'walk')){
            spawnBall();
            ballTimer = 550 + Math.floor(Math.random() * 400);
        }
        if(!ball || ball.held) return;
        ball.vy += 0.22;
        ball.y  += ball.vy;
        ball.x  += ball.vx;
        if(ball.y + ball.r >= canvas.height - 4){
            ball.y  = canvas.height - 4 - ball.r;
            ball.vy = -ball.vy * 0.55;
            ball.vx *= 0.85;
            ball.bounce++;
            if(Math.abs(ball.vy) < 0.5 && ball.bounce >= 3){ ball = null; }
        }
        if(ball && ball.x - ball.r < 0){ ball.x = ball.r; ball.vx *= -1; }
        if(ball && ball.x + ball.r > canvas.width){ ball.x = canvas.width - ball.r; ball.vx *= -1; }
    }

    function drawBall(bx, by){
        if(!ball) return;
        const dx = bx !== undefined ? bx : ball.x;
        const dy = by !== undefined ? by : ball.y;
        ctx.save();
        ctx.beginPath();
        ctx.arc(dx, dy, ball.r, 0, Math.PI*2);
        const g = ctx.createRadialGradient(dx-2, dy-2, 1, dx, dy, ball.r);
        g.addColorStop(0, '#ff6688');
        g.addColorStop(1, '#cc0022');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(dx-2, dy-2, ball.r*0.35, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fill();
        ctx.restore();
    }

    function drawWalkingCat(cx, cy, facing, step, catState){
        ctx.save();
        ctx.translate(cx, cy);
        if(facing === -1) ctx.scale(-1, 1);
        const t = step;
        const isMoving = (catState === 'walk' || catState === 'chase' || catState === 'ballchase' || catState === 'ballrun');
        const legSwing = isMoving ? Math.sin(t * 0.35) * 7 : 0;
        const bodyBob  = isMoving ? Math.abs(Math.sin(t * 0.35)) * 2 : 0;
        const tailWave = Math.sin(t * 0.18) * 12;
        const tailRaise = (catState === 'arrived' || catState === 'ballrun') ? -10 : 0;
        ctx.beginPath();
        ctx.ellipse(0, CAT_H/2 + 2 - bodyBob, 20, 5, 0, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fill();
        ctx.save();
        ctx.translate(-14, CAT_H/2 - 22 - bodyBob);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-18, -10 + tailWave + tailRaise, -10, -28 + tailWave*0.6 + tailRaise);
        ctx.strokeStyle = '#ff0026'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.translate(-8, CAT_H/2 - 4 - bodyBob);
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-legSwing*0.7, 16); ctx.strokeStyle = '#c0c0c0'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(legSwing*0.7, 16); ctx.stroke();
        ctx.restore();
        ctx.beginPath();
        ctx.ellipse(0, CAT_H/2 - 14 - bodyBob, 16, 11, -0.1, 0, Math.PI*2);
        ctx.fillStyle = '#d0d0d0'; ctx.fill();
        ctx.strokeStyle = 'rgba(255,0,38,0.3)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(2, CAT_H/2 - 13 - bodyBob, 8, 6, 0, 0, Math.PI*2);
        ctx.fillStyle = '#f0f0f0'; ctx.fill();
        ctx.save();
        ctx.translate(8, CAT_H/2 - 6 - bodyBob);
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(legSwing, 14); ctx.strokeStyle = '#c0c0c0'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-legSwing, 14); ctx.stroke();
        ctx.restore();
        ctx.beginPath();
        ctx.moveTo(10, CAT_H/2 - 22 - bodyBob);
        ctx.lineTo(12, CAT_H/2 - 14 - bodyBob);
        ctx.strokeStyle = '#d0d0d0'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.stroke();
        const headTilt = (catState === 'notice') ? 0.28 : 0;
        ctx.save();
        ctx.translate(12, CAT_H/2 - 28 - bodyBob);
        ctx.rotate(headTilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 10, 0.15, 0, Math.PI*2);
        ctx.fillStyle = '#d0d0d0'; ctx.fill();
        ctx.strokeStyle = 'rgba(255,0,38,0.2)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#c0c0c0';
        ctx.beginPath(); ctx.moveTo(-8,-7); ctx.lineTo(-11,-16); ctx.lineTo(-2,-9); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(4,-8); ctx.lineTo(10,-16); ctx.lineTo(10,-8); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,0,38,0.35)';
        ctx.beginPath(); ctx.moveTo(-6,-8); ctx.lineTo(-8,-13); ctx.lineTo(-2,-9.5); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(5,-9); ctx.lineTo(9,-15); ctx.lineTo(9.5,-9.5); ctx.closePath(); ctx.fill();
        const blink   = (Math.floor(frame/90) % 7 === 0);
        const excited = (catState === 'notice' || catState === 'arrived' || catState === 'ballchase' || catState === 'ballrun');
        ctx.fillStyle = '#ff0026';
        if(blink){
            ctx.fillRect(-5,-2,5,1.5);
            ctx.fillRect(6,-2,5,1.5);
        } else {
            const eyeR = excited ? 3 : 2.2;
            ctx.beginPath(); ctx.arc(-3,-2,eyeR,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(6,-2,eyeR,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#1a0008';
            ctx.beginPath(); ctx.arc(-2.5,-2, excited?1.5:1,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(6.5,-2,  excited?1.5:1,0,Math.PI*2); ctx.fill();
        }
        ctx.fillStyle = '#ff6680';
        ctx.beginPath(); ctx.arc(1,2,2,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 0.8; ctx.lineCap = 'round';
        [[-1,0],[-1,2],[1,-1]].forEach(([dy,angle])=>{
            ctx.save(); ctx.translate(1,2); ctx.rotate(angle*0.3);
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-16,dy*2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(16,dy*2); ctx.stroke();
            ctx.restore();
        });
        ctx.restore();
        ctx.restore();
    }

    function drawBubble(cx, cy){
        if(bubbleAlpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = bubbleAlpha;
        const bx = cx, by = cy - 18 - bubbleFloatY;
        const pad = 6, tw = ctx.measureText(bubbleText).width;
        const bw = tw + pad*2, bh = 18;
        ctx.fillStyle = 'rgba(20,20,20,0.82)';
        ctx.strokeStyle = '#ff0026';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(bx - bw/2, by - bh, bw, bh, 5);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx - 5, by); ctx.lineTo(bx, by + 6); ctx.lineTo(bx + 5, by);
        ctx.fillStyle = 'rgba(20,20,20,0.82)'; ctx.fill();
        ctx.strokeStyle = '#ff0026'; ctx.stroke();
        ctx.font = 'bold 10px Rubik, sans-serif';
        ctx.fillStyle = '#ff6680';
        ctx.textAlign = 'center';
        ctx.fillText(bubbleText, bx, by - 5);
        ctx.restore();
    }

    function loop(){
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const W  = canvas.width;
        const mx = mouseX;
        if(mouseCooldown > 0) mouseCooldown--;
        tickBall();
        if(state === 'walk'){
            if(ball && !ball.held && ball.y > -5){
                state = 'ballchase';
            } else if(mouseOnCanvas && mouseCooldown === 0 && Math.abs(mx - x) > 25 && Math.abs(mx - x) < 200){
                state = 'notice';
                noticeTimer = 45;
                dir = mx > x ? 1 : -1;
                bubbleText = 'Miaw! I am katch far';
                bubbleAlpha = 1;
                bubbleFloatY = 0;
            } else {
                x += WALK_SPEED * dir;
                if(dir===1 && x > W+60){ x=W+60; dir=-1; }
                else if(dir===-1 && x < -60){ x=-60; dir=1; }
            }
        } else if(state === 'notice'){
            bubbleFloatY += 0.3;
            bubbleAlpha  -= 0.012;
            if(bubbleAlpha < 0) bubbleAlpha = 0;
            noticeTimer--;
            dir = (mouseOnCanvas && mx > x) ? 1 : dir;
            dir = (mouseOnCanvas && mx < x) ? -1 : dir;
            if(!mouseOnCanvas){ state='walk'; mouseCooldown=60; }
            else if(noticeTimer <= 0){ state = 'chase'; }
        } else if(state === 'chase'){
            if(!mouseOnCanvas){ state='walk'; mouseCooldown=80; }
            else {
                dir = mx > x ? 1 : -1;
                x += CHASE_SPEED * dir;
                if(Math.abs(mx - x) < 22){ state = 'arrived'; arrivedTimer = 100; mouseCooldown = 180; }
            }
        } else if(state === 'arrived'){
            arrivedTimer--;
            if(!mouseOnCanvas || arrivedTimer <= 0){ state = 'walk'; }
        } else if(state === 'ballchase'){
            if(!ball){ state='walk'; }
            else {
                dir = ball.x > x ? 1 : -1;
                x += CHASE_SPEED * dir;
                if(Math.abs(ball.x - x) < 20 && ball.y > CY - 30){
                    ball.held = true;
                    state = 'ballrun';
                    dir = x < W/2 ? 1 : -1;
                }
            }
        } else if(state === 'ballrun'){
            x += BALL_RUN_SPEED * dir;
            if(ball){ ball.x = x + dir*14; ball.y = CY - 12; }
            if(x > W + 60 || x < -60){
                ball = null;
                state = 'walk';
                if(x > W + 60){ x = W+60; dir=-1; }
                else { x=-60; dir=1; }
            }
        }
        x = Math.max(-80, Math.min(W+80, x));
        if(ball && !ball.held) drawBall();
        drawWalkingCat(x, CY, dir, frame, state);
        if(ball && ball.held) drawBall(ball.x, ball.y);
        drawBubble(x, CY);
        requestAnimationFrame(loop);
    }

    setTimeout(() => { x = -60; loop(); }, 500);
})();

(function() {
    var track = document.getElementById('caseScrollTrack');
    if (!track) return;
    var origCards = Array.from(track.children);
    origCards.forEach(function(card) {
        track.appendChild(card.cloneNode(true));
    });
    var half = track.scrollWidth / 2;
    track.scrollLeft = half;
    var paused = false;
    var speed = 1;
    function autoLoop() {
        if (!paused) {
            track.scrollLeft -= speed;
            var half = track.scrollWidth / 2;
            if (track.scrollLeft <= 0) {
                track.scrollLeft = half;
            }
        }
        requestAnimationFrame(autoLoop);
    }
    autoLoop();
    track.addEventListener('mouseenter', function() { paused = true; });
    track.addEventListener('mouseleave', function() {
        if (!isDown) paused = false;
    });
    var isDown = false, startX, startScrollLeft;
    track.style.cursor = 'grab';
    track.addEventListener('mousedown', function(e) {
        isDown = true;
        paused = true;
        track.style.cursor = 'grabbing';
        startX = e.pageX;
        startScrollLeft = track.scrollLeft;
        e.preventDefault();
    });
    document.addEventListener('mouseup', function() {
        if (!isDown) return;
        isDown = false;
        track.style.cursor = 'grab';
        paused = false;
    });
    document.addEventListener('mousemove', function(e) {
        if (!isDown) return;
        var dx = e.pageX - startX;
        var newScroll = startScrollLeft - dx;
        var half = track.scrollWidth / 2;
        if (newScroll <= 0) newScroll = half;
        if (newScroll >= track.scrollWidth - track.clientWidth) newScroll = half;
        track.scrollLeft = newScroll;
    });
    var btnLeft = document.getElementById('btnCaseLeft');
    var btnRight = document.getElementById('btnCaseRight');
    if (btnLeft) {
        btnLeft.addEventListener('click', function() {
            paused = true;
            var half = track.scrollWidth / 2;
            track.scrollLeft += 420;
            if (track.scrollLeft >= track.scrollWidth - track.clientWidth) track.scrollLeft = half;
            setTimeout(function() { paused = false; }, 800);
        });
    }
    if (btnRight) {
        btnRight.addEventListener('click', function() {
            paused = true;
            var half = track.scrollWidth / 2;
            track.scrollLeft -= 420;
            if (track.scrollLeft <= 0) track.scrollLeft = half;
            setTimeout(function() { paused = false; }, 800);
        });
    }
})();

(function(){
    const canvas = document.getElementById('particleText');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');

    function setSize(){
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = 90;
    }
    setSize();
    window.addEventListener('resize', ()=>{ setSize(); buildParticles(); });

    const mouse = {x:-9999, y:-9999, radius:100, active:false};
    const hero = document.getElementById('hero');
    hero.addEventListener('mousemove', function(e){
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
    });
    hero.addEventListener('mouseleave', function(){
        mouse.x = -9999; mouse.y = -9999;
        mouse.active = false;
    });

    let particles = [];

    function buildParticles(){
        particles = [];
        const off = document.createElement('canvas');
        off.width = canvas.width;
        off.height = canvas.height;
        const octx = off.getContext('2d');
        const fs = Math.min(Math.floor(canvas.width / 5.5), 72);
        octx.fillStyle = '#ff0026';
        octx.font = `700 ${fs}px Rubik, sans-serif`;
        octx.textBaseline = 'middle';
        octx.textAlign = 'left';
        octx.fillText('Mahfuz BD Asia', 4, canvas.height/2);
        const data = octx.getImageData(0, 0, off.width, off.height).data;
        const gap = 3;
        for(let y=0; y<off.height; y+=gap){
            for(let x=0; x<off.width; x+=gap){
                const idx = (y * off.width + x) * 4;
                if(data[idx+3] > 128){
                    particles.push(new Particle(x, y));
                }
            }
        }
    }

    function Particle(ox, oy){
        this.ox = ox;
        this.oy = oy;
        this.x = ox;
        this.y = oy;
        this.vx = 0;
        this.vy = 0;
        this.size = 1.5;
        this.ease = Math.random()*0.05 + 0.06;
    }

    Particle.prototype.update = function(){
        if(mouse.active){
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if(dist < mouse.radius){
                const force = (mouse.radius - dist) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                const push = force * 8;
                this.vx -= Math.cos(angle) * push;
                this.vy -= Math.sin(angle) * push;
            }
        }
        this.vx += (this.ox - this.x) * this.ease;
        this.vy += (this.oy - this.y) * this.ease;
        this.vx *= 0.80;
        this.vy *= 0.80;
        this.x += this.vx;
        this.y += this.vy;
    };

    Particle.prototype.draw = function(){
        const dx = this.x - this.ox;
        const dy = this.y - this.oy;
        const dist = Math.sqrt(dx*dx+dy*dy);
        const alpha = Math.max(0.15, 1 - dist/120);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,0,38,' + alpha + ')';
        ctx.fill();
    };

    buildParticles();

    function animate(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        particles.forEach(p=>{ p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
})();
