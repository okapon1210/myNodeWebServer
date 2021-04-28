let http = require('http');
let fs = require('fs');
let path = require('path');
let config = require('./config.js');
let mime = require('./mimetype.js');

const server = http.createServer();

//ポートを指定
server.listen(config.port);

//requestイベントが発生したらserve関数を実行
server.on('request', serve);

async function serve(request, response){

    //ホストよりあとののURIを代入
    let filePath = request.url;

    //もしもファイル指定がなければデフォルトに指定されたファイルを返すようにする。
    if(filePath == '/'){
        filePath = config.default;
    }

    //リクエストされたファイルの拡張子を小文字にして代入
    let extName = String(path.extname(filePath)).toLowerCase();
    
    //拡張子が無い場合404を返すことことを見越してhtmlに変換
    if(extName == ''){
        extName = '.html';
    }

    //mimetypeを判別する
    let contentType = mime.mimeTypes[extName]|| 'application/octet-stream';

    //リクエストされたファイルを取得
    let resData = await getFile(filePath);

    //取得したステータスコードとmimetypeをヘッダに書き込む
    response.writeHead(resData.statusCode, contentType);
    //bodyを送信
    response.end(resData.content, config.characterCode);
}

//ファイル読み込み関数
//戻り値は{データ, ステータスコード}のオブジェクト
function getFile(filePath){
    //プロミスオブジェクトを返す
    return　new Promise((resolve, reject) => {
        //src以下の指定ファイルを読み込む
        fs.readFile('./src' + filePath, (error, content) => {
            //エラーが出たら
            if(error){
                //ファイルが存在しない時
                if(error.code == 'ENOENT'){
                    //404のページを読み込んで返却する
                    fs.readFile('./src/404.html', (error, content) => {
                        resolve({content: content, statusCode: 404});
                    });
                }else{
                    resolve({content:'Sorry, check with the site admin for error: ' + error.code + '..\n', statusCode: 500});
                }
            }else{
                //読み込めたらファイルとステータスコードを返却する
                resolve({content: content, statusCode: 200});
            }
        });
    });
}

//てきとう
console.log('Start!');
