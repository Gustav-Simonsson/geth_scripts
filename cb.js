function doblocks(f, includeTxs) {
    var total = 0;
    for (var i = 1; ; i++) {
	var b = eth.getBlock(i, !!includeTxs);
	if (!b) {
	    break;
	}
	total++;
	if (total > 10000) {
	    return total;
	}
	f(i, b);
    }
    return total;
}

function contsets() {
    var bn = eth.getBlock("latest").number;
    var count = 1;
    var addr = "";
    var miner = "";
    var set = [];
    var tempset = [];
    for (i = 10000; i < bn; i++) {
	if (i%200 == 0) {
	    console.log("processed", i, "blocks");
	}
	//console.log("addr:",addr,"cb:", eth.getBlock(i).miner);
	miner = eth.getBlock(i).miner;
	if (addr == miner) {
	    tempset.push(i);
	    count++;
	} else {
	    if (count > 1) {
		set.push(tempset);
		tempset = [];
	    }
	    count = 1;
	    tempset = []
	    tempset.push(miner);
	    tempset.push(i);
	}
    addr = miner;
    }

    set.sort(function(a, b) {
	if (a.length < b.length) {
	    return -1;
	} else if (a.length == b.length) {
	    return 0;
	} else {
	    return 1;
	}
    });

return set;
}

function blocktimes() {
    var bn = 10000; //eth.getBlock("latest").number;
    var set = [];
    var count = 0
    var set = []
    var tempset = []
    var interval = 200
    for (i = 1; i < bn - 1; i++) {
	if (i%200 == 0) {
	    console.log("processed", i, "blocks");
	}
	ts1 = eth.getBlock(i).timestamp;
	ts2 = eth.getBlock(i + 1).timestamp;
	diff = ts2 - ts1;
	if (i < 50) {
	    console.log(diff);
	}
	tempset.push(diff);
	if (count == interval) {
	    var sum = 0;
	    for (j = i - interval; j < i; j++) {
		sum = sum + tempset[j];
	    }
	    set.push(sum / interval);
	    count = 0;
	}
	count++;
    }
    return set
}

function uncles() {
    var bn = 1000; //eth.getBlock("latest").number;
    var uncles = 0;
    var singles = 0;
    var doubles = 0;
    for (i = 1; i < bn - 1; i++) {
	if (i%200 == 0) {
	    console.log("processed", i, "blocks");
	}
	us = eth.getBlock(i).uncles.length;
	uncles = uncles + us;
	if (us == 1) {
	    singles = singles + 1;
	}
	if (us == 2) {
	    doubles = doubles + 1;
	}
    }
    return [uncles, singles, doubles];
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
	//if (b.number < 9000 || b.number > 10000) {
	  //  return
    //}
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
