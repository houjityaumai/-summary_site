$(function () {
  // canvas 2d 設定
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  //クラス設定
  // 設定クラス
  class Setting {
    constructor(width, height, speed, item_block_size) {
      this.width = width;
      this.height = height;
      this.speed = speed;
      this.item_block_size = item_block_size;
      this.gravity = 1;
      this.mario_imgs = [
        "img/mario-run1-right.png",
        "img/mario-run1-left.png",
        "img/mario-run2-right.png",
        "img/mario-run2-left.png",
        "img/mario-junp-right.png",
        "img/mario-junp-left.png",
        "img/mario-nomal-right.png",
        "img/mario-nomal-left.png",
      ];
    }
  }
  //marioクラス
  class Mario {
    constructor(x, y, imagesize) {
      this.x = x;
      this.y = y;
      this.image = new Image();
      this.image.src = set.mario_imgs[6];
      this.height = imagesize;
      this.width = imagesize;
      this.imagesize = imagesize;
      this.time = 0;
      this.muki = 0;
      this.updatedX = x;
      this.updatedY = y;
      this.befoerOnBlock = null;
      this.isJump = false;
    }

    // 画像変更
    chenge_img(img) {
      this.image.src = `${img}`;
    }

    // 走ってる
    run_img(img1, img2, speed, times) {
      if (times % (speed * 2) == 0) {
        this.chenge_img(img1);
      } else if (times % speed == 0) {
        this.chenge_img(img2);
      }
    }

    // アイテムブロックの乗り降り
    get_on_and_off_itemblocks(setting) {
      const itemOn = ItemBlock.onTheItem(
        this.x,
        this.y,
        this.updatedX,
        this.updatedY
      );
      // アイテムに乗っていないかつ、さっきまでアイテムブロックに乗っていた
      if (!itemOn && mario.befoerOnBlock) {
        this.isJump = true;
        setting.gravity = 3.5;
        this.befoerOnBlock = null;
      }
      // アイテムブロックに乗っている
      if (itemOn == true) {
        this.befoerOnBlock = true;
      }
    }

    // ブロックの上に立つ
    stand_on_the_block() {
      let blockOn = Block.onTheBlock(
        this.x,
        this.y,
        this.updatedX,
        this.updatedY
      );
      if (blockOn) {
        this.updatedY = blockOn.y - this.height;
        this.isJump = false;
      }
    }

    // 端っこに行ったら、反対から出てくる
    move_x() {
      // マリオのxが画面左端に行ったら
      if (this.x < 0 - this.width) {
        this.updatedX = set.width + this.width;
        // マリオのxが画面右端に行ったら
      } else if (this.x > set.width + this.width) {
        // 右の端 + マリオのimgサイズ分、左に移動するようにしているため、右から出てくるときはmario.widthの2倍となる
        this.updatedX = -this.width;
      }
    }
  }
  // アイテムブロッククラス
  class ItemBlock {
    constructor(x, y, imagesize, url) {
      this.x = x;
      this.y = y;
      this.width = imagesize;
      this.height = imagesize;
      this.url = url;
      this.image = new Image();
      this.image.src = "img/アイテムブロック.png";
      this.itemblocks = [];
    }

    // 画像変更
    chenge_img(img) {
      this.image.src = `${img}`;
    }
    // アイテムに乗っているか
    static onTheItem(x, y, updatedX, updatedY) {
      for (const item of itemblocks) {
        if (
          y + mario.imagesize <= item.y + item.height &&
          updatedY + mario.imagesize >= item.y &&
          x + mario.width >= item.x &&
          x <= item.x + item.width
        ) {
          return item;
        }
      }
      return null;
    }
  }

  // ロゴクラス
  class Logo {
    constructor(x, y, width, height, img_url) {
      this.image = new Image();
      this.image.src = img_url;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.updatedX = x;
      this.updatedY = y;
      this.move_flg = false;
      this.stop = y - 40;
    }

    move_logo() {
      if (this.move_flg == true) {
        console.log("aaa");
        this.updatedY = this.updatedY - 1.5;
        this.y = this.updatedY;
        // 一定の高さで
        if (this.y < this.stop) {
          this.move_flg = false;
        }
      }
    }
  }
  // キーボード入力クラス;
  class Key {
    constructor() {
      // キーボードの入力状態を管理
      this.input_key = new Array();
      this.handleKeydown = this.handleKeydown.bind(this);
      this.handleKeyup = this.handleKeyup.bind(this);
      window.addEventListener("keydown", this.handleKeydown);
      window.addEventListener("keyup", this.handleKeyup);
    }

    // キーボードの入力
    handleKeydown(e) {
      this.input_key[e.keyCode] = true;
    }

    handleKeyup(e) {
      this.input_key[e.keyCode] = false;
      if (mario.muki == 0) {
        mario.chenge_img(set.mario_imgs[6]);
      } else if (mario.muki == 1) {
        mario.chenge_img(set.mario_imgs[7]);
      }
    }

    andleInputKey() {
      // キー入力
      if (this.input_key[37]) {
        mario.muki = 1;
        mario.run_img(set.mario_imgs[1], set.mario_imgs[3], 5, mario.time);
        mario.updatedX -= set.speed;
      }
      if (this.input_key[39]) {
        mario.muki = 0;
        mario.run_img(set.mario_imgs[0], set.mario_imgs[2], 5, mario.time);
        mario.updatedX += set.speed;
      }
      if (this.input_key[38] && !mario.isJump) {
        set.gravity = -25;
        mario.isJump = true;
      }
      if (mario.isJump) {
        mario.befoerOnBlock = false;
        if (mario.muki == 0) {
          mario.chenge_img(set.mario_imgs[4]);
        } else if (mario.muki == 1) {
          mario.chenge_img(set.mario_imgs[5]);
        }
        mario.updatedY = mario.y + set.gravity;
        set.gravity += 1;
        const blockTargetIsOn = Block.onTheBlock(
          mario.x,
          mario.y,
          mario.updatedX,
          mario.updatedY
        );
        if (blockTargetIsOn) {
          mario.isJump = false;
          if (mario.muki == 0) {
            mario.chenge_img(set.mario_imgs[6]);
          } else if (mario.muki == 1) {
            mario.chenge_img(set.mario_imgs[7]);
          }
        }
      }
    }
  }

  // ブロッククラス
  class Block {
    static blocks = [
      { x: 0, y: 705, w: 2000, h: 60 },
      { x: 0, y: 765, w: 2000, h: 60 },
    ];

    // ブロックに乗っているか
    static onTheBlock(x, y, updatedX, updatedY) {
      for (const b of Block.blocks) {
        if (y + mario.imagesize <= b.y && updatedY + mario.imagesize >= b.y) {
          if (
            (x + mario.imagesize <= b.x || x >= b.x + b.y) &&
            (updatedX + mario.imagesize <= b.x || updatedX >= b.w)
          ) {
            continue;
          }
          return b;
        }
      }
      return null;
    }
  }

  // 衝突クラス
  class Collision {
    //衝突
    collision(obj1, obj2) {
      return (
        obj1.x < obj2.x + obj2.width &&
        obj1.y < obj2.y + obj2.height &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y + obj1.height > obj2.y
      );
    }

    //衝突後の動き(当たったアイテムの当たった部分と添え字を返す)
    check_collision_direction(itemblocks) {
      let result = null;
      itemblocks.forEach((item, index) => {
        if (this.collision(mario, item)) {
          //--------ここらへんコピペ 悔しい------------------------------------------
          //それぞれの真中の位置を取得
          const marioCenterX = mario.x + mario.imagesize / 2;
          const marioCenterY = mario.y + mario.imagesize / 2;
          const itemCenterX = item.x + set.item_block_size / 2;
          const itemCenterY = item.y + set.item_block_size / 2;

          // 真ん中の差分を取得
          const dx = marioCenterX - itemCenterX;
          const dy = marioCenterY - itemCenterY;

          const width = (mario.imagesize + set.item_block_size) / 2;
          const height = (mario.imagesize + set.item_block_size) / 2;

          const crossWidth = width * dy;
          const crossHeight = height * dx;

          let collisionDirection = null;

          if (crossWidth > crossHeight) {
            collisionDirection = crossWidth > -crossHeight ? "bottom" : "left";
          } else {
            collisionDirection = crossWidth > -crossHeight ? "right" : "top";
          }

          result = { collisionDirection: collisionDirection, index: index };
          //-----------------------------------------------------------------------
        }
      });
      return result;
    }

    // 当たったあと、どうなるか
    collisioned(itemblocks, mario) {
      let result = this.check_collision_direction(itemblocks, mario);

      if (result) {
        if (result.collisionDirection == "left") {
          mario.updatedX = itemblocks[result.index].x - mario.imagesize;
        } else if (result.collisionDirection == "right") {
          mario.updatedX = itemblocks[result.index].x + set.item_block_size;
        } else if (result.collisionDirection == "bottom") {
          mario.updatedY = itemblocks[result.index].y + set.item_block_size;
          set.gravity = 3.5;
          logos[result.index].move_flg = true;
          itemblocks[result.index].chenge_img("img/はてな2.svg");
          logos[result.index].move_flg = true;
          setTimeout(function () {
            window.location.href = itemblocks[result.index].url;
          }, 1000);
        } else if (result.collisionDirection == "top") {
          const itemOn = ItemBlock.onTheItem(
            mario.x,
            mario.y,
            mario.updatedX,
            mario.updatedY
          );
          if (itemOn) {
            mario.updatedY = itemOn.y - mario.height; // マリオのY座標をアイテムブロックの上に合わせる
            mario.isJump = false;
            set.gravity = 0; // Y速度をリセット
            if (!mario.befoerOnBlock) {
              if (mario.muki == 0) {
                mario.chenge_img(set.mario_imgs[6]);
              } else if (mario.muki == 1) {
                mario.chenge_img(set.mario_imgs[7]);
              }
            }
            mario.befoerOnBlock = true;
          }
        }
      }
    }
  }

  // 設定
  // 衝突インスタンス生成
  const collision = new Collision();
  // セッティングクラス生成
  const set = new Setting(1200, 830, 3.5, 60);
  // キャンバスの大きさを設定
  canvas.width = set.width;
  canvas.height = set.height;

  //マリオ
  const mario = new Mario(580, 645, 60);

  // 地面ブロック
  const block = new Block();
  //アイテムブロック
  const itemblocks = [
    new ItemBlock(300, 450, set.item_block_size, "./ruby/index.html"),
    new ItemBlock(850, 450, set.item_block_size, "./java/index.html"),
  ];

  // logo
  let logos = [
    new Logo(
      itemblocks[0].x - 30,
      itemblocks[0].y,
      120,
      50,
      "img/ruby_logo.png"
    ),
    new Logo(
      itemblocks[1].x - 30,
      itemblocks[1].y,
      120,
      50,
      "img/java_logo.png"
    ),
  ];

  // キー入力クラス生成
  const key = new Key();

  window.addEventListener("load", update);

  // 描画し続ける
  function update() {
    // 毎度画面をリセット やらないとマリオの軌跡がずっと描画されてる
    ctx.clearRect(0, 0, set.width, set.height);
    // アニメの速さ調整のため
    mario.time++;
    // キーボード入力
    key.andleInputKey();

    // アイテムブロックとマリオが当たったとき
    collision.collisioned(itemblocks, mario);

    // アイテムブロックの上に立っているかどうか
    mario.get_on_and_off_itemblocks(set);
    // ブロックの上に立っているかどうか
    mario.stand_on_the_block();
    // 端っこ行ったら反対側からでる
    mario.move_x();
    // マリオxy更新
    mario.x = mario.updatedX;
    mario.y = mario.updatedY;

    // ロゴ(ruby,java)描画
    logos.forEach(function (logo) {
      logo.move_logo();
      ctx.drawImage(logo.image, logo.x, logo.y, logo.width, logo.height);
    });
    // マリオ描画
    ctx.drawImage(mario.image, mario.x, mario.y, mario.width, mario.height);
    // アイテムボックス描画
    itemblocks.forEach(function (item) {
      ctx.drawImage(
        item.image,
        item.x,
        item.y,
        set.item_block_size,
        set.item_block_size
      );
    });

    // 地面描画
    ctx.fillStyle = "rgba(255, 255, 255, 0)";
    for (const b of Block.blocks) {
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }
    // updateを何度も繰り返す
    window.requestAnimationFrame(update);
  }

  // 端っこ

  //loding画面
  function lodingBgImg() {
    const $bg = $(".loding");
    $bg.css({
      display: "none",
    });
  }

  setTimeout(lodingBgImg, 2000);
});
