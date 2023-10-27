let game; 

const gameOption = {
    monkeySpeed: 300,
    monkeyGravity: 1000
   }

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
    },
    game = new Phaser.Game(gameConfig)
    window.focus();
}



class PlayGame extends Phaser.Scene {

    constructor() {
        super("PlayGame")
        this.score = 0;
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

    create(){
        // this.backgroundMusic = this.sound.add("soundtrack", {loop: true}); NEED THIS
        // this.backgroundMusic.play();

        this.coin_sound = this.sound.add('coin');
        this.jump_sound = this.sound.add('jump');
        this.shoot_sound = this.sound.add('shoot');
        this.teleport_sound = this.sound.add('teleport');

        this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);

        this.scoreText = this.add.text(8, 3, "0", {fontSize: "50px", fill: "#ffffff"})

        // this.portal = this.physics.add.image(400, 840, 'portal').setScale(5);
        // this.portal.setOrigin(0.5, 0.5);
        // this.physics.add.existing(this.portal);

        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false,
        })

        this.moveableGroundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false,
        })

       

        this.groundGroup.create(60, 970, 'ground');
        this.groundGroup.create(180, 970, 'ground');
        this.groundGroup.create(300, 970, 'ground');
        this.groundGroup.create(420, 970, 'ground');
        this.groundGroup.create(540, 970, 'ground');
        this.groundGroup.create(660, 970, 'ground');
        this.groundGroup.create(780, 970, 'ground');

        for (let i = 0; i < 3; i++) {
            const movingPlatform = this.moveableGroundGroup.create(900 + i * 100, 970, 'ground'); 
            movingPlatform.setVelocityX(100); 
        }

        this.monkey = this.physics.add.sprite(50, 870, 'monkey').setScale(0.2);
        this.monkey.body.setCollideWorldBounds(true);
        this.monkey.body.gravity.y = gameOption.monkeyGravity;
        this.physics.add.collider(this.monkey, this.groundGroup);
        this.physics.add.collider(this.monkey, this.moveableGroundGroup);
        this.monkey.setSize(250, 200, true);

        this.fruitGroup = this.physics.add.group({})

        this.bulletGroup = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 1
        })

        // this.physics.add.overlap(this.bombGroup, this.bulletGroup, this.defuseBomb, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.overlap(this.monkey, this.fruitGroup, this.collectFruit, null, this);
        this.physics.add.overlap(this.groundGroup, this.bombGroup, this.explodeBomb, null, this);
        this.physics.add.overlap(this.monkey, this.portal, this.teleportPlayer, null, this);
        
}

    collectFruit(monkey, fruit) {
        fruit.disableBody(true, true);
        this.coin_sound.play();
        if(fruit.texture.key === "pear"){
            this.score += 1;
            this.scoreText.setText(this.score);
        }
        if(fruit.texture.key === "orange"){
            this.score += 5;
            this.scoreText.setText(this.score);
        }
        if(fruit.texture.key === "banana"){
            this.score += 10;
            this.scoreText.setText(this.score);
        }
    }

    shootBullet() {
            this.shoot_sound.play();
            this.bulletGroup.get(this.monkey.x, this.monkey.y);
            this.bulletGroup.setActive(true);
            this.bulletGroup.setVisible(true);
            this.bulletGroup.setVelocityX(600);
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

        this.bulletGroup.children.iterate(bullet => {
            if (bullet.x < 0 || bullet.x > this.game.config.width) {
                bullet.destroy(); 
            }
        });

        this.moveableGroundGroup.getChildren().forEach(movingPlatform => {
            if (movingPlatform.x >= 1600) {
                movingPlatform.setVelocityX(-100);
            } else if (movingPlatform.x <= 900) {
                movingPlatform.setVelocityX(100);
            }
        });
    }

    gameOver() {
        this.scene.start("EndMenu", { score: this.score });
    }

}



class Scene2 extends Phaser.Scene {
    constructor() {
      super('Scene2');
      this.monkeySpeed = 300
      this. monkeyGravity = 1000
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
        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false,
        })

        this.scoreText = this.add.text(8, 3, "0", {fontSize: "50px", fill: "#ffffff"})

        this.portal = this.physics.add.image(1550, 840, 'portal').setScale(5);
        this.portal.setOrigin(0.5, 0.5);
        this.physics.add.existing(this.portal);

        this.groundGroup.create(60, 970, 'ground');
        this.groundGroup.create(180, 970, 'ground');
        

        this.monkey = this.physics.add.sprite(50, 870, 'monkey').setScale(0.2);
        this.monkey.body.setCollideWorldBounds(true);
        this.monkey.body.gravity.y = gameOption.monkeyGravity;
        this.physics.add.collider(this.monkey, this.groundGroup);
        this.monkey.setSize(250, 200, true);

        this.fruitGroup = this.physics.add.group({})

        this.bulletGroup = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 1
        })

        // this.physics.add.overlap(this.bombGroup, this.bulletGroup, this.defuseBomb, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.overlap(this.monkey, this.fruitGroup, this.collectFruit, null, this);
        this.physics.add.overlap(this.groundGroup, this.bombGroup, this.explodeBomb, null, this);
        this.physics.add.overlap(this.monkey, this.portal, this.teleportPlayer, null, this);

      this.visible = true;
    }

    collectFruit(monkey, fruit) {
        fruit.disableBody(true, true);
        this.coin_sound.play();
        if(fruit.texture.key === "pear"){
            this.score += 1;
            this.scoreText.setText(this.score);
        }
        if(fruit.texture.key === "orange"){
            this.score += 5;
            this.scoreText.setText(this.score);
        }
        if(fruit.texture.key === "banana"){
            this.score += 10;
            this.scoreText.setText(this.score);
        }
    }

    shootBullet() {
            this.shoot_sound.play();
            this.bulletGroup.get(this.monkey.x, this.monkey.y);
            this.bulletGroup.setActive(true);
            this.bulletGroup.setVisible(true);
            this.bulletGroup.setVelocityY(-600);
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

        this.bulletGroup.children.iterate(bullet => {
            if (bullet.y < 0 || bullet.y > this.game.config.height) {
                bullet.destroy(); 
            }
        });
    }
  }


class EndMenu extends Phaser.Scene {
    constructor() {
        super("EndMenu");
    }

    create(data) {
        const score = data.score;
        const endText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, `Game Over\nScore: ${score}`, {
            fontSize: "32px",
            fill: "#ffffff",
        });

        this.input.keyboard.on("keydown-SPACE", () => {
            this.scene.start("PlayGame");
        });
    }

}

