const {Pacotes} = require("../configs/Pacotes.js")
let P = new Pacotes()

const {Server} = require("../configs/Server.js")
let S = new Server()

const app = S.app

async function test(){
    let str = '/../myfiles'
    let nomalize = P.path.resolve(__dirname + str)
    let resp = await P.fs.promises.readdir(__dirname + str)
    let path = await P.path.basename(nomalize)
    console.log(nomalize)
    console.log(path)
    console.log(resp)
}
// test()

app.get('/api', async (req, res) => {
    let path = ''
    if(req.headers.path){
        path = req.headers.path
    }
    const normalizePath = P.path.resolve(__dirname + '/../myProjects' + path);
    // console.log(normalizePath)
    let ObjectofItems = {}
    let permit = false
    normalizePath.split('\\').forEach(element => {
        if(element === "myProjects"){
            permit = true
        }
    });
    if(permit){
        try {
            const folderName = await P.path.basename(normalizePath);
            const dirInside = await P.fs.promises.readdir(normalizePath);

            const statsPromises = dirInside.map(async item => {
            try {
                const itemPath = P.path.normalize(normalizePath + `/${item}`);
                const stats = await P.fs.promises.stat(itemPath);

                return {
                    item,
                    isDirectory: stats.isDirectory(),
                    stats
                };
            } catch (err) {
                console.log(err);
                return { item, isDirectory: false, stats: null };
            }
            });

            const statsResults = await Promise.all(statsPromises);
            statsResults.forEach(result => {
                let item = result.item
                let isDir = result.isDirectory
                ObjectofItems[item] = isDir
            });

            res.send({
                    "path" : normalizePath,
                    "data": ObjectofItems,
                    "pathName" : folderName
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ "error": "Internal Server Error" });
        }
    }else{
        res.status(500).send({ "error" : "Aki nao amigao :>"})
    }
});

app.get('/api/file', (req, res) => {
    const fileName = req.headers.path;    

    if (!fileName) {
        res.status(400).send('Nome do arquivo ausente.');
        return;
    }

    const filePath = P.path.join(__dirname,'/../myProjects', fileName);
    P.fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erro ao ler o arquivo.');
        } else {
            // Exibir o conteúdo do arquivo na página
            res.send({response : `<pre class="hljs">${data}</pre>`});
        }
    });
}); 

async function verificaTipo(caminho) {
    try {
        const stats = await fs.stat(caminho);
        if (stats.isDirectory()) {
            console.log(`${caminho} é um diretório.`);
        } else if (stats.isFile()) {
            console.log(`${caminho} é um arquivo.`);
        } else {
            console.log(`${caminho} não é nem um arquivo nem um diretório.`);
        }
    } catch (error) {
        console.error(error);
    }
}

S.start()