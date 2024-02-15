$(function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const WIDTH = 1200;
  const HEIGHT = 830;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const SPEED = 3.5;
  // アイテムブロック
  const ITEM_IMG = 60;
  // 直前までブロックに乗ってた？
  let befoerOnBlock = null;
  const marios = [
    "img/mario-run1-right.png",
    "img/mario-run1-left.png",
    "img/mario-run2-right.png",
    "img/mario-run2-left.png",
    "img/mario-junp-right.png",
    "img/mario-junp-left.png",
    "img/mario-nomal-right.png",
    "img/mario-nomal-left.png",
  ];
  //マリオアニメ 速さ
  let time = 0;
  // 0 右 1 左
  let muki = 0;

  //マリオ
  const IMG_SIZE = 60;
  const mario = new Mario(580, 645, IMG_SIZE);
  mario.image.src = marios[6];
  //マリオ更新後の座標
  let updatedX = mario.x;
  let updatedY = mario.y;

  //アイテムブロック
  //アイテムブロック座標
  let itemblocks = [
    new ItemBlock(300, 450, ITEM_IMG, "./ruby/index.html"),
    new ItemBlock(850, 450, ITEM_IMG, "./java/index.html"),
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

  //ブロック
  let blocks = [
    { x: 0, y: 705, w: 2000, h: 60 },
    { x: 0, y: 765, w: 2000, h: 60 },
  ];

  window.addEventListener("load", update);

  //ジャンプの設定
  //初速度
  let vy = 1;
  //ジャンプしているかどうか
  let isJump = false;

  // キーボードの入力状態を管理
  let input_key = new Array();

  // キーボードの入力
  window.addEventListener("keydown", handleKeydown);
  function handleKeydown(e) {
    input_key[e.keyCode] = true;
  }
  window.addEventListener("keyup", handleKeyup);
  function handleKeyup(e) {
    input_key[e.keyCode] = false;
    if (muki == 0) {
      mario.chenge_img(marios[6]);
    } else if (muki == 1) {
      mario.chenge_img(marios[7]);
    }
  }

  // 描画し続ける
  function update() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    time++;

    collisioned();

    // キー入力
    if (input_key[37]) {
      muki = 1;
      mario.run_img(marios[1], marios[3], 5, time);
      updatedX -= SPEED;
    }
    if (input_key[39]) {
      muki = 0;
      mario.run_img(marios[0], marios[2], 5, time);
      updatedX += SPEED;
    }
    if (input_key[38] && !isJump) {
      vy = -25;
      isJump = true;
    }
    if (isJump) {
      befoerOnBlock = false;
      if (muki == 0) {
        mario.chenge_img(marios[4]);
      } else if (muki == 1) {
        mario.chenge_img(marios[5]);
      }
      updatedY = mario.y + vy;
      vy += 1;
      const blockTargetIsOn = onTheBlock(mario.x, mario.y, updatedX, updatedY);
      if (blockTargetIsOn) {
        isJump = false;
        if (muki == 0) {
          mario.chenge_img(marios[6]);
        } else if (muki == 1) {
          mario.chenge_img(marios[7]);
        }
      }
    }
    const itemOn = onTheItem(mario.x, mario.y, updatedX, updatedY);
    if (!itemOn && befoerOnBlock) {
      isJump = true;
      vy = 3.5;
      befoerOnBlock = null;
    }

    if (itemOn == true) {
      befoerOnBlock = true;
    }

    let blockOn = onTheBlock(mario.x, mario.y, updatedX, updatedY);
    if (blockOn) {
      updatedY = blockOn.y - mario.height;
      isJump = false;
    }
    updatedX += move_x(mario);

    mario.x = updatedX;
    mario.y = updatedY;

    logos.forEach(function (logo) {
      logo.move_logo();
      ctx.drawImage(logo.image, logo.x, logo.y, logo.width, logo.height);
    });
    ctx.drawImage(mario.image, mario.x, mario.y, mario.width, mario.height);
    itemblocks.forEach(function (item) {
      ctx.drawImage(item.image, item.x, item.y, ITEM_IMG, ITEM_IMG);
    });

    ctx.fillStyle = "rgba(255, 255, 255, 0)";
    for (const block of blocks) {
      ctx.fillRect(block.x, block.y, block.w, block.h);
    }
    window.requestAnimationFrame(update);
  }

  // 関数たち-------------------------------------

  // 画像変更

  //衝突
  function collision(obj1, obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.y < obj2.y + obj2.height &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y + obj1.height > obj2.y
    );
  }

  //衝突後の動き
  function check_collision_direction() {
    let result = null;
    let index;
    itemblocks.forEach(function (item, index) {
      if (
        collision(
          // 変数に記録してあるxなどの情報を引数として使う書き方
          {
            x: mario.x,
            y: mario.y,
            width: mario.width,
            height: mario.height,
          },
          { x: item.x, y: item.y, width: item.width, height: item.height }
        )
      ) {
        //--------ここらへんコピペ 悔しい------------------------------------------
        //それぞれの真中の位置を取得
        const marioCenterX = mario.x + IMG_SIZE / 2;
        const marioCenterY = mario.y + IMG_SIZE / 2;
        const itemCenterX = item.x + ITEM_IMG / 2;
        const itemCenterY = item.y + ITEM_IMG / 2;

        // 真ん中の差分を取得
        const dx = marioCenterX - itemCenterX;
        const dy = marioCenterY - itemCenterY;

        const width = (IMG_SIZE + ITEM_IMG) / 2;
        const height = (IMG_SIZE + ITEM_IMG) / 2;

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
  function collisioned() {
    let result = check_collision_direction();

    if (result) {
      if (result.collisionDirection == "left") {
        updatedX = itemblocks[result.index].x - IMG_SIZE;
      } else if (result.collisionDirection == "right") {
        updatedX = itemblocks[result.index].x + ITEM_IMG;
      } else if (result.collisionDirection == "bottom") {
        updatedY = itemblocks[result.index].y + ITEM_IMG;
        vy = 3.5;
        logos[result.index].move_flg = true;
        itemblocks[result.index].chenge_img("img/はてな2.svg");
        logos[result.index].move_flg = true;
        setTimeout(function () {
          window.location.href = itemblocks[result.index].url;
        }, 500);
      } else if (result.collisionDirection == "top") {
        const itemOn = onTheItem(mario.x, mario.y, updatedX, updatedY);
        if (itemOn) {
          updatedY = itemOn.y - mario.height; // マリオのY座標をアイテムブロックの上に合わせる
          isJump = false;
          vy = 0; // Y速度をリセット
          if (!befoerOnBlock) {
            if (muki == 0) {
              mario.chenge_img(marios[6]);
            } else if (muki == 1) {
              mario.chenge_img(marios[7]);
            }
          }
          befoerOnBlock = true;
        }
      }
    }
  }

  //ブロックに乗っているか
  function onTheBlock(x, y, updatedX, updatedY) {
    for (const block of blocks) {
      if (y + IMG_SIZE <= block.y && updatedY + IMG_SIZE >= block.y) {
        if (
          (x + IMG_SIZE <= block.x || x >= block.x + block.y) &&
          (updatedX + IMG_SIZE <= block.x || updatedX >= block.w)
        ) {
          continue;
        }
        return block;
      }
    }
    return null;
  }

  //アイテムに乗っているか
  function onTheItem(x, y, updatedX, updatedY) {
    for (const item of itemblocks) {
      if (
        y + IMG_SIZE <= item.y + item.height &&
        updatedY + IMG_SIZE >= item.y &&
        x + mario.width >= item.x &&
        x <= item.x + item.width
      ) {
        return item;
      }
    }
    return null;
  }

  // ruby java むくむく
  function mukumuku(logo) {
    logo;
  }
  // 端っこ
  function move_x(mario) {
    let updatedX = 0;
    if (mario.x <= 0 - mario.width) {
      updatedX = WIDTH + mario.width;
    } else if (mario.x >= WIDTH + mario.width) {
      // 右の端 + マリオのimgサイズ分、左に移動するようにしているため、右から出てくるときはmario.widthの2倍となる
      updatedX = -(WIDTH + mario.width * 2);
    }
    return updatedX;
  }

  //loding
  function lodingBgImg() {
    const $bg = $(".loding");
    $bg.css({
      display: "none",
    });
  }

  setTimeout(lodingBgImg, 2000);
});
