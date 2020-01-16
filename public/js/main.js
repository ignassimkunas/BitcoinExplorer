var blocksShowing = 0;
var blockCount;
var blocks = [];

var transactionsShowing = 0;
var transactionCount;
var transactions = [];

window.onload = () =>{
	$("#blocks").click();
	$.get("/getblockcount", data =>{
		blockCount = data;
		loadBlocks();
	});
}
$('#sidebarCollapse').on('click', () =>{
  $('#sidebar').toggleClass('active');
});

$('#all-blocks').on('click', async() => {
	await $.get("/getblockcount", data =>{
		blockCount = data;
		loadBlocks();
	});
	hideAll()
	$("#all-blocks-content").show();
});
$("#block-by-number").on('click', ()=>{
	hideAll()
	$("#block-by-number-content").show();
});
$("#block-by-hash").on('click', ()=>{
	hideAll()
	$("#block-by-hash-content").show();
});
$("#load-more-blocks").on('click', () => {
	blocksShowing += 10;
	loadBlocks()
});
$("#unconfirmed-transactions").on('click', async()=>{
	loadTransactions();
	hideAll()
	$("#unconfirmed-transactions-content").show();
});
$("#transactions-by-hash").on('click', ()=>{
	hideAll();
	$("#transaction-hash-content").show();
});
$("#transactions-by-block").on('click', ()=>{
	hideAll();
	$("#transaction-block-content").show();
})
$("#info").on('click', ()=>{
	hideAll()
	$("#blockchain-info-content").show();
	loadInfo();
});
$("#height-search-button").on('click', async()=>{
	await $.get("/getblock/" + $("#height-input").val(), data => {
		$("#byheight-height").html("<strong>Height:</strong>" + data.height);
		$("#byheight-hash").html("<strong>Hash:</strong>" + data.hash);
		$("#byheight-merkle").html("<strong>Merkle:</strong> " + data.merkleRoot);
		$("#byheight-size").html("<strong>Size:</strong> " + parseInt(data.bits/8) + " Bytes");
		$("#byheight-nTx").html("<strong>Transactions:</strong>" + data.txs.length);
		$("#byheight-version").html("<strong>Version:</strong>" + data.version);
		$("#byheight-time").html("<strong>Time:</strong> " + timeStampToDate(data.time));
		$("#byheight-nonce").html("<strong>Nonce:</strong> " + data.nonce);
	});
});
$("#hash-search-button").on('click', async()=>{
	await $.get("/getblock/" + $("#hash-input").val(), data => {
		$("#byhash-height").html("<strong>Height:</strong>" + data.height);
		$("#byhash-hash").html("<strong>Hash:</strong>" + data.hash);
		$("#byhash-merkle").html("<strong>Merkle:</strong> " + data.merkleRoot);
		$("#byhash-size").html("<strong>Size:</strong> " + parseInt(data.bits/8) + " Bytes");
		$("#byhash-nTx").html("<strong>Transactions:</strong>" + data.txs.length);
		$("#byhash-version").html("<strong>Version:</strong>" + data.version);
		$("#byhash-time").html("<strong>Time:</strong> " + timeStampToDate(data.time));
		$("#byhash-nonce").html("<strong>Nonce:</strong> " + data.nonce);
	});
});
$("#transaction-hash-search-button").on('click', async()=>{
	$("#tx-io").show();
	await $.get("/gettx/" + $("#tx-hash-input").val(), data =>{
		$("#th-hash").html("<strong>Hash:</strong>" + data.hash);
		$("#th-block").html("<strong>Block hash:</strong>" + data.block);
		$("#th-fee").html("<strong>Fee:</strong>" + parseFloat(data.fee)/10000000000) + "BTC";
		$("#th-time").html("<strong>Time:</strong> " + timeStampToDate(data.time));
		$("#th-index").html("<strong>Index:</strong> " + data.index);
		$("#th-version").html("<strong>Version:</strong>" + data.version +"<br>");
		var inputValue = 0;
		var outputValue = 0;
		data.inputs.forEach(input=>{
			inputValue += input.coin.value;
			$("#th-inputs").append("<p><strong>Adress:</strong>" + input.coin.address + " </p>");
			$("#th-inputs").append("<p><strong>Value:</strong>" + parseFloat(input.coin.value)/10000000000 + " BTC</p>");
			$("#th-inputs").append("<p><strong>Script:</strong>" + input.coin.script + " </p><hr><br>");
		})
		$("#th-inputs").append("<p><strong>Whole input value:</strong>" + parseFloat(inputValue)/10000000000 + " BTC</p><br>");
		data.outputs.forEach(output=>{
			outputValue += output.value;
			$("#th-outputs").append("<p><strong>Adress:</strong>" + output.address + " </p>");
			$("#th-outputs").append("<p><strong>Script:</strong>" + output.script + " </p>");
			$("#th-outputs").append("<p><strong>Value:</strong>" + parseFloat(output.value)/10000000000 + " BTC</p><hr><br>");
		})
		$("#th-outputs").append("<p><strong>Whole output value:</strong>" + parseFloat(outputValue)/10000000000 + " BTC</p><br>")
	});
});
$("#transaction-block-search-button").on('click', async()=>{
	var txs = [], rateUSD, rateEUR, rateGBP;
	await $.get("/getblock/" + $("#transaction-block-input").val(), data=>{
		data.txs.forEach(tx=>{
			txs.push(tx);
		})
	});
	await $.get("https://api.coindesk.com/v1/bpi/currentprice.json", data=>{
		rateUSD = JSON.parse(data).bpi.USD.rate.replace(',', "");
		rateEUR = JSON.parse(data).bpi.EUR.rate.replace(',', "");
		rateGBP = JSON.parse(data).bpi.GBP.rate.replace(',', "");
	});
	$("#transactions-block-content-table").empty()
	$("#transactions-block-content-table").append('<tr><th>Hash</th><th>Time</th><th>Fee</th><th>Ammount(BTC)</th><th>Ammount(USD)</th></tr>');
	txs.forEach(tx => {
		var totalAmmount = 0;
		tx.outputs.forEach(ammount =>{
			totalAmmount += parseFloat(ammount.value)/10000000000;
		})
		$("#transactions-block-content-table").append('<tr><td class="tx-hash">' + tx.hash +  '</td>' +'<td>' + timeStampToDate(tx.mtime) + '</td><td>'+tx.fee/10000000000 +'</td><td>'+ totalAmmount +'</td><td>'+parseFloat((totalAmmount*rateUSD).toFixed(2)) +'</td></tr>');
	})
	const txHashes = document.querySelectorAll(".tx-hash");
	txHashes.forEach((hash,index)=>{
		hash.addEventListener('click', async()=>{
			$("#tx-mod-title").html(txs[index].hash);
			$("#modal-tx-hash").html("<strong>Hash:</strong>" + txs[index].hash);
			$("#index").html("<strong>Index:</strong>" + txs[index].index);
			$("#time").html("<strong>Time:</strong> " + timeStampToDate(txs[index].mtime));
			$("#rate").html("<strong>Rate:</strong> " + txs[index].rate);
			$("#version").html("<strong>Version:</strong>" + txs[index].version);
			var totalAmmount = 0;
			txs[index].outputs.forEach(ammount =>{
				totalAmmount += parseFloat(ammount.value)/10000000000;
			});
			$("#ammount-btc").html("<strong>Ammount(BTC):</strong>" + totalAmmount + "BTC");
			$("#ammount-usd").html("<strong>Ammount(USD):</strong>" + parseFloat((totalAmmount*rateUSD).toFixed(2)) + "$");
			$("#ammount-eur").html("<strong>Ammount(EUR):</strong> " + parseFloat((totalAmmount*rateEUR).toFixed(2)) + "€");
			$("#ammount-gbp").html("<strong>AMMOUNT(GBP):</strong> " + parseFloat((totalAmmount*rateGBP).toFixed(2)) + "£");
			$("#tx-modal").modal('show');
			
		})
	})
});
const timeStampToDate = timeStamp => {
	let date = new Date(timeStamp * 1000);
	let year = date.getFullYear();
	let month = date.getMonth();
	month += 1;
	if (month < 10){month = "0" + month}
	let day = date.getDate();
	if (day < 10){day = "0" + day}
	let hours = date.getHours();
	let minutes = "0" + date.getMinutes();
	let seconds = "0" + date.getSeconds();
	let formattedTime = year + '-' + month + '-' + day + " " + hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
	return formattedTime;
}
const timeStampToHours = timeStamp =>{
	let date = new Date(timeStamp * 1000);
	let hours = date.getHours();
	let minutes = "0" + date.getMinutes();
	let seconds = "0" + date.getSeconds();
	let formattedTime =hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
	return formattedTime;
}
const hideAll = () =>{
	$(".content").hide();
}
const loadBlocks = async () => {
	for (let i = blockCount-blocksShowing; i > blockCount-blocksShowing-10; i--){
		await $.get("/getblockbyheight/" + i, data => {
			blocks.push(data);
		});
	}
	$("#blocks-content-table").empty()
	$("#blocks-content-table").append('<tr><th>Height</th><th>Hash</th><th>Size</th><th>Mined</th></tr>');
	blocks.sort((a, b) => (a.height < b.height) ? 1 : -1)
	blocks.forEach(block => {
		$("#blocks-content-table").append('<tr><td class="block-height">' + block.height +  '</td>' +'<td class="block-hash">' + block.hash + '</td><td>'+parseInt(block.size/8) +' Bytes </td><td>'+ timeStampToDate(block.time) +'</td></tr>');
	})
	
	const hashes = document.querySelectorAll(".block-hash");
	const heights = document.querySelectorAll(".block-height");
	hashes.forEach((hash,index) => {
		hash.addEventListener('click', async()=>{
			//nuimt get ir tiesiog iš masyvo
			await $.get("/getblockbyheight/" + heights[index].innerHTML, data=>{
				$("#mod-title").html(data.hash);
				$("#height").html("<strong>Height:</strong>" + data.height);
				$("#hash").html("<strong>Hash:</strong>" + data.hash);
				$("#merkle").html("<strong>Merkle:</strong> " + data.merkleroot);
				$("#size").html("<strong>Size:</strong> " + parseInt(data.size/8) + " Bytes");
				$("#nTx").html("<strong>Transactions:</strong>" + data.nTx);
				$("#difficulty").html("<strong>Difficulty:</strong>" + data.difficulty);
				$("#version").html("<strong>Version:</strong>" + data.version);
				$("#time").html("<strong>Time:</strong> " + timeStampToDate(data.time));
				$("#weight").html("<strong>Weight:</strong> " + data.weight + " WU");
				$("#nonce").html("<strong>Nonce:</strong> " + data.nonce);
				$("#confirmations").html("<strong>Confirmations:</strong> " + data.confirmations);
				$("#modal").modal('show');
		});
	});
	});
	heights.forEach(height => {
		height.addEventListener('click', async()=>{
			await $.get("/getblockbyheight/" + height.innerHTML, data=>{
				$("#mod-title").html(data.height);
				$("#height").html("<strong>Height:</strong>" + data.height);
				$("#hash").html("<strong>Hash:</strong>" + data.hash);
				$("#merkle").html("<strong>Merkle:</strong> " + data.merkleroot);
				$("#size").html("<strong>Size:</strong> " + parseInt(data.size/8) + " Bytes");
				$("#nTx").html("<strong>Transactions:</strong>" + data.nTx);
				$("#difficulty").html("<strong>Difficulty:</strong>" + data.difficulty);
				$("#version").html("<strong>Version:</strong>" + data.version);
				$("#time").html("<strong>Time:</strong> " + timeStampToDate(data.time));
				$("#weight").html("<strong>Weight:</strong> " + data.weight + " WU");
				$("#nonce").html("<strong>Nonce:</strong> " + data.nonce);
				$("#confirmations").html("<strong>Confirmations:</strong> " + data.confirmations);
				$("#modal").modal('show');
			});
				
		});
	});
}
const loadTransactions = async () => {
	await $.get("/getmempool", data => {
		transactions = data;
	});
	if (transactions.length == 0){
		$("#transactions-content-table").hide();
		$("#load-more-transactions").html("Mempool is empty.")
	}
}

const loadInfo = async() =>{
	await $.get("/getblockcount", data =>{
		$("#bc-size").html("<strong>Size:</strong>" + data);
	})
	await $.get("/getmempool", data=>{
		$("#mempool-size").html("<strong>Mempool size:</strong>" + data.length);
	})
	await $.get("/getdifficulty", data =>{
		$("#difficulty").html("<strong>Difficulty:</strong> " + data);
	})
	await $.get("/getblockchaininfo", data=>{
		$("#median-confirmation-time").html("<strong>Median confirmation time:</strong> " + timeStampToHours(data.mediantime));
	})
	await $.get("/getblockchaininfo", data=>{
		$("#best-block-hash").html("<strong>Best block hash:</strong>" + data.bestblockhash);
	});
	await $.get("https://api.coindesk.com/v1/bpi/currentprice.json", data=>{
		$("#price-usd").html("<strong>Value:</strong>" + JSON.parse(data).bpi.USD.rate + '$');
	})
	await $.get("/getwork", data =>{
		$("#work-data").html("<strong>Data:</strong>" + data.data);
		$("#work-target").html("<strong>Target:</strong>" + data.target);
	})
	
}


