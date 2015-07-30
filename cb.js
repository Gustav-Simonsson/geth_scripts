function doblocks(f, includeTxs) {
    var total = 0;
    for (var i = 1; ; i++) {
	var b = eth.getBlock(i, !!includeTxs);
	if (!b) {
	    break;
	}
	total++;
	f(i, b);
    }
    return total;
}

function anytxs() {
    var found = false;
    doblocks(function (_, b) { found = found || (b.transactions.length > 0) }, true);
    return found;
}


function countblocks() {
    // count coinbases.
    var m = {};
    var total = doblocks(function(i, b) {
	if (i%200 == 0) {
	    console.log("counting...", i);
	}
	if (!m[b.miner]) {
	    m[b.miner] = 1;
	} else {
	    m[b.miner] = m[b.miner] + 1;
	}
    }, false);

    // sort by block count and compute percentages.
    var dist = [];
    for (var k in m) {
	if (m.hasOwnProperty(k)) {
	    var percent = ((m[k] / total) * 100).toFixed(2) + "%";
	    dist.push([k, m[k], percent]);
	}
    }
    dist.sort(function(a, b) {
	if (a[1] < b[1]) {
	    return -1;
	} else if (a[1] == b[1]) {
	    return 0;
	} else {
	    return 1;
	}
    });

    // print them.
    for (var i = 0; i < dist.length; i++) {
	console.log(dist[i].join(" "));
    }
}

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
	str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

// prints non-standard extradata from all blocks.
function printextra() {
    doblocks(function(i, b) {
	if (!(/Geth/.test(hex2a(b.extraData)))) {
	    console.log(b.miner, hex2a(b.extraData))
	}
    });
}
       
