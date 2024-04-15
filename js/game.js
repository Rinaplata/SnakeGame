var config = {
    type: Phaser.WEBGL,
    width: 960,
    height: 640,   
    backgroundColor: '#ffffff',
    borderColor: '#3B3C3C',
    parent: 'phaser-example',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// global variables
var food;
var snake;
var cursors;
var total = 0;
var totalText;
var timer;
var tiempoTranscurrido = 0;
var velocidadInicial = 150;
var velocidadActual = velocidadInicial;


//address
var UP = 0;
var DOWN = 1;
var LEFT = 2;
var RIGHT = 3;

//Create a game
var game = new Phaser.Game(config);

function preload() {
    this.load.image('food', 'imagenes/food.png');
    this.load.image('body', 'imagenes/body.png');
}

function create() {
    var Food = new Phaser.Class({
        Extends: Phaser.GameObjects.Image,
        initialize:
            function Food(scene, x, y) {
                Phaser.GameObjects.Image.call(this, scene);

                this.setTexture('food');
                this.setPosition(x * 16, y * 16);
                this.setOrigin(0);

                scene.children.add(this);
            },
        eat: function () {
            var testGrid = [];
            for (var y = 0; y < 30; y++) {
                testGrid[y] = [];
                for (var x = 0; x < 40; x++) {
                    testGrid[y][x] = true;
                }
            }
            snake.updateGrid(testGrid);

            validLocations = [];
            for (var y = 0; y < 30; y++) {
                for (var x = 0; x < 40; x++) {
                    if (testGrid[y][x] === true) {
                        validLocations.push({ x: x, y: y });
                    }
                }
            }

            if (validLocations.length > 0) {
                var pos = Phaser.Math.RND.pick(validLocations);
                food.setPosition(pos.x * 16, pos.y * 16);
            }
        }
    })

    var Snake = new Phaser.Class({
        initialize:
            function Snake(scene, x, y) {
                this.headPosition = new Phaser.Geom.Point(x, y);
                this.body = scene.add.group();

                this.head = this.body.create(x * 16, y * 16, 'body')
                this.head.setOrigin(0);

                this.alive = true;

                this.heading = RIGHT;
                this.direction = RIGHT;

                this.speed = 150;
                this.moveTime = 0;

                this.tail = new Phaser.Geom.Point(x, y);


            },

        collideWithFood: function (foodX, foodY) {
            if (this.head.x === foodX && this.head.y === foodY) {
                this.grow();
                food.eat();
                total++;
                if (this.speed > 20 && total % 5 === 0) {
                    this.speed -= 5
                }


                return true;
            } else {
                return false;
            }
        },

        updateGrid: function (grid) {
            this.body.children.each(function (segment) {
                var bx = segment.x / 16;
                var  by = segment.y / 16;

                grid[by][bx] = false;
            });
            return grid;
        },

        grow: function () {
            var newPart = this.body.create(this.tail.x, this.tail.y, 'body');
            newPart.setOrigin(0);
        },

        update: function (time) {
            if (time >= this.moveTime) {
                return this.move(time);
            }
        },

        faceLeft: function () {
            if (this.direction === UP || this.direction === DOWN) {
                this.heading = RIGHT; 
            }
        },
    
        faceRight: function () {
            if (this.direction === UP || this.direction === DOWN) {
                this.heading = LEFT; 
            }
        },

        faceUp: function () {
            if (this.direction === LEFT || this.direction === RIGHT) {
                this.heading = DOWN; 
            }
        },
    
        faceDown: function () {
            if (this.direction === LEFT || this.direction === RIGHT) {
                this.heading = UP;
            }
        },


        move: function (time) {
            switch (this.heading) {
                case LEFT:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x - 1, 0, 40);
                    break;
                case RIGHT:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x + 1, 0, 40);
                    break;
                case UP:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y - 1, 0, 30);
                    break;
                case DOWN:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y + 1, 0, 30);
                    break;
            }

            this.direction = this.heading;

            Phaser.Actions.ShiftPosition(this.body.getChildren(), this.headPosition.x * 16, this.headPosition.y * 16, 1, this.tail)

            var hitbody = Phaser.Actions.GetFirst(this.body.getChildren(), {x:this.head.x, y:this.head.y},1)
            if(hitbody){
                this.alive = false;
                return false;
            }else{
                this.moveTime = time + this.speed;
                return true;
            }

            
        }
    })

    food = new Food(this, 3, 4);
    snake = new Snake(this, 8, 6);
    cursors = this.input.keyboard.createCursorKeys();
    totalText = this.add.text(config.width / 2, 8, 'Puntos: 0', { fontSize: '24px', fill: '#3B3C3C' });
    tiempoText = this.add.text(config.width - 10, config.height - 10, 'Tiempo: 0', { fontSize: '24px', fill: '#3B3C3C' });
    totalText.setOrigin(0.5, 0);
    tiempoText.setOrigin(1, 1);

    
}

function update(time, delta) {
    if(!snake.alive){
        return;
    }

    if (cursors.left.isDown) {
        snake.faceLeft();
    }
    else if (cursors.right.isDown) {
        snake.faceRight();
    }
    else if (cursors.up.isDown) {
        snake.faceUp();
    }
    else if (cursors.down.isDown) {
        snake.faceDown();
    }

    tiempoTranscurrido += delta / 1000;

    if (snake.update(time)) {
        if (snake.collideWithFood(food.x, food.y)) {
            totalText.setText(`Puntos: ${total}`);
        }

        tiempoText.setText(`Tiempo: ${Math.round(tiempoTranscurrido)}`);

        if (Math.round(tiempoTranscurrido) > 1 && Math.round(tiempoTranscurrido) % 20 == 0) {
            reducirVelocidad();
        }
    }
}

function reducirVelocidad() {
    this.snake.speed += 10;
}