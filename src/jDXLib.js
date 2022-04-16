/**
 * Copyright (c) 2022 Akira Ikeda (Kamigoe)
 * This software is released under the MIT License, see LICENSE.
 * jDXLib ver.0.1.0b
 */

const TRUE = 1;
const FALSE = 0;

/** 
 * ライブラリで使用する定数類
 * @readonly
 * @enum {Number}
 */
const jDXC = {
  // 描画先画面指定用定義
  /** 表ページ */     jDX_SCREEN_BACK:        0xfffffffe,
  /** 裏ページ */     jDX_SCREEN_FRONT:       0xfffffffc,

  // 描画ブレンドモード定義
  /** ノーブレンド */ jDX_BLENDMODE_NOBLEND:  0,
  /** αブレンド */    jDX_BLENDMODE_ALPHA:    1,
}
Object.freeze(jDXC);

/** ライブラリ本体 */
const jDX = (() => {
  const graphics = {}; // 画像やスクリーンなどのバッファ

  let grCount = 0; // 読み込んだ画像やスクリーンの数
  let backCanvas = null;// 裏画面
  let backContext = null;// 裏画面
  let mainCanvas = null;// 表画面
  let mainContext = null;// 表画面
  let currentCanvas = null;// 描画対象画面
  let currentContext = null;// 描画対象画面
  let currentDrawMode = jDXC.jDX_BLENDMODE_NOBLEND; // 現在のブレンドモード
  let currentDrawPal = 255; // 現在のブレンドモードパラメータ

  // ライブラリ内で使用する便利関数形 ////////////////////////////////////////////////////
  const clamp = (min, max, val) => Math.max(min, Math.min(max, val));

  // 使用必須関数 ///////////////////////////////////////////////////////////////////////
  // ウエイト関係の関数 /////////////////////////////////////////////////////////////////
  /** 
   * ライブラリの初期化
   * @return 成功: 0 / 失敗: -1
   */
  const Lib_Init = () => {
    try {
      backCanvas = document.createElement("canvas");
      backContext = backCanvas.getContext("2d");
      mainCanvas = document.getElementById("mainCanvas");
      mainContext = backCanvas.getContext("2d");
      backCanvas.width = 640;
      backCanvas.height = 480;
      mainCanvas.width = 640;
      mainCanvas.height = 480;
      currentCanvas = mainCanvas;
      currentContext = mainContext;
      return 0;
    } catch(e) {
      return -1;
    }
  };

  // グラフィックデータ制御関数 //////////////////////////////////////////////////////////
  /**
   * グラフィックの拡大縮小描画
   * @param {Number} x1 矩形左上頂点座標
   * @param {Number} y1 矩形左上頂点座標
   * @param {Number} x2 矩形右下頂点座標
   * @param {Number} y2 矩形右下頂点座標
   * @param {Number} GrHandle グラフィックハンドル
   * @param {Number} TransFlag 画像の透明度を有効にするか(現在特に意味なし)
   * @return 成功: 0 / 失敗: -1
   */
  const DrawExtendGraph = (x1, y1, x2, y2, GrHandle, TransFlag) => {
    try {
      currentContext.drawImage(graphics[GrHandle], x1, y1, x2 - x1, y2 - y1);
      return 0;
    } catch(e) {
      return -1;
    }
  };
  /**
   * グラフィックの描画
   * @param {Number} x 左上頂点座標
   * @param {Number} y 左上頂点座標
   * @param {Number} GrHandle グラフィックハンドル
   * @param {Number} TransFlag 画像の透明度を有効にするか(現在特に意味なし)
   * @return 成功: 0 / 失敗: -1
   */
  const DrawGraph = (x, y, GrHandle, TransFlag) => {
    try {
      currentContext.drawImage(graphics[GrHandle], x, y);
      return 0;
    } catch(e) {
      return -1;
    }
  };
  /**
   * グラフィックの回転描画
   * @param {Number} x 中心座標
   * @param {Number} y 中心座標
   * @param {Number} ExtRate 拡大率(1.0で等倍)
   * @param {Number} Angle 角度(ラジアン指定)
   * @param {Number} GrHandle グラフィックハンドル
   * @param {Number} TransFlag 画像の透明度を有効にするか(現在特に意味なし)
   * @param {Number} TurnFlag 左右反転を行うか
   * @returns 成功: 0 / 失敗: -1
   */
  const DrawRotaGraph = (x, y, ExtRate, Angle, GrHandle, TransFlag, TurnFlag) => {
    try {
      const img = graphics[GrHandle];
      const width = TurnFlag === TRUE ? -img.width : img.width;
      currentContext.save();
      currentContext.translate(x, y);
      currentContext.rotate(Angle);
      currentContext.drawImage(img, -width * .5 * ExtRate, -img.height * .5 * ExtRate, width * ExtRate, img.height * ExtRate);
      currentContext.restore();
      return 0;
    } catch(e) {
      return -1;
    }
  };
  /**
   * [async] 画僧ファイルの読み込み
   * @param {String} FileName ロードする画像のパス
   * @return 成功: グラフィックハンドル / 失敗: -1
   */
  const LoadGraph = (FileName) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const GrHandle = (grCount++);
        graphics[GrHandle] = img;
        resolve(GrHandle);
      };
      img.onerror = () => reject(-1);
      img.src = FileName;
    });
  };
  /**
   * 描画のブレンドモードを設定する
   * @param {Number} BlendMode ブレンドモード
   * @param {Number} Pal パラメータ(0 ~ 255)
   * @return 成功: 0 / 失敗: -1
   */
  const SetDrawBlendMode = (BlendMode, Pal) => {
    try {
      const mode = BlendMode || currentDrawMode;
      const pal = clamp(0, 255, Pal || currentDrawPal);
      switch(BlendMode) {
        case jDXC.jDX_BLENDMODE_NOBLEND:
          currentCanvas.globalAlpha = 1.0;
          break;
        case jDXC.jDX_BLENDMODE_ALPHA:
          currentCanvas.globalAlpha = pal / 255;
          break;
        default:
          return -1;
      }
      currentDrawMode = mode;
      currentDrawPal = pal;
      return 0;
    } catch(e) {
      return -1;
    }
  };
  
  // その他画面操作系関数 ////////////////////////////////////////////////////////////////
  /**
   * 画面に描かれたものを消去する
   * @return 成功: 0 / 失敗: -1
   */
  const ClearDrawScreen = () => {
    try {
      currentContext.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
      return 0;
    } catch(e) {
      return -1;
    }
  };
  /**
   * 裏ページを表ページへ反映する
   * @return 成功: 0 / 失敗: -1
   */
  const ScreenFlip = () => {
    try {
      mainContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
      mainContext.drawImage(backCanvas, 0, 0);
      return 0;
    } catch(e) {
      return -1;
    }
  };
  /**
   * 描画先グラフィック領域変更
   * @param {Number} DrawScreen 描画対象のグラフィック領域
   * @return 成功: 0 / 失敗: -1
   */
  const SetDrawScreen = (DrawScreen) => {
    try {
      switch(DrawScreen) {
        case jDXC.jDX_SCREEN_FRONT:
          currentCanvas = mainCanvas;
          currentContext = mainContext;
          break;
        case jDXC.jDX_SCREEN_BACK:
          currentCanvas = currentCanvas;
          currentContext = backContext;
          break;
      }
      SetDrawBlendMode(currentDrawMode, currentDrawPal);
      return 0;
    } catch(e) {
      return -1;
    }
  };
  /**
   * 画面モードの変更
   * @param {Number} SizeX 解像度(width)
   * @param {Number} SizeY 解像度(height)
   * @param {Number} ColorBitNum カラービット数(現在特に意味なし)
   * @return 成功: 0 / 失敗: -1
   */
  const SetGraphMode = (SizeX, SizeY, ColorBitNum) => {
    try {
      backCanvas.width = SizeX;
      backCanvas.height = SizeY;
      mainCanvas.width = SizeX;
      mainContext.height = SizeY;
      return 0;
    } catch(e) {
      return -1;
    }
  };

  // ウエイト関係の関数 /////////////////////////////////////////////////////////////////
  /**
   * [async] 指定の時間だけ止める
   * @param {Number} WaitTime 止める時間(ミリ秒単位)
   * @return 成功: 0 / 失敗: -1
   */
  const WaitTimer = (WaitTime) => {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => resolve(0), WaitTime);
      } catch(e) {
        reject(-1);
      }
    });
  };

  return {
    Lib_Init,

    DrawExtendGraph,
    DrawGraph,
    DrawRotaGraph,
    LoadGraph,
    SetDrawBlendMode,

    ClearDrawScreen,
    ScreenFlip,
    SetDrawScreen,
    SetGraphMode,

    WaitTimer,
  };
})();
Object.freeze(jDX);
