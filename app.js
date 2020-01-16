const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");


const {NodeClient, Network} = require('bcoin');
const network = Network.get('main');

const clientOptions = {
	network: network.type,
	port: network.rpcPort,
	apiKey: '123456'
}

const client = new NodeClient(clientOptions);

const getBlockChainInfo = async (infoString, ...params) => {
	const result = await client.execute(infoString, params);
	return result;
}

app.get("/gettx/:hash", async(req,res)=>{
	const result = await client.getTX(req.params.hash);
	res.send(result);
});

app.get("/getblock/:par", async (req, res)=>{
	const result = await client.getBlock(req.params.par)
	res.send(result);
});

app.get("/getmempool", async(req,res)=>{
	const verbose = 0;
	const result = await client.execute('getrawmempool', [verbose]);
	res.send(result);
});

app.get("/getblockbyheight/:height", async (req, res)=>{
	getBlockChainInfo('getblockbyheight', parseInt(req.params.height)).then(response =>{
		res.send(response);
	});
});

app.get("/getdifficulty", async(req, res)=>{
	getBlockChainInfo('getdifficulty').then(response =>{
		res.send(String(response));
	})
})
app.get("/getblockchaininfo", async(req, res)=>{
	getBlockChainInfo('getblockchaininfo').then(response =>{
		res.send(response);
	});
})
app.get("/getblockcount", (req, res)=>{
	getBlockChainInfo('getblockcount').then(response =>{
		res.send(String(response));
	});
});
app.get("/getwork", (req, res)=>{
	getBlockChainInfo('getwork').then(response =>{
		res.send(response);
	});
});
app.get("/", (req, res) => {
	res.render("index")
});

app.listen(3000, () => console.log('Serving'));