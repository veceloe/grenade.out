const APP_CONFIG = {width: window.innerWidth, height: window.innerHeight, transparent: true, resolution: window.devicePixelRatio || 1};
const MAP = {
    barrels:[
        {x: Math.random() * (window.innerWidth-100) + 100,  y: Math.random() * (window.innerHeight-145) + 145, width: 100, height: 145},
        {x: Math.random() * (window.innerWidth-100) + 100, y: Math.random() * (window.innerHeight-145) + 145, width: 100, height: 145},
        {x: Math.random() * (window.innerWidth-100) + 100, y: Math.random() * (window.innerHeight-145) + 145, width: 100, height: 145}]
};

let barrels = [];

window.addEventListener("load", function () {
    const app = new PIXI.Application(APP_CONFIG);
    document.body.appendChild(app.view);
    Keyboard.init();
    let ground = PIXI.Sprite.from('/assets/images/line.png');
    app.stage.addChild(ground);

    let x = app.screen.width / 2, y = app.screen.height / 2;
    let grenade = PIXI.Sprite.from('/assets/images/gr2.png');
    ground.x = 0;
    ground.y = 930;
    grenade.anchor.set(0.5);
    grenade.restart = () => {
        grenade.rotation = 0;
        grenade.power = 100;
        grenade.fire = 0;
        grenade.moveTime = 0;
        grenade.expTime = 0;
        grenade.x = x;
        grenade.y = y;
    };
    grenade.restart();
    app.stage.addChild(grenade);

    barrels = MAP.barrels.map((bar)=>{
        let barrel = PIXI.Sprite.from('/assets/images/bar.png');
        app.stage.addChild(barrel);
        barrel.x = bar.x;
        barrel.y = bar.y;
        barrel.width = bar.width;
        barrel.height = bar.height;
        return barrel;
    });
    const exp = new PIXI.Graphics();
    exp.lineStyle(0);
    exp.beginFill(0xFFA500, 1);
    exp.drawCircle(0, 0, 10);
    exp.endFill();
    exp.restart = () => {
            exp.scale.x = 0.2;
            exp.scale.y = 0.2;
            exp.x = -1000;
            exp.y = -1000;
        };
    let tPower = new PIXI.Text("", {stroke: 0xff2200});
    let tAngle = new PIXI.Text("", {stroke: 0xff2200});
    tAngle.x = 0;
    tAngle.y = 25;
    app.stage.addChild(tPower);
    app.stage.addChild(tAngle);
    app.stage.addChild(exp);


    app.ticker.add((delta) => {
        if (!grenade.fire) {
            if (Keyboard.hasKey(39)) grenade.rotation += 0.1 * delta;
            if (Keyboard.hasKey(37)) grenade.rotation -= 0.1 * delta;
            if (grenade.rotation > 2 * Math.PI) grenade.rotation -= 2 * Math.PI;
            if (grenade.rotation < 0) grenade.rotation = 2 * Math.PI - grenade.rotation;
            if (Keyboard.hasKey(38)) {
                grenade.power += 1 * delta;
                if (grenade.power > 100) grenade.power = 100;
                if (grenade.power < 0) power = 0;
            }
            if (Keyboard.hasKey(40)) {
                grenade.power -= 1 * delta;
                if (grenade.power > 100) grenade.power = 100;
                if (grenade.power < 0) grenade.power = 0;
            }
            if (Keyboard.onKey(32)) grenade.fire = grenade.last = Date.now();
            if (Keyboard.onKey(13)) grenade.restart();
        }

        if (grenade.fire && !grenade.moveTime && !grenade.expTime) {
            let now = Date.now();
            let u = grenade.power * 100, k = 0.0003;
            let t = now - grenade.fire;
            let dt = now - grenade.last;
            for (let i = t - dt; i < t; i+=0.1) {
                let angle = 2 * Math.PI - (grenade.rotation - Math.PI / 2);
                let xx = x + k * (u * i * Math.cos(angle));
                let yy = y - k * (u * i * Math.sin(angle) - 9.8 * i * i / 2);
                if (!isWall(xx, yy)) {
                    grenade.x = xx;
                    grenade.y = yy;
                } else {
                  grenade.fire = false;
                  grenade.expTime = Date.now();
                  exp.x = grenade.x;
                  exp.y = grenade.y;
                }
            }
            grenade.last = now;
        }

         if (grenade.y > 900) {
             grenade.y = 900;
             grenade.moveTime = Date.now();
             ang = grenade.rotation;
         }

         if (grenade.moveTime) {
             if (ang > 3.5 && !isWall(grenade.x,grenade.y)) {
                grenade.x -= 0.1 * grenade.power;
                grenade.rotation -= 0.004 * grenade.power;
             }
             if (ang < 3.5 && !isWall(grenade.x,grenade.y)) {
                 grenade.x += 0.1 * grenade.power;
                 grenade.rotation += 0.004 * grenade.power;
            }
             if (Date.now() - grenade.moveTime > 1000) grenade.restart();
             if (grenade.x > window.innerWidth || grenade.x < 0 || grenade.y > window.innerHeight || grenade.y < 0) grenade.restart();
        }

               if (grenade.expTime) {
                  exp.scale.x *= 1.05;
                  exp.scale.y *= 1.05;
                  if (Date.now() - grenade.expTime > 500) {
                   exp.restart();
                   grenade.restart();
                   }
                }

        tPower.text = "Grenade power: " + (grenade.power << 0);
        let angle = 2 * Math.PI - (grenade.rotation - Math.PI / 2);
        tAngle.text = "Grenade angle: " + (angle << 0);
    });
});

function isWall(x, y) {
    for (let i = 0; i < barrels.length; i++) {
        let b = barrels[i];
        if (b.x < x && x < b.x + b.width && b.y < y && y < b.y + b.height) {
            b.x = b.y = - 1000;
            return true;
        }
    }
    return false;
}

const Keyboard = {
    init() {
        document.addEventListener("keydown", e => this.buttons[e.which || e.keyCode] = true, false);
        document.addEventListener("keyup", e => delete this.buttons[e.which || e.keyCode], false);
        this.buttons = {};
    },
    hasKey(code) {
        return !!this.buttons[code];
    },
    onKey(code) {
        let value = !!this.buttons[code];
        delete this.buttons[code];
        return value;
    }
};