/**
 * Copyright (c) 2022 Akira Ikeda (Kamigoe)
 * This software is released under the MIT License, see LICENSE.
 */

var Lib = {
    //スクリーン(canvas)系
    jDX_SCREEN_BACK: "back",
    jDX_SCREEN_FRONT: "front",

    //ブレンドモード系
    jDX_BLENDMODE_NOBLEND: "noblend",
    jDX_BLENDMODE_ALPHA: "alpha"
};

var libBackCanvas;//裏画面
var libBackContext;//裏画面
var libMainCanvas;//表画面
var libMainContext;//表画面
var libDrawCanvas;//描画対象画面
var libDrawContext;//描画対象画面

//ライブラリの初期化
Lib.Lib_Init = function(){
    libBackCanvas = document.createElement("canvas");
    libBackContext = libBackCanvas.getContext("2d");
    libBackCanvas = document.getElementById("mainCanvas");
    libBackContext = libBackCanvas.getContext("2d");
    libBackCanvas.width = 640;
    libBackCanvas.height = 480;
    libMainCanvas.width = 640;
    libMainCanvas.height = 480;
    libDrawCanvas = libMainCanvas;
    libDrawContext = libMainContext;
}

//指定時間(ms)スリープ
Lib.WaitTimer = function(waitMsec) {
    var startMsec = new Date();

    // 指定ミリ秒間、空ループ。CPUは常にビジー。
    while (new Date() - startMsec < waitMsec);
}

//DrawScreen:描画対象にしたいスクリーン
Lib.SetDrawScreen = function(DrawScreen){
    switch(DrawScreen){
    case Lib.jDX_SCREEN_FRONT:
        libDrawCanvas = libMainCanvas;
        libDrawContext = libMainContext;
        break;
    case Lib.jDX_SCREEN_BACK:
        libDrawCanvas = libDrawCanvas;
        libDrawContext = libBackContext;
        break;
    }
}

//libLoadImageDir:イメージのあるディレクトリ
Lib.LoadGraph = function(libLoadImageDir){
    var libLoadImage = new Image();
    libLoadImage.src = libLoadImageDir;
    Lib.WaitTimer(10);
    return libLoadImage;
}

//BlendMode:ブレンドモード名
//Pal:ブレンドモードの適用具合(0 ~ 255)
Lib.SetDrawBlendMode = function(BlendMode, Pal){
    switch(BlendMode){
        case Lib.jDX_BLENDMODE_NOBLEND:
            libDrawContext.globalAlpha = 1.0;
            break;
        case Lib.jDX_BLENDMODE_ALPHA:
            libDrawContext.globalAlpha = Pal / 255;
            break;
    }
}

//x, y:描画したい左上の座標
//GrHandle:グラフィックイメージ
Lib.DrawGraph = function(x, y, GrHandle){
    libDrawContext.drawImage(GrHandle, x, y);
}

//x1, y1:描画したい左上の座標
//x2, y2:描画したい右下の座標
//GrHandle:グラフィックイメージ
Lib.DrawExtendGraph = function(x1, y1, x2, y2, GrHandle){
    libDrawContext.drawImage(GrHandle, x1, y1, x2 - x1, y2 - y1);
}

//x, y:描画したい中心座標
//ExtRate:拡大率
//Angle:角度(ラジアン)
//GrHandle:グラフィックイメージ
Lib.DrawRotaGraph = function(x, y, ExtRate, Angle, GrHandle){
    libDrawContext.save();
    libDrawContext.translate(x, y);
    libDrawContext.rotate(Angle);
    libDrawContext.drawImage(GrHandle, -GrHandle.width / 2 * ExtRate, -GrHandle.height / 2 * ExtRate, GrHandle.width * ExtRate, GrHandle.height * ExtRate);
    libDrawContext.restore();  
}

//スクリーン(キャンバス)サイズの変更
//SizeX, SizeY:変更したいサイズ
Lib.SetGraphMode = function(SizeX, SizeY, ColorBitNum){
    libBackCanvas.width = SizeX;
    libBackCanvas.height = SizeY;
    libBackContext = libBackCanvas.getContext("2d");
    libMainCanvas.width = SizeX;
    libMainCanvas.height = SizeY;
    libMainContext = libMainCanvas.getContext("2d");
}

//画面をきれいさっぱりに
Lib.ClearDrawScreen = function(){
    libDrawContext.clearRect(0, 0, libDrawCanvas.width, libDrawCanvas.height);
}

//描画対処画面と表画面の描画内容を入れ替え
Lib.ScreenFlip = function(){
    libMainContext.drawImage(libBackCanvas, 0, 0);
}