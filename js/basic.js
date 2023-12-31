let game; 

const gameOption = {
    monkeySpeed: 300,
    monkeyGravity: 1000
   }

   let score = 0;
   let health = 3;

window.onload = function(){
    let gameConfig = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1600,
            height: 1000,

        },
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity:{
                    y: 0 
                }
            }
        },
        scene: [PlayGame, Scene2, EndMenu],
        backgroundMusic: null,
    },
    game = new Phaser.Game(gameConfig)
    window.focus();
}



class PlayGame extends Phaser.Scene {

    constructor() {
        super("PlayGame")
    }

    preload(){
        this.load.image("ground", "assets/world/Tiles/png/128x128/Grass.png");
        this.load.image("monkey", "assets/player.png");
        this.load.image("background", "assets/world/Background/png/1920x1080/All/Sky.png")
        this.load.image("banana", "assets/items/banana.png");
        this.load.image("pear", "assets/items/pear.png");
        this.load.image("orange", "assets/items/orange.png");
        this.load.image("robot", "assets/robot.png");
        this.load.image("bullet", "assets/items/ninja_star.png");
        this.load.image('portal', 'assets/world/portal.png');
        this.load.audio('coin', "assets/sound_effects/coin.mp3");
        this.load.audio('jump', "assets/sound_effects/jump.mp3");
        this.load.audio('shoot', "assets/sound_effects/shoot.mp3");
        this.load.audio('soundtrack', "assets/sound_effects/soundtrack.mp3");
        this.load.audio('teleport', "assets/sound_effects/teleport.mp3");
    }

    create(){
        this.game.config.backgroundMusic = this.sound.add("soundtrack", { loop: true });
        this.game.config.backgroundMusic.play();

        this.coin_sound = this.sound.add('coin');
        this.jump_sound = this.sound.add('jump');
        this.shoot_sound = this.sound.add('shoot');
        this.teleport_sound = this.sound.add('teleport');

        this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);

        this.scoreText = this.add.text(8, 3, "Score:", {fontSize: "50px", fill: "#ffffff"})
        this.scoreTextPoints = this.add.text(185, 8, "0", {fontSize: "50px", fill: "#ffffff"})
        
        this.HealthText = this.add.text(8, 60, "Health:", {fontSize: "50px", fill: "#ffffff"})
        this.HealthTextPoints = this.add.text(214, 62, "3", {fontSize: "50px", fill: "#ffffff"})
        
        this.restartText = this.add.text(1380, 3,"Restart",{fontSize: '50px', fill: '#ffffff'})
        this.restartText.setInteractive();
        this.restartText.on('pointerdown', () => {
            this.scene.restart();
            this.game.config.backgroundMusic.stop();
            this.game.config.backgroundMusic.destroy();
        });

        this.portal = this.physics.add.image(1550, 840, 'portal').setScale(5);

        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false,
        })

        this.moveableGroundGroupX = this.physics.add.group({
            immovable: true,
            allowGravity: false,
        })
     
        this.groundGroup.create(60, 970, 'ground');
        this.groundGroup.create(180, 970, 'ground');
        this.groundGroup.create(300, 970, 'ground');
        this.groundGroup.create(420, 970, 'ground');
        this.groundGroup.create(540, 970, 'ground');
        this.groundGroup.create(660, 970, 'ground');
        this.groundGroup.create(1422, 970, 'ground');
        this.groundGroup.create(1550, 970, 'ground');
        
        for (let i = 0; i < 2; i++) {
            const movingGround = this.moveableGroundGroupX.create(900 + i * 100, 970, 'ground'); 
            movingGround.setVelocityX(100); 
        }

        this.monkey = this.physics.add.sprite(50, 870, 'monkey').setScale(0.2);
        this.monkey.body.setCollideWorldBounds(true);
        this.monkey.body.gravity.y = gameOption.monkeyGravity;
        this.physics.add.collider(this.monkey, this.groundGroup);
        this.physics.add.collider(this.monkey, this.moveableGroundGroupX);
        this.monkey.setSize(250, 200, true);

        this.fruitGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })

        this.fruitGroup.create(650, 890, 'orange').setScale(0.4)
        this.fruitGroup.create(840, 890, 'pear').setScale(0.4)
        this.fruitGroup.create(1000, 890, 'pear').setScale(0.4)
        this.fruitGroup.create(1180, 890, 'pear').setScale(0.4)

        this.bulletGroup = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 1
        })

        this.enemyGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })

        this.enemyGroup.create(390, 835, 'robot').setScale(0.30).setFlipX(true);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.overlap(this.monkey, this.fruitGroup, this.collectFruit, null, this);
        this.physics.add.overlap(this.monkey, this.portal, this.teleportPlayer, null, this);
        this.physics.add.overlap(this.monkey, this.enemyGroup, this.damageMonkey, null, this);
        this.physics.add.overlap(this.enemyGroup, this.bulletGroup, this.killEnemy, null, this);

}

    collectFruit(monkey, fruit) {
        fruit.disableBody(true, true);
        this.coin_sound.play();
        if(fruit.texture.key === "pear"){
            score += 1;
            this.scoreTextPoints.setText(score);
        }
        if(fruit.texture.key === "orange"){
            score += 5;
            this.scoreTextPoints.setText(score);
        }
        if(fruit.texture.key === "banana"){
            score += 10;
            this.scoreTextPoints.setText(score);
        }
    }

    shootBullet() {
            this.shoot_sound.play();
            this.bulletGroup.get(this.monkey.x, this.monkey.y);
            this.bulletGroup.setActive(true);
            this.bulletGroup.setVisible(true);
            this.bulletGroup.setVelocityX(1000);
    }

    killEnemy(enemy, bullet){
        enemy.destroy();
        bullet.destroy();
    }

    damageMonkey(monkey, enemy){
        health -= 1;
        this.HealthTextPoints.setText(health)

        this.initialPosition = this.monkey.x;
        this.monkey.x = this.initialPosition - 50;
    }

    teleportPlayer() {
        this.teleport_sound.play();
        this.scene.start('Scene2');
    }

    update() {

        if(this.cursors.left.isDown){
            this.monkey.body.velocity.x = -gameOption.monkeySpeed;
        }
        else if(this.cursors.right.isDown){
            this.monkey.body.velocity.x = gameOption.monkeySpeed;
            this.monkey.flipX = true;
        }
        else if(this.input.activePointer.isDown && this.input.activePointer.leftButtonDown()){
            this.shootBullet();
        }
        else{
            this.monkey.body.velocity.x = 0;
        }

        if (this.cursors.up.isDown && this.monkey.body.touching.down) {
            this.monkey.body.velocity.y = -gameOption.monkeyGravity / 2.5;
            this.jump_sound.play();
        }

        if(health <= 0){
            this.scene.restart();
            this.game.config.backgroundMusic.stop();
            this.game.config.backgroundMusic.destroy();
            health = 3;
        }

        this.bulletGroup.children.iterate(bullet => {
            if (bullet.x < 0 || bullet.x > this.game.config.width) {
                bullet.destroy(); 
            }
        });

        this.moveableGroundGroupX.getChildren().forEach(movingGround => {
            if (movingGround.x >= 1200) {
                movingGround.setVelocityX(-100);
            } else if (movingGround.x <= 840) {
                movingGround.setVelocityX(100);
            }
        });
    }
}



class Scene2 extends Phaser.Scene {
    constructor() {
      super('Scene2');
    }

    preload(){
        this.load.image("ground", "assets/world/Tiles/png/128x128/Grass.png");
        this.load.image("monkey", "assets/player.png");
        this.load.image("background", "assets/world/Background/png/1920x1080/All/Sky.png")
        this.load.image("banana", "assets/items/banana.png");
        this.load.image("pear", "assets/items/pear.png");
        this.load.image("orange", "assets/items/orange.png");
        this.load.image("bomb", "assets/items/bomb.png");
        this.load.image("bullet", "assets/items/ninja_star.png");
        this.load.image('portal', 'assets/world/portal.png');
        this.load.audio('coin', "assets/sound_effects/coin.mp3");
        this.load.audio('jump', "assets/sound_effects/jump.mp3");
        this.load.audio('shoot', "assets/sound_effects/shoot.mp3");
        this.load.audio('soundtrack', "assets/sound_effects/soundtrack.mp3");
        this.load.audio('teleport', "assets/sound_effects/teleport.mp3");
    }
  
    create() {
       
        this.coin_sound = this.sound.add('coin');
        this.jump_sound = this.sound.add('jump');
        this.shoot_sound = this.sound.add('shoot');
        this.teleport_sound = this.sound.add('teleport');

        this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);

        this.scoreText = this.add.text(8, 3, "Score:", {fontSize: "50px", fill: "#ffffff"})
        this.scoreTextPoints = this.add.text(185, 8, "0", {fontSize: "50px", fill: "#ffffff"})
        
        this.HealthText = this.add.text(8, 60, "Health:", {fontSize: "50px", fill: "#ffffff"})
        this.HealthTextPoints = this.add.text(214, 62, "3", {fontSize: "50px", fill: "#ffffff"})
        
        this.restartText = this.add.text(1380, 3,"Restart",{fontSize: '50px', fill: '#ffffff'})
        this.restartText.setInteractive();
        this.restartText.on('pointerdown', () => {this.scene.restart()});

        this.portal = this.physics.add.image(1550, 840, 'portal').setScale(5);

        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false,
        })

        this.moveableGroundGroupX = this.physics.add.group({
            immovable: true,
            allowGravity: false,
        })

        this.moveableGroundGroupY = this.physics.add.group({
            immovable: true,
            allowGravity: false,
        })
     
        this.groundGroup.create(60, 970, 'ground');
        this.groundGroup.create(1550, 970, 'ground');
        this.groundGroup.create(620, 600, 'ground');
        this.groundGroup.create(749, 600, 'ground');
        this.groundGroup.create(620, 300, 'ground');
        this.groundGroup.create(749, 300, 'ground');

        
        for (let i = 0; i < 2; i++) {
            const movingGround = this.moveableGroundGroupY.create(300 + i * 100, 970, 'ground'); 
            movingGround.setVelocityY(100); 
        }
        
        for (let i = 0; i < 2; i++) {
            const movingGround = this.moveableGroundGroupX.create(900 + i * 100, 300, 'ground'); 
            movingGround.setVelocityX(100); 
        }

        this.monkey = this.physics.add.sprite(50, 870, 'monkey').setScale(0.2);
        this.monkey.body.setCollideWorldBounds(true);
        this.monkey.body.gravity.y = gameOption.monkeyGravity;
        this.physics.add.collider(this.monkey, this.groundGroup);
        this.physics.add.collider(this.monkey, this.moveableGroundGroupX);
        this.physics.add.collider(this.monkey, this.moveableGroundGroupY);
        this.monkey.setSize(250, 200, true);

        this.fruitGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })

        this.fruitGroup.create(750, 520, 'banana').setScale(0.4)
        this.fruitGroup.create(750, 220, 'orange').setScale(0.4)
        this.fruitGroup.create(340, 820, 'pear').setScale(0.4)
        this.fruitGroup.create(340, 620, 'pear').setScale(0.4)
        this.fruitGroup.create(340, 420, 'pear').setScale(0.4)
        this.fruitGroup.create(340, 220, 'pear').setScale(0.4)

        this.bulletGroup = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 1
        })

        this.enemyGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })

        this.enemyGroup.create(620, 480, 'robot').setScale(0.30).setFlipX(true);
        this.enemyGroup.create(620, 180, 'robot').setScale(0.30).setFlipX(true);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.overlap(this.monkey, this.fruitGroup, this.collectFruit, null, this);
        this.physics.add.overlap(this.monkey, this.portal, this.teleportPlayer, null, this);
        this.physics.add.overlap(this.enemyGroup, this.bulletGroup, this.killEnemy, null, this);
        this.physics.add.overlap(this.monkey, this.enemyGroup, this.damageMonkey, null, this);
        
}

    collectFruit(monkey, fruit) {
        fruit.disableBody(true, true);
        this.coin_sound.play();
        if(fruit.texture.key === "pear"){
            score += 1;
            this.scoreTextPoints.setText(score);
        }
        if(fruit.texture.key === "orange"){
            score += 5;
            this.scoreTextPoints.setText(score);
        }
        if(fruit.texture.key === "banana"){
            score += 10;
            this.scoreTextPoints.setText(score);
        }
    }

    shootBullet() {
            this.shoot_sound.play();
            this.bulletGroup.get(this.monkey.x, this.monkey.y);
            this.bulletGroup.setActive(true);
            this.bulletGroup.setVisible(true);
            this.bulletGroup.setVelocityX(1000);
    }

    killEnemy(enemy, bullet){
        enemy.destroy();
        bullet.destroy();
    }

    damageMonkey(monkey, enemy){
        health -= 1;
        this.HealthTextPoints.setText(health);

        this.initialPosition = this.monkey.x;
        this.monkey.x = this.initialPosition - 50;
    }

    teleportPlayer() {
        this.teleport_sound.play();
        this.scene.start('EndMenu');
        
    }

    update() {

        if(this.cursors.left.isDown){
            this.monkey.body.velocity.x = -gameOption.monkeySpeed;
        }
        else if(this.cursors.right.isDown){
            this.monkey.body.velocity.x = gameOption.monkeySpeed;
            this.monkey.flipX = true;
        }
        else if(this.input.activePointer.isDown && this.input.activePointer.leftButtonDown()){
            this.shootBullet();
        }
        else{
            this.monkey.body.velocity.x = 0;
        }

        if (this.cursors.up.isDown && this.monkey.body.touching.down) {
            this.monkey.body.velocity.y = -gameOption.monkeyGravity / 2.5;
            this.jump_sound.play();
        }

        if(health <= 0){
            this.scene.restart();
            health =  3;
        }

        this.bulletGroup.children.iterate(bullet => {
            if (bullet.x < 0 || bullet.x > this.game.config.width) {
                bullet.destroy(); 
            }
        });

        this.moveableGroundGroupX.getChildren().forEach(movingGround => {
            if (movingGround.x >= 1200) {
                movingGround.setVelocityX(-100);
            } else if (movingGround.x <= 940) {
                movingGround.setVelocityX(100);
            }
        });

        this.moveableGroundGroupY.getChildren().forEach(movingGround => {
            if (movingGround.y >= 970) {
                movingGround.setVelocityY(-100);
            } else if (movingGround.y <= 300) {
                movingGround.setVelocityY(100);
            }
        });
    }

  }


class EndMenu extends Phaser.Scene {
    constructor() {
        super("EndMenu");
    }

    create(){
        this.game.config.backgroundMusic.stop();
        this.game.config.backgroundMusic.destroy();
        
        this.scoreText = this.add.text(650, 20, "Game over", {fontSize: "60px", fill: "#ffffff"})
        this.scoreText = this.add.text(740, 100, "Score:", {fontSize: "50px", fill: "#ffffff"})
        this.scoreText = this.add.text(780, 170, score, {fontSize: "50px", fill: "#ffffff"})

        this.restartText = this.add.text(650, 420,"Play again",{fontSize: '50px', fill: '#ffffff'})
        this.restartText.setInteractive();
        this.restartText.on('pointerdown', () => {
        this.scene.start('PlayGame')
        score = 0;
    });
    }

}
