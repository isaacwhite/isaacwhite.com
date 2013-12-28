var BloomDictionary = {};

BloomDictionary.seeds = [123,321,213,312];

String.prototype.sanitize = function() {
	var cleanString = this.replace(/^\W+|\W+$/g,"").replace(/\u201B|\u2019|\u2018/g,"\'");
	return cleanString;
}

String.prototype.generalize = function() {
	var cleanString = this.replace(/'s/g,"");
	return cleanString;
}

String.prototype.isUpperCase = function() {
	if (this == this.toUpperCase()) {
		return true;
	} else {
		return false;
	}
}

String.prototype.separate = function () {
	if (this.indexOf('-') != -1) {
		// console.log("found regular dash!");
		return this.split('-');
	} else if (this.indexOf('\u2014') != -1) {
		// console.log("found em dash!");
		return this.split('\u2014');
	} else {
		return -1; //indicates not a valid operation on this string
	}
}

String.prototype.isNumber = function () {
	var returnValue = /^\d+$/.test(this);
	return returnValue;
}

BloomDictionary.getIndex = function (number) {
	if (number > 1000000-1) {
		number = number % 1000000;
	} //no else
	return number;
}

BloomDictionary.addHashes = function(someWord) {
	var index;
	//hash with the requested seeds and add to the array
	for (var i=0; i<BloomDictionary.seeds.length;i++) {
		index = getIndex(murmurhash3_32_gc(someWord,BloomDictionary.seeds[i]));
		dictionary[index] = 1;
	}
}

BloomDictionary.extractArray = function(compressedString) {
	var compressedArray = compressedString.split("");
	var compressConversion = [];
	for(i=0; i< compressedArray.length; i++) {
		var ones,twos,fours,eights,sixteens,thirtytwos,character,value,temp;
		character = compressedArray[i];
		value = character.charCodeAt() - 33;
		temp = value;
		thirtytwos = Math.floor(value/32);
		temp -= thirtytwos * 32;
		sixteens = Math.floor(temp/16);
		temp -= sixteens * 16;
		eights = Math.floor(temp/8);
		temp -= eights * 8;
		fours = Math.floor(temp/4);
		temp -= fours * 4;
		twos = Math.floor(temp/2);
		temp -= twos * 2;
		ones = temp;
		compressConversion.push(ones,twos,fours,eights,sixteens,thirtytwos);
	}

	return compressConversion;
}
//takes any word split by spaces
BloomDictionary.checkSpelling = function(someWord) {
	var currentIndex;
	var cleanString;
	var cleanStringArray;


	if (someWord.isUpperCase() || someWord.isNumber() || someWord.sanitize().generalize().isUpperCase()) {
		return true; //return immediately if it's an uppercase string or number
	} else {
		cleanString = someWord.sanitize(); //doesn't do lower case
		if (this.checkHashes(cleanString)) {
			return true; //return true if it checks out here.
		} else if (this.checkHashes(cleanString.toLowerCase())) {
			return true;//return true if it works in lower case
		} else { //if it doesn't check out with just cleaning it
			cleanStringArray = cleanString.separate();
			if (cleanStringArray != -1) {
				for (var i = 0; i<cleanStringArray.length; i++) {
					if(!this.checkHashes(cleanStringArray[i].sanitize())) {
						console.log(cleanStringArray[i]);
						return false;//immediately declare the entire string misspelled
					} 
				}
				//we made it through the string, it's spelled correctly
				return true;
			} else { //it's not dashed/em-dashed, let's remove "'s"
				//preserve's capitals and removes 's, doesn't preserve capitals and removes 's
				cleanStringArray = [cleanString.generalize(),cleanString.generalize().toLowerCase()];

				if (BloomDictionary.checkHashes(cleanStringArray[0])
					|| BloomDictionary.checkHashes(cleanStringArray[1])) {
					return true;
				} 
			}
		}
	}
	// console.log(cleanString);
	if(BloomDictionary.extras.indexOf(cleanString) == -1){ //finally make sure it's not an added value.
		return false; //if we didn't find it as spelled correctly using any of the above methods, it's wrong
		console.log(cleanString);
	} else {
		return true;
	}
}

//checks if the hash value for a single word are in the dictionary
BloomDictionary.checkHashes = function(cleanWord) {
	for (var i=0; i<BloomDictionary.seeds.length;i++) {
		currentIndex = BloomDictionary.getIndex(murmurhash3_32_gc(cleanWord,BloomDictionary.seeds[i]));
		if (BloomDictionary.filter[currentIndex] != 1) {
			return false
		}
	}
	//if we haven't returned by now, all the hashes were found, so it's probably there.
	return true;

}


/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 * 
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 * 
 * @param {string} key ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash 
 */

function murmurhash3_32_gc(key, seed) {
	var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

	remainder = key.length & 3; // key.length % 4
	bytes = key.length - remainder;
	h1 = seed;
	c1 = 0xcc9e2d51;
	c2 = 0x1b873593;
	i = 0;

	while (i < bytes) {
	  	k1 = 
	  	  ((key.charCodeAt(i) & 0xff)) |
	  	  ((key.charCodeAt(++i) & 0xff) << 8) |
	  	  ((key.charCodeAt(++i) & 0xff) << 16) |
	  	  ((key.charCodeAt(++i) & 0xff) << 24);
		++i;

		k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
		k1 = (k1 << 15) | (k1 >>> 17);
		k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

		h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
		h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
		h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
	}

	k1 = 0;

	switch (remainder) {
		case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
		case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
		case 1: k1 ^= (key.charCodeAt(i) & 0xff);

		k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
		k1 = (k1 << 15) | (k1 >>> 17);
		k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
		h1 ^= k1;
	}

	h1 ^= key.length;

	h1 ^= h1 >>> 16;
	h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
	h1 ^= h1 >>> 13;
	h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
	h1 ^= h1 >>> 16;

	return h1 >>> 0;
}