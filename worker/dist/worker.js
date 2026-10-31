// Jackie's Studio delivery Worker: built by scripts/build-worker.js. Paste this whole file into Cloudflare.

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/qrcode/lib/core/utils.js
var require_utils = __commonJS({
  "node_modules/qrcode/lib/core/utils.js"(exports) {
    var toSJISFunction;
    var CODEWORDS_COUNT = [
      0,
      // Not used
      26,
      44,
      70,
      100,
      134,
      172,
      196,
      242,
      292,
      346,
      404,
      466,
      532,
      581,
      655,
      733,
      815,
      901,
      991,
      1085,
      1156,
      1258,
      1364,
      1474,
      1588,
      1706,
      1828,
      1921,
      2051,
      2185,
      2323,
      2465,
      2611,
      2761,
      2876,
      3034,
      3196,
      3362,
      3532,
      3706
    ];
    exports.getSymbolSize = function getSymbolSize(version) {
      if (!version) throw new Error('"version" cannot be null or undefined');
      if (version < 1 || version > 40) throw new Error('"version" should be in range from 1 to 40');
      return version * 4 + 17;
    };
    exports.getSymbolTotalCodewords = function getSymbolTotalCodewords(version) {
      return CODEWORDS_COUNT[version];
    };
    exports.getBCHDigit = function(data) {
      let digit = 0;
      while (data !== 0) {
        digit++;
        data >>>= 1;
      }
      return digit;
    };
    exports.setToSJISFunction = function setToSJISFunction(f) {
      if (typeof f !== "function") {
        throw new Error('"toSJISFunc" is not a valid function.');
      }
      toSJISFunction = f;
    };
    exports.isKanjiModeEnabled = function() {
      return typeof toSJISFunction !== "undefined";
    };
    exports.toSJIS = function toSJIS(kanji) {
      return toSJISFunction(kanji);
    };
  }
});

// node_modules/qrcode/lib/core/error-correction-level.js
var require_error_correction_level = __commonJS({
  "node_modules/qrcode/lib/core/error-correction-level.js"(exports) {
    exports.L = { bit: 1 };
    exports.M = { bit: 0 };
    exports.Q = { bit: 3 };
    exports.H = { bit: 2 };
    function fromString(string) {
      if (typeof string !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string.toLowerCase();
      switch (lcStr) {
        case "l":
        case "low":
          return exports.L;
        case "m":
        case "medium":
          return exports.M;
        case "q":
        case "quartile":
          return exports.Q;
        case "h":
        case "high":
          return exports.H;
        default:
          throw new Error("Unknown EC Level: " + string);
      }
    }
    exports.isValid = function isValid(level) {
      return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
    };
    exports.from = function from(value, defaultValue) {
      if (exports.isValid(value)) {
        return value;
      }
      try {
        return fromString(value);
      } catch (e) {
        return defaultValue;
      }
    };
  }
});

// node_modules/qrcode/lib/core/bit-buffer.js
var require_bit_buffer = __commonJS({
  "node_modules/qrcode/lib/core/bit-buffer.js"(exports, module) {
    function BitBuffer() {
      this.buffer = [];
      this.length = 0;
    }
    BitBuffer.prototype = {
      get: function(index) {
        const bufIndex = Math.floor(index / 8);
        return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) === 1;
      },
      put: function(num, length) {
        for (let i = 0; i < length; i++) {
          this.putBit((num >>> length - i - 1 & 1) === 1);
        }
      },
      getLengthInBits: function() {
        return this.length;
      },
      putBit: function(bit) {
        const bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) {
          this.buffer.push(0);
        }
        if (bit) {
          this.buffer[bufIndex] |= 128 >>> this.length % 8;
        }
        this.length++;
      }
    };
    module.exports = BitBuffer;
  }
});

// node_modules/qrcode/lib/core/bit-matrix.js
var require_bit_matrix = __commonJS({
  "node_modules/qrcode/lib/core/bit-matrix.js"(exports, module) {
    function BitMatrix(size) {
      if (!size || size < 1) {
        throw new Error("BitMatrix size must be defined and greater than 0");
      }
      this.size = size;
      this.data = new Uint8Array(size * size);
      this.reservedBit = new Uint8Array(size * size);
    }
    BitMatrix.prototype.set = function(row, col, value, reserved) {
      const index = row * this.size + col;
      this.data[index] = value;
      if (reserved) this.reservedBit[index] = true;
    };
    BitMatrix.prototype.get = function(row, col) {
      return this.data[row * this.size + col];
    };
    BitMatrix.prototype.xor = function(row, col, value) {
      this.data[row * this.size + col] ^= value;
    };
    BitMatrix.prototype.isReserved = function(row, col) {
      return this.reservedBit[row * this.size + col];
    };
    module.exports = BitMatrix;
  }
});

// node_modules/qrcode/lib/core/alignment-pattern.js
var require_alignment_pattern = __commonJS({
  "node_modules/qrcode/lib/core/alignment-pattern.js"(exports) {
    var getSymbolSize = require_utils().getSymbolSize;
    exports.getRowColCoords = function getRowColCoords(version) {
      if (version === 1) return [];
      const posCount = Math.floor(version / 7) + 2;
      const size = getSymbolSize(version);
      const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
      const positions = [size - 7];
      for (let i = 1; i < posCount - 1; i++) {
        positions[i] = positions[i - 1] - intervals;
      }
      positions.push(6);
      return positions.reverse();
    };
    exports.getPositions = function getPositions(version) {
      const coords = [];
      const pos = exports.getRowColCoords(version);
      const posLength = pos.length;
      for (let i = 0; i < posLength; i++) {
        for (let j = 0; j < posLength; j++) {
          if (i === 0 && j === 0 || // top-left
          i === 0 && j === posLength - 1 || // bottom-left
          i === posLength - 1 && j === 0) {
            continue;
          }
          coords.push([pos[i], pos[j]]);
        }
      }
      return coords;
    };
  }
});

// node_modules/qrcode/lib/core/finder-pattern.js
var require_finder_pattern = __commonJS({
  "node_modules/qrcode/lib/core/finder-pattern.js"(exports) {
    var getSymbolSize = require_utils().getSymbolSize;
    var FINDER_PATTERN_SIZE = 7;
    exports.getPositions = function getPositions(version) {
      const size = getSymbolSize(version);
      return [
        // top-left
        [0, 0],
        // top-right
        [size - FINDER_PATTERN_SIZE, 0],
        // bottom-left
        [0, size - FINDER_PATTERN_SIZE]
      ];
    };
  }
});

// node_modules/qrcode/lib/core/mask-pattern.js
var require_mask_pattern = __commonJS({
  "node_modules/qrcode/lib/core/mask-pattern.js"(exports) {
    exports.Patterns = {
      PATTERN000: 0,
      PATTERN001: 1,
      PATTERN010: 2,
      PATTERN011: 3,
      PATTERN100: 4,
      PATTERN101: 5,
      PATTERN110: 6,
      PATTERN111: 7
    };
    var PenaltyScores = {
      N1: 3,
      N2: 3,
      N3: 40,
      N4: 10
    };
    exports.isValid = function isValid(mask) {
      return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
    };
    exports.from = function from(value) {
      return exports.isValid(value) ? parseInt(value, 10) : void 0;
    };
    exports.getPenaltyN1 = function getPenaltyN1(data) {
      const size = data.size;
      let points = 0;
      let sameCountCol = 0;
      let sameCountRow = 0;
      let lastCol = null;
      let lastRow = null;
      for (let row = 0; row < size; row++) {
        sameCountCol = sameCountRow = 0;
        lastCol = lastRow = null;
        for (let col = 0; col < size; col++) {
          let module2 = data.get(row, col);
          if (module2 === lastCol) {
            sameCountCol++;
          } else {
            if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
            lastCol = module2;
            sameCountCol = 1;
          }
          module2 = data.get(col, row);
          if (module2 === lastRow) {
            sameCountRow++;
          } else {
            if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
            lastRow = module2;
            sameCountRow = 1;
          }
        }
        if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
        if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
      }
      return points;
    };
    exports.getPenaltyN2 = function getPenaltyN2(data) {
      const size = data.size;
      let points = 0;
      for (let row = 0; row < size - 1; row++) {
        for (let col = 0; col < size - 1; col++) {
          const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
          if (last === 4 || last === 0) points++;
        }
      }
      return points * PenaltyScores.N2;
    };
    exports.getPenaltyN3 = function getPenaltyN3(data) {
      const size = data.size;
      let points = 0;
      let bitsCol = 0;
      let bitsRow = 0;
      for (let row = 0; row < size; row++) {
        bitsCol = bitsRow = 0;
        for (let col = 0; col < size; col++) {
          bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
          if (col >= 10 && (bitsCol === 1488 || bitsCol === 93)) points++;
          bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
          if (col >= 10 && (bitsRow === 1488 || bitsRow === 93)) points++;
        }
      }
      return points * PenaltyScores.N3;
    };
    exports.getPenaltyN4 = function getPenaltyN4(data) {
      let darkCount = 0;
      const modulesCount = data.data.length;
      for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];
      const k = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
      return k * PenaltyScores.N4;
    };
    function getMaskAt(maskPattern, i, j) {
      switch (maskPattern) {
        case exports.Patterns.PATTERN000:
          return (i + j) % 2 === 0;
        case exports.Patterns.PATTERN001:
          return i % 2 === 0;
        case exports.Patterns.PATTERN010:
          return j % 3 === 0;
        case exports.Patterns.PATTERN011:
          return (i + j) % 3 === 0;
        case exports.Patterns.PATTERN100:
          return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
        case exports.Patterns.PATTERN101:
          return i * j % 2 + i * j % 3 === 0;
        case exports.Patterns.PATTERN110:
          return (i * j % 2 + i * j % 3) % 2 === 0;
        case exports.Patterns.PATTERN111:
          return (i * j % 3 + (i + j) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + maskPattern);
      }
    }
    exports.applyMask = function applyMask(pattern, data) {
      const size = data.size;
      for (let col = 0; col < size; col++) {
        for (let row = 0; row < size; row++) {
          if (data.isReserved(row, col)) continue;
          data.xor(row, col, getMaskAt(pattern, row, col));
        }
      }
    };
    exports.getBestMask = function getBestMask(data, setupFormatFunc) {
      const numPatterns = Object.keys(exports.Patterns).length;
      let bestPattern = 0;
      let lowerPenalty = Infinity;
      for (let p = 0; p < numPatterns; p++) {
        setupFormatFunc(p);
        exports.applyMask(p, data);
        const penalty = exports.getPenaltyN1(data) + exports.getPenaltyN2(data) + exports.getPenaltyN3(data) + exports.getPenaltyN4(data);
        exports.applyMask(p, data);
        if (penalty < lowerPenalty) {
          lowerPenalty = penalty;
          bestPattern = p;
        }
      }
      return bestPattern;
    };
  }
});

// node_modules/qrcode/lib/core/error-correction-code.js
var require_error_correction_code = __commonJS({
  "node_modules/qrcode/lib/core/error-correction-code.js"(exports) {
    var ECLevel = require_error_correction_level();
    var EC_BLOCKS_TABLE = [
      // L  M  Q  H
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      2,
      1,
      2,
      2,
      4,
      1,
      2,
      4,
      4,
      2,
      4,
      4,
      4,
      2,
      4,
      6,
      5,
      2,
      4,
      6,
      6,
      2,
      5,
      8,
      8,
      4,
      5,
      8,
      8,
      4,
      5,
      8,
      11,
      4,
      8,
      10,
      11,
      4,
      9,
      12,
      16,
      4,
      9,
      16,
      16,
      6,
      10,
      12,
      18,
      6,
      10,
      17,
      16,
      6,
      11,
      16,
      19,
      6,
      13,
      18,
      21,
      7,
      14,
      21,
      25,
      8,
      16,
      20,
      25,
      8,
      17,
      23,
      25,
      9,
      17,
      23,
      34,
      9,
      18,
      25,
      30,
      10,
      20,
      27,
      32,
      12,
      21,
      29,
      35,
      12,
      23,
      34,
      37,
      12,
      25,
      34,
      40,
      13,
      26,
      35,
      42,
      14,
      28,
      38,
      45,
      15,
      29,
      40,
      48,
      16,
      31,
      43,
      51,
      17,
      33,
      45,
      54,
      18,
      35,
      48,
      57,
      19,
      37,
      51,
      60,
      19,
      38,
      53,
      63,
      20,
      40,
      56,
      66,
      21,
      43,
      59,
      70,
      22,
      45,
      62,
      74,
      24,
      47,
      65,
      77,
      25,
      49,
      68,
      81
    ];
    var EC_CODEWORDS_TABLE = [
      // L  M  Q  H
      7,
      10,
      13,
      17,
      10,
      16,
      22,
      28,
      15,
      26,
      36,
      44,
      20,
      36,
      52,
      64,
      26,
      48,
      72,
      88,
      36,
      64,
      96,
      112,
      40,
      72,
      108,
      130,
      48,
      88,
      132,
      156,
      60,
      110,
      160,
      192,
      72,
      130,
      192,
      224,
      80,
      150,
      224,
      264,
      96,
      176,
      260,
      308,
      104,
      198,
      288,
      352,
      120,
      216,
      320,
      384,
      132,
      240,
      360,
      432,
      144,
      280,
      408,
      480,
      168,
      308,
      448,
      532,
      180,
      338,
      504,
      588,
      196,
      364,
      546,
      650,
      224,
      416,
      600,
      700,
      224,
      442,
      644,
      750,
      252,
      476,
      690,
      816,
      270,
      504,
      750,
      900,
      300,
      560,
      810,
      960,
      312,
      588,
      870,
      1050,
      336,
      644,
      952,
      1110,
      360,
      700,
      1020,
      1200,
      390,
      728,
      1050,
      1260,
      420,
      784,
      1140,
      1350,
      450,
      812,
      1200,
      1440,
      480,
      868,
      1290,
      1530,
      510,
      924,
      1350,
      1620,
      540,
      980,
      1440,
      1710,
      570,
      1036,
      1530,
      1800,
      570,
      1064,
      1590,
      1890,
      600,
      1120,
      1680,
      1980,
      630,
      1204,
      1770,
      2100,
      660,
      1260,
      1860,
      2220,
      720,
      1316,
      1950,
      2310,
      750,
      1372,
      2040,
      2430
    ];
    exports.getBlocksCount = function getBlocksCount(version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel.L:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 0];
        case ECLevel.M:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 1];
        case ECLevel.Q:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 2];
        case ECLevel.H:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 3];
        default:
          return void 0;
      }
    };
    exports.getTotalCodewordsCount = function getTotalCodewordsCount(version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel.L:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0];
        case ECLevel.M:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1];
        case ECLevel.Q:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2];
        case ECLevel.H:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3];
        default:
          return void 0;
      }
    };
  }
});

// node_modules/qrcode/lib/core/galois-field.js
var require_galois_field = __commonJS({
  "node_modules/qrcode/lib/core/galois-field.js"(exports) {
    var EXP_TABLE = new Uint8Array(512);
    var LOG_TABLE = new Uint8Array(256);
    (function initTables() {
      let x = 1;
      for (let i = 0; i < 255; i++) {
        EXP_TABLE[i] = x;
        LOG_TABLE[x] = i;
        x <<= 1;
        if (x & 256) {
          x ^= 285;
        }
      }
      for (let i = 255; i < 512; i++) {
        EXP_TABLE[i] = EXP_TABLE[i - 255];
      }
    })();
    exports.log = function log(n) {
      if (n < 1) throw new Error("log(" + n + ")");
      return LOG_TABLE[n];
    };
    exports.exp = function exp(n) {
      return EXP_TABLE[n];
    };
    exports.mul = function mul(x, y) {
      if (x === 0 || y === 0) return 0;
      return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
    };
  }
});

// node_modules/qrcode/lib/core/polynomial.js
var require_polynomial = __commonJS({
  "node_modules/qrcode/lib/core/polynomial.js"(exports) {
    var GF = require_galois_field();
    exports.mul = function mul(p1, p2) {
      const coeff = new Uint8Array(p1.length + p2.length - 1);
      for (let i = 0; i < p1.length; i++) {
        for (let j = 0; j < p2.length; j++) {
          coeff[i + j] ^= GF.mul(p1[i], p2[j]);
        }
      }
      return coeff;
    };
    exports.mod = function mod(divident, divisor) {
      let result = new Uint8Array(divident);
      while (result.length - divisor.length >= 0) {
        const coeff = result[0];
        for (let i = 0; i < divisor.length; i++) {
          result[i] ^= GF.mul(divisor[i], coeff);
        }
        let offset = 0;
        while (offset < result.length && result[offset] === 0) offset++;
        result = result.slice(offset);
      }
      return result;
    };
    exports.generateECPolynomial = function generateECPolynomial(degree) {
      let poly = new Uint8Array([1]);
      for (let i = 0; i < degree; i++) {
        poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]));
      }
      return poly;
    };
  }
});

// node_modules/qrcode/lib/core/reed-solomon-encoder.js
var require_reed_solomon_encoder = __commonJS({
  "node_modules/qrcode/lib/core/reed-solomon-encoder.js"(exports, module) {
    var Polynomial = require_polynomial();
    function ReedSolomonEncoder(degree) {
      this.genPoly = void 0;
      this.degree = degree;
      if (this.degree) this.initialize(this.degree);
    }
    ReedSolomonEncoder.prototype.initialize = function initialize(degree) {
      this.degree = degree;
      this.genPoly = Polynomial.generateECPolynomial(this.degree);
    };
    ReedSolomonEncoder.prototype.encode = function encode(data) {
      if (!this.genPoly) {
        throw new Error("Encoder not initialized");
      }
      const paddedData = new Uint8Array(data.length + this.degree);
      paddedData.set(data);
      const remainder = Polynomial.mod(paddedData, this.genPoly);
      const start = this.degree - remainder.length;
      if (start > 0) {
        const buff = new Uint8Array(this.degree);
        buff.set(remainder, start);
        return buff;
      }
      return remainder;
    };
    module.exports = ReedSolomonEncoder;
  }
});

// node_modules/qrcode/lib/core/version-check.js
var require_version_check = __commonJS({
  "node_modules/qrcode/lib/core/version-check.js"(exports) {
    exports.isValid = function isValid(version) {
      return !isNaN(version) && version >= 1 && version <= 40;
    };
  }
});

// node_modules/qrcode/lib/core/regex.js
var require_regex = __commonJS({
  "node_modules/qrcode/lib/core/regex.js"(exports) {
    var numeric = "[0-9]+";
    var alphanumeric = "[A-Z $%*+\\-./:]+";
    var kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
    kanji = kanji.replace(/u/g, "\\u");
    var byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
    exports.KANJI = new RegExp(kanji, "g");
    exports.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
    exports.BYTE = new RegExp(byte, "g");
    exports.NUMERIC = new RegExp(numeric, "g");
    exports.ALPHANUMERIC = new RegExp(alphanumeric, "g");
    var TEST_KANJI = new RegExp("^" + kanji + "$");
    var TEST_NUMERIC = new RegExp("^" + numeric + "$");
    var TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
    exports.testKanji = function testKanji(str) {
      return TEST_KANJI.test(str);
    };
    exports.testNumeric = function testNumeric(str) {
      return TEST_NUMERIC.test(str);
    };
    exports.testAlphanumeric = function testAlphanumeric(str) {
      return TEST_ALPHANUMERIC.test(str);
    };
  }
});

// node_modules/qrcode/lib/core/mode.js
var require_mode = __commonJS({
  "node_modules/qrcode/lib/core/mode.js"(exports) {
    var VersionCheck = require_version_check();
    var Regex = require_regex();
    exports.NUMERIC = {
      id: "Numeric",
      bit: 1 << 0,
      ccBits: [10, 12, 14]
    };
    exports.ALPHANUMERIC = {
      id: "Alphanumeric",
      bit: 1 << 1,
      ccBits: [9, 11, 13]
    };
    exports.BYTE = {
      id: "Byte",
      bit: 1 << 2,
      ccBits: [8, 16, 16]
    };
    exports.KANJI = {
      id: "Kanji",
      bit: 1 << 3,
      ccBits: [8, 10, 12]
    };
    exports.MIXED = {
      bit: -1
    };
    exports.getCharCountIndicator = function getCharCountIndicator(mode, version) {
      if (!mode.ccBits) throw new Error("Invalid mode: " + mode);
      if (!VersionCheck.isValid(version)) {
        throw new Error("Invalid version: " + version);
      }
      if (version >= 1 && version < 10) return mode.ccBits[0];
      else if (version < 27) return mode.ccBits[1];
      return mode.ccBits[2];
    };
    exports.getBestModeForData = function getBestModeForData(dataStr) {
      if (Regex.testNumeric(dataStr)) return exports.NUMERIC;
      else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC;
      else if (Regex.testKanji(dataStr)) return exports.KANJI;
      else return exports.BYTE;
    };
    exports.toString = function toString(mode) {
      if (mode && mode.id) return mode.id;
      throw new Error("Invalid mode");
    };
    exports.isValid = function isValid(mode) {
      return mode && mode.bit && mode.ccBits;
    };
    function fromString(string) {
      if (typeof string !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string.toLowerCase();
      switch (lcStr) {
        case "numeric":
          return exports.NUMERIC;
        case "alphanumeric":
          return exports.ALPHANUMERIC;
        case "kanji":
          return exports.KANJI;
        case "byte":
          return exports.BYTE;
        default:
          throw new Error("Unknown mode: " + string);
      }
    }
    exports.from = function from(value, defaultValue) {
      if (exports.isValid(value)) {
        return value;
      }
      try {
        return fromString(value);
      } catch (e) {
        return defaultValue;
      }
    };
  }
});

// node_modules/qrcode/lib/core/version.js
var require_version = __commonJS({
  "node_modules/qrcode/lib/core/version.js"(exports) {
    var Utils = require_utils();
    var ECCode = require_error_correction_code();
    var ECLevel = require_error_correction_level();
    var Mode = require_mode();
    var VersionCheck = require_version_check();
    var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
    var G18_BCH = Utils.getBCHDigit(G18);
    function getBestVersionForDataLength(mode, length, errorCorrectionLevel) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    function getReservedBitsCount(mode, version) {
      return Mode.getCharCountIndicator(mode, version) + 4;
    }
    function getTotalBitsFromDataArray(segments, version) {
      let totalBits = 0;
      segments.forEach(function(data) {
        const reservedBits = getReservedBitsCount(data.mode, version);
        totalBits += reservedBits + data.getBitsLength();
      });
      return totalBits;
    }
    function getBestVersionForMixedData(segments, errorCorrectionLevel) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        const length = getTotalBitsFromDataArray(segments, currentVersion);
        if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    exports.from = function from(value, defaultValue) {
      if (VersionCheck.isValid(value)) {
        return parseInt(value, 10);
      }
      return defaultValue;
    };
    exports.getCapacity = function getCapacity(version, errorCorrectionLevel, mode) {
      if (!VersionCheck.isValid(version)) {
        throw new Error("Invalid QR Code version");
      }
      if (typeof mode === "undefined") mode = Mode.BYTE;
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (mode === Mode.MIXED) return dataTotalCodewordsBits;
      const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version);
      switch (mode) {
        case Mode.NUMERIC:
          return Math.floor(usableBits / 10 * 3);
        case Mode.ALPHANUMERIC:
          return Math.floor(usableBits / 11 * 2);
        case Mode.KANJI:
          return Math.floor(usableBits / 13);
        case Mode.BYTE:
        default:
          return Math.floor(usableBits / 8);
      }
    };
    exports.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel) {
      let seg;
      const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);
      if (Array.isArray(data)) {
        if (data.length > 1) {
          return getBestVersionForMixedData(data, ecl);
        }
        if (data.length === 0) {
          return 1;
        }
        seg = data[0];
      } else {
        seg = data;
      }
      return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
    };
    exports.getEncodedBits = function getEncodedBits(version) {
      if (!VersionCheck.isValid(version) || version < 7) {
        throw new Error("Invalid QR Code version");
      }
      let d = version << 12;
      while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
        d ^= G18 << Utils.getBCHDigit(d) - G18_BCH;
      }
      return version << 12 | d;
    };
  }
});

// node_modules/qrcode/lib/core/format-info.js
var require_format_info = __commonJS({
  "node_modules/qrcode/lib/core/format-info.js"(exports) {
    var Utils = require_utils();
    var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
    var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
    var G15_BCH = Utils.getBCHDigit(G15);
    exports.getEncodedBits = function getEncodedBits(errorCorrectionLevel, mask) {
      const data = errorCorrectionLevel.bit << 3 | mask;
      let d = data << 10;
      while (Utils.getBCHDigit(d) - G15_BCH >= 0) {
        d ^= G15 << Utils.getBCHDigit(d) - G15_BCH;
      }
      return (data << 10 | d) ^ G15_MASK;
    };
  }
});

// node_modules/qrcode/lib/core/numeric-data.js
var require_numeric_data = __commonJS({
  "node_modules/qrcode/lib/core/numeric-data.js"(exports, module) {
    var Mode = require_mode();
    function NumericData(data) {
      this.mode = Mode.NUMERIC;
      this.data = data.toString();
    }
    NumericData.getBitsLength = function getBitsLength(length) {
      return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
    };
    NumericData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    NumericData.prototype.getBitsLength = function getBitsLength() {
      return NumericData.getBitsLength(this.data.length);
    };
    NumericData.prototype.write = function write(bitBuffer) {
      let i, group, value;
      for (i = 0; i + 3 <= this.data.length; i += 3) {
        group = this.data.substr(i, 3);
        value = parseInt(group, 10);
        bitBuffer.put(value, 10);
      }
      const remainingNum = this.data.length - i;
      if (remainingNum > 0) {
        group = this.data.substr(i);
        value = parseInt(group, 10);
        bitBuffer.put(value, remainingNum * 3 + 1);
      }
    };
    module.exports = NumericData;
  }
});

// node_modules/qrcode/lib/core/alphanumeric-data.js
var require_alphanumeric_data = __commonJS({
  "node_modules/qrcode/lib/core/alphanumeric-data.js"(exports, module) {
    var Mode = require_mode();
    var ALPHA_NUM_CHARS = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      " ",
      "$",
      "%",
      "*",
      "+",
      "-",
      ".",
      "/",
      ":"
    ];
    function AlphanumericData(data) {
      this.mode = Mode.ALPHANUMERIC;
      this.data = data;
    }
    AlphanumericData.getBitsLength = function getBitsLength(length) {
      return 11 * Math.floor(length / 2) + 6 * (length % 2);
    };
    AlphanumericData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    AlphanumericData.prototype.getBitsLength = function getBitsLength() {
      return AlphanumericData.getBitsLength(this.data.length);
    };
    AlphanumericData.prototype.write = function write(bitBuffer) {
      let i;
      for (i = 0; i + 2 <= this.data.length; i += 2) {
        let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
        value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
        bitBuffer.put(value, 11);
      }
      if (this.data.length % 2) {
        bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
      }
    };
    module.exports = AlphanumericData;
  }
});

// node_modules/qrcode/lib/core/byte-data.js
var require_byte_data = __commonJS({
  "node_modules/qrcode/lib/core/byte-data.js"(exports, module) {
    var Mode = require_mode();
    function ByteData(data) {
      this.mode = Mode.BYTE;
      if (typeof data === "string") {
        this.data = new TextEncoder().encode(data);
      } else {
        this.data = new Uint8Array(data);
      }
    }
    ByteData.getBitsLength = function getBitsLength(length) {
      return length * 8;
    };
    ByteData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    ByteData.prototype.getBitsLength = function getBitsLength() {
      return ByteData.getBitsLength(this.data.length);
    };
    ByteData.prototype.write = function(bitBuffer) {
      for (let i = 0, l = this.data.length; i < l; i++) {
        bitBuffer.put(this.data[i], 8);
      }
    };
    module.exports = ByteData;
  }
});

// node_modules/qrcode/lib/core/kanji-data.js
var require_kanji_data = __commonJS({
  "node_modules/qrcode/lib/core/kanji-data.js"(exports, module) {
    var Mode = require_mode();
    var Utils = require_utils();
    function KanjiData(data) {
      this.mode = Mode.KANJI;
      this.data = data;
    }
    KanjiData.getBitsLength = function getBitsLength(length) {
      return length * 13;
    };
    KanjiData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    KanjiData.prototype.getBitsLength = function getBitsLength() {
      return KanjiData.getBitsLength(this.data.length);
    };
    KanjiData.prototype.write = function(bitBuffer) {
      let i;
      for (i = 0; i < this.data.length; i++) {
        let value = Utils.toSJIS(this.data[i]);
        if (value >= 33088 && value <= 40956) {
          value -= 33088;
        } else if (value >= 57408 && value <= 60351) {
          value -= 49472;
        } else {
          throw new Error(
            "Invalid SJIS character: " + this.data[i] + "\nMake sure your charset is UTF-8"
          );
        }
        value = (value >>> 8 & 255) * 192 + (value & 255);
        bitBuffer.put(value, 13);
      }
    };
    module.exports = KanjiData;
  }
});

// node_modules/dijkstrajs/dijkstra.js
var require_dijkstra = __commonJS({
  "node_modules/dijkstrajs/dijkstra.js"(exports, module) {
    "use strict";
    var dijkstra = {
      single_source_shortest_paths: function(graph, s, d) {
        var predecessors = {};
        var costs = {};
        costs[s] = 0;
        var open = dijkstra.PriorityQueue.make();
        open.push(s, 0);
        var closest, u, v, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
        while (!open.empty()) {
          closest = open.pop();
          u = closest.value;
          cost_of_s_to_u = closest.cost;
          adjacent_nodes = graph[u] || {};
          for (v in adjacent_nodes) {
            if (adjacent_nodes.hasOwnProperty(v)) {
              cost_of_e = adjacent_nodes[v];
              cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
              cost_of_s_to_v = costs[v];
              first_visit = typeof costs[v] === "undefined";
              if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
                costs[v] = cost_of_s_to_u_plus_cost_of_e;
                open.push(v, cost_of_s_to_u_plus_cost_of_e);
                predecessors[v] = u;
              }
            }
          }
        }
        if (typeof d !== "undefined" && typeof costs[d] === "undefined") {
          var msg = ["Could not find a path from ", s, " to ", d, "."].join("");
          throw new Error(msg);
        }
        return predecessors;
      },
      extract_shortest_path_from_predecessor_list: function(predecessors, d) {
        var nodes = [];
        var u = d;
        var predecessor;
        while (u) {
          nodes.push(u);
          predecessor = predecessors[u];
          u = predecessors[u];
        }
        nodes.reverse();
        return nodes;
      },
      find_path: function(graph, s, d) {
        var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
        return dijkstra.extract_shortest_path_from_predecessor_list(
          predecessors,
          d
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(opts) {
          var T = dijkstra.PriorityQueue, t = {}, key;
          opts = opts || {};
          for (key in T) {
            if (T.hasOwnProperty(key)) {
              t[key] = T[key];
            }
          }
          t.queue = [];
          t.sorter = opts.sorter || T.default_sorter;
          return t;
        },
        default_sorter: function(a, b) {
          return a.cost - b.cost;
        },
        /**
         * Add a new item to the queue and ensure the highest priority element
         * is at the front of the queue.
         */
        push: function(value, cost) {
          var item = { value, cost };
          this.queue.push(item);
          this.queue.sort(this.sorter);
        },
        /**
         * Return the highest priority element in the queue.
         */
        pop: function() {
          return this.queue.shift();
        },
        empty: function() {
          return this.queue.length === 0;
        }
      }
    };
    if (typeof module !== "undefined") {
      module.exports = dijkstra;
    }
  }
});

// node_modules/qrcode/lib/core/segments.js
var require_segments = __commonJS({
  "node_modules/qrcode/lib/core/segments.js"(exports) {
    var Mode = require_mode();
    var NumericData = require_numeric_data();
    var AlphanumericData = require_alphanumeric_data();
    var ByteData = require_byte_data();
    var KanjiData = require_kanji_data();
    var Regex = require_regex();
    var Utils = require_utils();
    var dijkstra = require_dijkstra();
    function getStringByteLength(str) {
      return unescape(encodeURIComponent(str)).length;
    }
    function getSegments(regex, mode, str) {
      const segments = [];
      let result;
      while ((result = regex.exec(str)) !== null) {
        segments.push({
          data: result[0],
          index: result.index,
          mode,
          length: result[0].length
        });
      }
      return segments;
    }
    function getSegmentsFromString(dataStr) {
      const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
      const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
      let byteSegs;
      let kanjiSegs;
      if (Utils.isKanjiModeEnabled()) {
        byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
        kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
      } else {
        byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
        kanjiSegs = [];
      }
      const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
      return segs.sort(function(s1, s2) {
        return s1.index - s2.index;
      }).map(function(obj) {
        return {
          data: obj.data,
          mode: obj.mode,
          length: obj.length
        };
      });
    }
    function getSegmentBitsLength(length, mode) {
      switch (mode) {
        case Mode.NUMERIC:
          return NumericData.getBitsLength(length);
        case Mode.ALPHANUMERIC:
          return AlphanumericData.getBitsLength(length);
        case Mode.KANJI:
          return KanjiData.getBitsLength(length);
        case Mode.BYTE:
          return ByteData.getBitsLength(length);
      }
    }
    function mergeSegments(segs) {
      return segs.reduce(function(acc, curr) {
        const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
        if (prevSeg && prevSeg.mode === curr.mode) {
          acc[acc.length - 1].data += curr.data;
          return acc;
        }
        acc.push(curr);
        return acc;
      }, []);
    }
    function buildNodes(segs) {
      const nodes = [];
      for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        switch (seg.mode) {
          case Mode.NUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.ALPHANUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.KANJI:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
            break;
          case Mode.BYTE:
            nodes.push([
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
        }
      }
      return nodes;
    }
    function buildGraph(nodes, version) {
      const table = {};
      const graph = { start: {} };
      let prevNodeIds = ["start"];
      for (let i = 0; i < nodes.length; i++) {
        const nodeGroup = nodes[i];
        const currentNodeIds = [];
        for (let j = 0; j < nodeGroup.length; j++) {
          const node = nodeGroup[j];
          const key = "" + i + j;
          currentNodeIds.push(key);
          table[key] = { node, lastCount: 0 };
          graph[key] = {};
          for (let n = 0; n < prevNodeIds.length; n++) {
            const prevNodeId = prevNodeIds[n];
            if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
              graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
              table[prevNodeId].lastCount += node.length;
            } else {
              if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;
              graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode.getCharCountIndicator(node.mode, version);
            }
          }
        }
        prevNodeIds = currentNodeIds;
      }
      for (let n = 0; n < prevNodeIds.length; n++) {
        graph[prevNodeIds[n]].end = 0;
      }
      return { map: graph, table };
    }
    function buildSingleSegment(data, modesHint) {
      let mode;
      const bestMode = Mode.getBestModeForData(data);
      mode = Mode.from(modesHint, bestMode);
      if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
        throw new Error('"' + data + '" cannot be encoded with mode ' + Mode.toString(mode) + ".\n Suggested mode is: " + Mode.toString(bestMode));
      }
      if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
        mode = Mode.BYTE;
      }
      switch (mode) {
        case Mode.NUMERIC:
          return new NumericData(data);
        case Mode.ALPHANUMERIC:
          return new AlphanumericData(data);
        case Mode.KANJI:
          return new KanjiData(data);
        case Mode.BYTE:
          return new ByteData(data);
      }
    }
    exports.fromArray = function fromArray(array) {
      return array.reduce(function(acc, seg) {
        if (typeof seg === "string") {
          acc.push(buildSingleSegment(seg, null));
        } else if (seg.data) {
          acc.push(buildSingleSegment(seg.data, seg.mode));
        }
        return acc;
      }, []);
    };
    exports.fromString = function fromString(data, version) {
      const segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled());
      const nodes = buildNodes(segs);
      const graph = buildGraph(nodes, version);
      const path = dijkstra.find_path(graph.map, "start", "end");
      const optimizedSegs = [];
      for (let i = 1; i < path.length - 1; i++) {
        optimizedSegs.push(graph.table[path[i]].node);
      }
      return exports.fromArray(mergeSegments(optimizedSegs));
    };
    exports.rawSplit = function rawSplit(data) {
      return exports.fromArray(
        getSegmentsFromString(data, Utils.isKanjiModeEnabled())
      );
    };
  }
});

// node_modules/qrcode/lib/core/qrcode.js
var require_qrcode = __commonJS({
  "node_modules/qrcode/lib/core/qrcode.js"(exports) {
    var Utils = require_utils();
    var ECLevel = require_error_correction_level();
    var BitBuffer = require_bit_buffer();
    var BitMatrix = require_bit_matrix();
    var AlignmentPattern = require_alignment_pattern();
    var FinderPattern = require_finder_pattern();
    var MaskPattern = require_mask_pattern();
    var ECCode = require_error_correction_code();
    var ReedSolomonEncoder = require_reed_solomon_encoder();
    var Version = require_version();
    var FormatInfo = require_format_info();
    var Mode = require_mode();
    var Segments = require_segments();
    function setupFinderPattern(matrix, version) {
      const size = matrix.size;
      const pos = FinderPattern.getPositions(version);
      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];
        for (let r = -1; r <= 7; r++) {
          if (row + r <= -1 || size <= row + r) continue;
          for (let c = -1; c <= 7; c++) {
            if (col + c <= -1 || size <= col + c) continue;
            if (r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4) {
              matrix.set(row + r, col + c, true, true);
            } else {
              matrix.set(row + r, col + c, false, true);
            }
          }
        }
      }
    }
    function setupTimingPattern(matrix) {
      const size = matrix.size;
      for (let r = 8; r < size - 8; r++) {
        const value = r % 2 === 0;
        matrix.set(r, 6, value, true);
        matrix.set(6, r, value, true);
      }
    }
    function setupAlignmentPattern(matrix, version) {
      const pos = AlignmentPattern.getPositions(version);
      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0) {
              matrix.set(row + r, col + c, true, true);
            } else {
              matrix.set(row + r, col + c, false, true);
            }
          }
        }
      }
    }
    function setupVersionInfo(matrix, version) {
      const size = matrix.size;
      const bits = Version.getEncodedBits(version);
      let row, col, mod;
      for (let i = 0; i < 18; i++) {
        row = Math.floor(i / 3);
        col = i % 3 + size - 8 - 3;
        mod = (bits >> i & 1) === 1;
        matrix.set(row, col, mod, true);
        matrix.set(col, row, mod, true);
      }
    }
    function setupFormatInfo(matrix, errorCorrectionLevel, maskPattern) {
      const size = matrix.size;
      const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
      let i, mod;
      for (i = 0; i < 15; i++) {
        mod = (bits >> i & 1) === 1;
        if (i < 6) {
          matrix.set(i, 8, mod, true);
        } else if (i < 8) {
          matrix.set(i + 1, 8, mod, true);
        } else {
          matrix.set(size - 15 + i, 8, mod, true);
        }
        if (i < 8) {
          matrix.set(8, size - i - 1, mod, true);
        } else if (i < 9) {
          matrix.set(8, 15 - i - 1 + 1, mod, true);
        } else {
          matrix.set(8, 15 - i - 1, mod, true);
        }
      }
      matrix.set(size - 8, 8, 1, true);
    }
    function setupData(matrix, data) {
      const size = matrix.size;
      let inc = -1;
      let row = size - 1;
      let bitIndex = 7;
      let byteIndex = 0;
      for (let col = size - 1; col > 0; col -= 2) {
        if (col === 6) col--;
        while (true) {
          for (let c = 0; c < 2; c++) {
            if (!matrix.isReserved(row, col - c)) {
              let dark = false;
              if (byteIndex < data.length) {
                dark = (data[byteIndex] >>> bitIndex & 1) === 1;
              }
              matrix.set(row, col - c, dark);
              bitIndex--;
              if (bitIndex === -1) {
                byteIndex++;
                bitIndex = 7;
              }
            }
          }
          row += inc;
          if (row < 0 || size <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    }
    function createData(version, errorCorrectionLevel, segments) {
      const buffer = new BitBuffer();
      segments.forEach(function(data) {
        buffer.put(data.mode.bit, 4);
        buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version));
        data.write(buffer);
      });
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
        buffer.put(0, 4);
      }
      while (buffer.getLengthInBits() % 8 !== 0) {
        buffer.putBit(0);
      }
      const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
      for (let i = 0; i < remainingByte; i++) {
        buffer.put(i % 2 ? 17 : 236, 8);
      }
      return createCodewords(buffer, version, errorCorrectionLevel);
    }
    function createCodewords(bitBuffer, version, errorCorrectionLevel) {
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewords = totalCodewords - ecTotalCodewords;
      const ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel);
      const blocksInGroup2 = totalCodewords % ecTotalBlocks;
      const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
      const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
      const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
      const rs = new ReedSolomonEncoder(ecCount);
      let offset = 0;
      const dcData = new Array(ecTotalBlocks);
      const ecData = new Array(ecTotalBlocks);
      let maxDataSize = 0;
      const buffer = new Uint8Array(bitBuffer.buffer);
      for (let b = 0; b < ecTotalBlocks; b++) {
        const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
        dcData[b] = buffer.slice(offset, offset + dataSize);
        ecData[b] = rs.encode(dcData[b]);
        offset += dataSize;
        maxDataSize = Math.max(maxDataSize, dataSize);
      }
      const data = new Uint8Array(totalCodewords);
      let index = 0;
      let i, r;
      for (i = 0; i < maxDataSize; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          if (i < dcData[r].length) {
            data[index++] = dcData[r][i];
          }
        }
      }
      for (i = 0; i < ecCount; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          data[index++] = ecData[r][i];
        }
      }
      return data;
    }
    function createSymbol(data, version, errorCorrectionLevel, maskPattern) {
      let segments;
      if (Array.isArray(data)) {
        segments = Segments.fromArray(data);
      } else if (typeof data === "string") {
        let estimatedVersion = version;
        if (!estimatedVersion) {
          const rawSegments = Segments.rawSplit(data);
          estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel);
        }
        segments = Segments.fromString(data, estimatedVersion || 40);
      } else {
        throw new Error("Invalid data");
      }
      const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel);
      if (!bestVersion) {
        throw new Error("The amount of data is too big to be stored in a QR Code");
      }
      if (!version) {
        version = bestVersion;
      } else if (version < bestVersion) {
        throw new Error(
          "\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n"
        );
      }
      const dataBits = createData(version, errorCorrectionLevel, segments);
      const moduleCount = Utils.getSymbolSize(version);
      const modules = new BitMatrix(moduleCount);
      setupFinderPattern(modules, version);
      setupTimingPattern(modules);
      setupAlignmentPattern(modules, version);
      setupFormatInfo(modules, errorCorrectionLevel, 0);
      if (version >= 7) {
        setupVersionInfo(modules, version);
      }
      setupData(modules, dataBits);
      if (isNaN(maskPattern)) {
        maskPattern = MaskPattern.getBestMask(
          modules,
          setupFormatInfo.bind(null, modules, errorCorrectionLevel)
        );
      }
      MaskPattern.applyMask(maskPattern, modules);
      setupFormatInfo(modules, errorCorrectionLevel, maskPattern);
      return {
        modules,
        version,
        errorCorrectionLevel,
        maskPattern,
        segments
      };
    }
    exports.create = function create(data, options) {
      if (typeof data === "undefined" || data === "") {
        throw new Error("No input text");
      }
      let errorCorrectionLevel = ECLevel.M;
      let version;
      let mask;
      if (typeof options !== "undefined") {
        errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
        version = Version.from(options.version);
        mask = MaskPattern.from(options.maskPattern);
        if (options.toSJISFunc) {
          Utils.setToSJISFunction(options.toSJISFunc);
        }
      }
      return createSymbol(data, version, errorCorrectionLevel, mask);
    };
  }
});

// node_modules/qrcode/lib/renderer/utils.js
var require_utils2 = __commonJS({
  "node_modules/qrcode/lib/renderer/utils.js"(exports) {
    function hex2rgba(hex) {
      if (typeof hex === "number") {
        hex = hex.toString();
      }
      if (typeof hex !== "string") {
        throw new Error("Color should be defined as hex string");
      }
      let hexCode = hex.slice().replace("#", "").split("");
      if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
        throw new Error("Invalid hex color: " + hex);
      }
      if (hexCode.length === 3 || hexCode.length === 4) {
        hexCode = Array.prototype.concat.apply([], hexCode.map(function(c) {
          return [c, c];
        }));
      }
      if (hexCode.length === 6) hexCode.push("F", "F");
      const hexValue = parseInt(hexCode.join(""), 16);
      return {
        r: hexValue >> 24 & 255,
        g: hexValue >> 16 & 255,
        b: hexValue >> 8 & 255,
        a: hexValue & 255,
        hex: "#" + hexCode.slice(0, 6).join("")
      };
    }
    exports.getOptions = function getOptions(options) {
      if (!options) options = {};
      if (!options.color) options.color = {};
      const margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
      const width = options.width && options.width >= 21 ? options.width : void 0;
      const scale = options.scale || 4;
      return {
        width,
        scale: width ? 4 : scale,
        margin,
        color: {
          dark: hex2rgba(options.color.dark || "#000000ff"),
          light: hex2rgba(options.color.light || "#ffffffff")
        },
        type: options.type,
        rendererOpts: options.rendererOpts || {}
      };
    };
    exports.getScale = function getScale(qrSize, opts) {
      return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
    };
    exports.getImageWidth = function getImageWidth(qrSize, opts) {
      const scale = exports.getScale(qrSize, opts);
      return Math.floor((qrSize + opts.margin * 2) * scale);
    };
    exports.qrToImageData = function qrToImageData(imgData, qr, opts) {
      const size = qr.modules.size;
      const data = qr.modules.data;
      const scale = exports.getScale(size, opts);
      const symbolSize = Math.floor((size + opts.margin * 2) * scale);
      const scaledMargin = opts.margin * scale;
      const palette = [opts.color.light, opts.color.dark];
      for (let i = 0; i < symbolSize; i++) {
        for (let j = 0; j < symbolSize; j++) {
          let posDst = (i * symbolSize + j) * 4;
          let pxColor = opts.color.light;
          if (i >= scaledMargin && j >= scaledMargin && i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
            const iSrc = Math.floor((i - scaledMargin) / scale);
            const jSrc = Math.floor((j - scaledMargin) / scale);
            pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
          }
          imgData[posDst++] = pxColor.r;
          imgData[posDst++] = pxColor.g;
          imgData[posDst++] = pxColor.b;
          imgData[posDst] = pxColor.a;
        }
      }
    };
  }
});

// node_modules/qrcode/lib/renderer/svg-tag.js
var require_svg_tag = __commonJS({
  "node_modules/qrcode/lib/renderer/svg-tag.js"(exports) {
    var Utils = require_utils2();
    function getColorAttrib(color, attrib) {
      const alpha = color.a / 255;
      const str = attrib + '="' + color.hex + '"';
      return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
    }
    function svgCmd(cmd, x, y) {
      let str = cmd + x;
      if (typeof y !== "undefined") str += " " + y;
      return str;
    }
    function qrToPath(data, size, margin) {
      let path = "";
      let moveBy = 0;
      let newRow = false;
      let lineLength = 0;
      for (let i = 0; i < data.length; i++) {
        const col = Math.floor(i % size);
        const row = Math.floor(i / size);
        if (!col && !newRow) newRow = true;
        if (data[i]) {
          lineLength++;
          if (!(i > 0 && col > 0 && data[i - 1])) {
            path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
            moveBy = 0;
            newRow = false;
          }
          if (!(col + 1 < size && data[i + 1])) {
            path += svgCmd("h", lineLength);
            lineLength = 0;
          }
        } else {
          moveBy++;
        }
      }
      return path;
    }
    exports.render = function render(qrData, options, cb) {
      const opts = Utils.getOptions(options);
      const size = qrData.modules.size;
      const data = qrData.modules.data;
      const qrcodesize = size + opts.margin * 2;
      const bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
      const path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size, opts.margin) + '"/>';
      const viewBox = 'viewBox="0 0 ' + qrcodesize + " " + qrcodesize + '"';
      const width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
      const svgTag = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + "</svg>\n";
      if (typeof cb === "function") {
        cb(null, svgTag);
      }
      return svgTag;
    };
  }
});

// worker/src/admin-page.generated.js
var ADMIN_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>Admin \u2014 Jackie\u2019s Studio</title>
<meta name="theme-color" content="#000000">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
/* Shared styles for the admin and client video pages. Same tokens as css/style.css. */
:root {
  --void: #000; --bone: #efe7da; --ash: #8a847b; --molten: #ffb23f; --ember: #ff5a1e; --iris: #8c8cff;
  --line: rgba(239,231,218,.16); --panel: #0b0b0b;
  --display: "Archivo", "Helvetica Neue", Arial, sans-serif;
  --serif: "Instrument Serif", "Times New Roman", serif;
  --gutter: clamp(16px, 2.2vw, 36px);
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { background: var(--void); color: var(--bone); -webkit-text-size-adjust: 100%; }
body { background: var(--void); color: var(--bone); font-family: var(--display); font-variation-settings: "wdth" 100; -webkit-font-smoothing: antialiased; min-height: 100vh; }
a { color: inherit; }
button, input { font: inherit; color: inherit; }
::selection { background: var(--molten); color: #000; }
:focus-visible { outline: 2px solid var(--molten); outline-offset: 3px; }
[hidden] { display: none !important; }

.ui { font-size: 11px; font-weight: 600; font-variation-settings: "wdth" 88; letter-spacing: .06em; text-transform: uppercase; }
.top { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 18px var(--gutter); }
.top a { text-decoration: none; }
.top .mark { justify-self: center; } .top .mark em { font-style: normal; color: var(--ash); margin-left: .6em; }
.top .end { justify-self: end; }
.wrap { width: min(1180px, 100%); margin: 0 auto; padding: 6vh var(--gutter) 12vh; }

.kicker { font-family: var(--serif); font-style: italic; font-size: clamp(18px, 1.8vw, 28px); color: var(--ash); }
.title { font-size: clamp(40px, 7vw, 120px); line-height: .88; font-weight: 900; font-variation-settings: "wdth" 118; letter-spacing: -.045em; text-transform: uppercase; margin: 14px 0 0; overflow-wrap: anywhere; }
.h2 { font-size: clamp(26px, 3vw, 44px); line-height: .95; font-weight: 850; font-variation-settings: "wdth" 112; letter-spacing: -.035em; text-transform: uppercase; }
.serif { font-family: var(--serif); font-size: clamp(17px, 1.3vw, 21px); line-height: 1.4; color: var(--ash); }
.serif b { color: var(--bone); font-weight: 400; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: .6em; padding: 1.25em 2.1em; border: 1px solid currentColor; border-radius: 999px; background: none; cursor: pointer; text-decoration: none; white-space: nowrap; transition: background .3s, color .3s, border-color .3s; }
.btn:hover { background: var(--bone); color: #000; border-color: var(--bone); }
.btn--solid { background: var(--bone); color: #000; border-color: var(--bone); }
.btn--solid:hover { background: var(--molten); border-color: var(--molten); }
.btn--small { padding: .9em 1.4em; }
.btn--danger:hover { background: var(--ember); border-color: var(--ember); color: #000; }
.btn[disabled] { opacity: .4; pointer-events: none; }

.field { display: grid; gap: 8px; }
.field span { color: var(--ash); }
.input { width: 100%; padding: 14px 16px; background: #000; border: 1px solid var(--line); border-radius: 6px; font-size: 16px; }
.input:focus { border-color: var(--bone); outline: none; }
.msg { min-height: 1.4em; font-family: var(--serif); font-size: 17px; color: var(--ash); }
.msg.err { color: var(--ember); } .msg.ok { color: var(--molten); }

.panel { border: 1px solid var(--line); border-radius: 8px; background: var(--panel); padding: clamp(18px, 2.4vw, 32px); }
.chip { display: inline-flex; align-items: center; gap: .5em; padding: .55em 1em; border: 1px solid var(--line); border-radius: 999px; color: var(--ash); }
.chip::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.chip.on { color: var(--molten); border-color: rgba(255,178,63,.4); }
.chip.bad { color: var(--ember); border-color: rgba(255,90,30,.4); }
.chip.good { color: #7fe0a0; border-color: rgba(127,224,160,.35); }

.grain { position: fixed; inset: -50%; width: 200%; height: 200%; z-index: 50; pointer-events: none; opacity: .07;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -.2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }

@media (max-width: 760px) {
  .top { grid-template-columns: 1fr auto; } .top .mark { display: none; }
}

</style>
<style>
  .login { max-width: 460px; display: grid; gap: 20px; margin-top: 8vh; }
  .bar { display: flex; justify-content: space-between; align-items: end; gap: 20px; flex-wrap: wrap; margin-bottom: 5vh; }
  .up { display: grid; grid-template-columns: 1.2fr 1.4fr .7fr; gap: 16px; }
  .up .file { grid-column: 1 / -1; }
  .drop { display: grid; place-items: center; gap: 6px; min-height: 140px; border: 1px dashed rgba(239,231,218,.3); border-radius: 8px; text-align: center; padding: 20px; cursor: pointer; transition: border-color .3s, background .3s; }
  .drop:hover, .drop.is-over { border-color: var(--molten); background: rgba(255,178,63,.05); }
  .drop input { position: absolute; width: 1px; height: 1px; opacity: 0; }
  .prog { height: 2px; background: rgba(239,231,218,.15); border-radius: 2px; overflow: hidden; }
  .prog i { display: block; height: 100%; width: 0; background: var(--molten); transition: width .2s; }
  .acts { grid-column: 1 / -1; display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
  .list { display: grid; gap: 14px; margin-top: 5vh; }
  .job { display: grid; grid-template-columns: 1fr auto; gap: 14px 24px; align-items: start; }
  .job h3 { font-size: clamp(20px, 2vw, 30px); line-height: 1; font-weight: 850; font-variation-settings: "wdth" 110; letter-spacing: -.03em; text-transform: uppercase; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .btns { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; max-width: 420px; }
  .link { grid-column: 1 / -1; display: flex; gap: 10px; align-items: center; }
  .link .input { font-size: 14px; padding: 10px 12px; color: var(--ash); }
  .empty { margin-top: 4vh; }
  .drive { grid-column: 1 / -1; display: grid; gap: 14px; }
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .drive code { color: var(--bone); font-family: var(--display); font-weight: 600; overflow-wrap: anywhere; }
  .warn { color: var(--molten); }
  @media (max-width: 760px) { .up, .two { grid-template-columns: 1fr; } .job { grid-template-columns: 1fr; } .btns { justify-content: flex-start; } }
</style>
</head>
<body>
<header class="top ui">
  <a href="/">Jackie\u2019s Studio\xAE</a>
  <span class="mark">Admin <em>client video delivery</em></span>
  <button class="end ui btn btn--small" id="logout" hidden>Log out</button>
</header>

<main class="wrap">
  <section id="loginView" class="login" hidden>
    <p class="kicker">Only for Jackie.</p>
    <h1 class="title">Admin</h1>
    <form id="loginForm" class="form" style="display:grid;gap:14px">
      <label class="field"><span class="ui">Password</span><input class="input" type="password" id="pw" autocomplete="current-password" required></label>
      <button class="btn btn--solid ui" type="submit">Log in</button>
      <p class="msg" id="loginMsg"></p>
    </form>
  </section>

  <section id="appView" hidden>
    <div class="bar">
      <div>
        <p class="kicker">Upload an edit, send the link, get paid.</p>
        <h1 class="title">Deliveries</h1>
      </div>
      <p class="serif warn" id="upiWarn" hidden>UPI_ID is not set on the server, so clients won't see a QR code.</p>
    </div>

    <form id="upForm" class="panel up">
      <label class="field"><span class="ui">Client name</span><input class="input" name="client" required maxlength="80" placeholder="e.g. Priya"></label>
      <label class="field"><span class="ui">Project title</span><input class="input" name="title" maxlength="120" placeholder="e.g. Wedding highlight reel"></label>
      <label class="field"><span class="ui">Price (\u20B9)</span><input class="input" name="price" type="number" min="1" step="1" required placeholder="2500"></label>
      <label class="drop file" id="drop">
        <input type="file" name="video" id="file" accept="video/*" required>
        <span class="h2" style="font-size:22px" id="fileName">Drop the edited video here</span>
        <span class="serif">or click to choose \xB7 the client gets a watermarked one-time preview, the full file unlocks after payment</span>
      </label>
      <div class="drive" id="driveFields" hidden>
        <p class="serif" id="driveHelp">Export the watermarked preview and the final video from your editor, upload both to your Drive folder, then pick them here.</p>
        <div class="two">
          <label class="field"><span class="ui">Preview (watermarked, the client watches it once)</span><input class="input" name="preview" list="driveList" autocomplete="off" placeholder="Pick from Drive or paste a Drive link"></label>
          <label class="field"><span class="ui">Final video (unlocks after payment)</span><input class="input" name="final" list="driveList" autocomplete="off" placeholder="Pick from Drive or paste a Drive link"></label>
        </div>
        <datalist id="driveList"></datalist>
        <p class="msg" id="driveMsg"></p>
      </div>
      <div class="acts">
        <button class="btn btn--solid ui" type="submit" id="upBtn">Upload &amp; create link</button>
        <div class="prog" style="flex:1 1 160px" hidden id="prog"><i></i></div>
        <p class="msg" id="upMsg"></p>
      </div>
    </form>

    <div class="list" id="list"></div>
    <p class="serif empty" id="empty" hidden>No deliveries yet. Upload your first edit above.</p>
  </section>
</main>
<div class="grain" aria-hidden="true"></div>
<script>
/* Admin: upload edits, copy client links, confirm UPI payments. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const inr = (n) => '\u20B9' + Number(n).toLocaleString('en-IN');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const when = (t) => (t ? new Date(t).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');
  const mb = (b) => (b / 1048576).toFixed(b > 1e9 ? 0 : 1) + ' MB';
  async function call(path, opt = {}) {
    const r = await fetch(path, { cache: 'no-store', ...opt });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401 && path !== '/api/admin/login') { showLogin(); throw new Error(j.error || 'Please log in.'); }
    if (!r.ok) throw new Error(j.error || 'Something went wrong.');
    return j;
  }
  const post = (path, body) => call(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });

  let timer = null;
  let mode = 'upload';
  function showLogin() { $('#loginView').hidden = false; $('#appView').hidden = true; $('#logout').hidden = true; clearTimeout(timer); setTimeout(() => $('#pw').focus(), 50); }
  function showApp(me) {
    $('#loginView').hidden = true; $('#appView').hidden = false; $('#logout').hidden = false; $('#upiWarn').hidden = !!me.upiConfigured;
    mode = me.mode || 'upload';
    if (mode === 'drive') {
      $('#drop').hidden = true; $('#file').required = false;
      $('#driveFields').hidden = false;
      $('#upBtn').textContent = 'Create link';
      if (me.serviceEmail) $('#driveHelp').innerHTML = \`Upload the watermarked preview and the final video to your Drive folder, then pick them here. The folder must be shared with <code>\${esc(me.serviceEmail)}</code> (Viewer).\`;
      if (me.folder) loadDrive();
    }
    load();
  }
  async function loadDrive() {
    const m = $('#driveMsg');
    try {
      const files = await call('/api/admin/drive-files');
      $('#driveList').innerHTML = files.map((f) => \`<option value="\${esc(f.name)}">\${esc(mb(f.size))}</option>\`).join('');
      m.className = 'msg'; m.textContent = files.length ? \`\${files.length} videos in your Drive folder.\` : 'No videos in your Drive folder yet. Upload them in Google Drive, then reload this page.';
    } catch (err) { m.className = 'msg err'; m.textContent = err.message; }
  }

  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const m = $('#loginMsg'); m.className = 'msg'; m.textContent = '';
    try { await post('/api/admin/login', { password: $('#pw').value }); $('#pw').value = ''; showApp(await call('/api/admin/me')); }
    catch (err) { m.className = 'msg err'; m.textContent = err.message; }
  });
  $('#logout').addEventListener('click', async () => { await post('/api/admin/logout').catch(() => {}); showLogin(); });

  // ---------- list ----------
  function chips(j) {
    const c = [];
    if (j.previewStatus === 'processing') c.push(['on', 'Making preview\u2026']);
    else if (j.previewStatus === 'failed') c.push(['bad', 'Preview failed']);
    else c.push(j.previewState === 'used' ? ['on', 'Preview watched ' + when(j.previewWatchedAt)] : ['', 'Preview not watched yet']);
    if (j.paid) c.push(['good', 'Paid ' + when(j.paidAt)]);
    else if (j.utr) c.push(['on', 'Client says paid \xB7 UTR ' + j.utr]);
    else c.push(['', 'Not paid']);
    if (j.downloads) c.push(['good', \`Downloaded \${j.downloads}\xD7\`]);
    return c.map(([k, t]) => \`<span class="chip ui \${k}">\${esc(t)}</span>\`).join('');
  }
  function card(j) {
    const url = new URL(j.link, location.href).href;
    return \`<article class="panel job" data-id="\${esc(j.id)}">
      <div>
        <p class="ui" style="color:var(--ash)">\${esc(j.client)} \xB7 \${inr(j.price)} \xB7 \${esc(mb(j.size))} \xB7 Code <b style="color:var(--molten);letter-spacing:.14em">\${esc(j.code || '')}</b></p>
        <h3 style="margin-top:8px">\${esc(j.title)}</h3>
        <div class="chips">\${chips(j)}</div>
        \${j.previewStatus === 'failed' ? \`<p class="msg err" style="margin-top:10px">\${esc(j.previewError)}</p>\` : ''}
      </div>
      <div class="btns">
        \${j.paid
          ? '<button class="btn btn--small ui" data-act="unpaid">Mark as unpaid</button>'
          : '<button class="btn btn--small btn--solid ui" data-act="paid">Mark as paid</button>'}
        \${j.previewState === 'used' ? '<button class="btn btn--small ui" data-act="reset">Allow one more preview</button>' : ''}
        <button class="btn btn--small btn--danger ui" data-act="delete">Delete</button>
      </div>
      <div class="link">
        <input class="input" readonly value="\${esc(url)}" aria-label="Client link">
        <button class="btn btn--small ui" data-act="copy" data-url="\${esc(url)}">Copy link</button>
        <a class="btn btn--small ui" href="\${esc(j.link)}" target="_blank" rel="noopener">Open</a>
        <a class="btn btn--small ui" target="_blank" rel="noopener" href="https://wa.me/?text=\${encodeURIComponent(\`Hi \${j.client}, your video "\${j.title}" is ready! Watch the preview here: \${url}  (or go to \${new URL('/delivery', url).href} and enter code \${j.code})\`)}">Send on WhatsApp</a>
      </div>
    </article>\`;
  }
  async function load() {
    clearTimeout(timer);
    try {
      const jobs = await call('/api/admin/jobs');
      const list = $('#list');
      const focused = document.activeElement && list.contains(document.activeElement);
      if (!focused) list.innerHTML = jobs.map(card).join('');
      $('#empty').hidden = jobs.length > 0;
      timer = setTimeout(load, jobs.some((j) => j.previewStatus === 'processing') ? 3000 : 15000);
    } catch (err) { if (!$('#loginView').hidden) return; alertMsg('Could not load deliveries: ' + err.message); }
  }
  $('#list').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const id = b.closest('.job').dataset.id;
    const act = b.dataset.act;
    try {
      if (act === 'copy') {
        try { await navigator.clipboard.writeText(b.dataset.url); b.textContent = 'Copied'; } catch { b.previousElementSibling.select(); b.textContent = 'Press Ctrl+C'; }
        setTimeout(() => { b.textContent = 'Copy link'; }, 2000);
        return;
      }
      if (act === 'delete' && b.dataset.sure !== '1') {
        b.dataset.sure = '1'; b.textContent = 'Tap again to delete';
        setTimeout(() => { b.dataset.sure = ''; b.textContent = 'Delete'; }, 3500);
        return;
      }
      b.disabled = true;
      if (act === 'paid' || act === 'unpaid') await post(\`/api/admin/jobs/\${id}/paid\`, { paid: act === 'paid' });
      if (act === 'reset') await post(\`/api/admin/jobs/\${id}/reset-preview\`);
      if (act === 'delete') await call(\`/api/admin/jobs/\${id}\`, { method: 'DELETE' });
      b.blur(); load();
    } catch (err) { b.disabled = false; alertMsg(err.message); }
  });
  function alertMsg(t) { const m = $('#upMsg'); m.className = 'msg err'; m.textContent = t; }

  // ---------- upload ----------
  const file = $('#file'), drop = $('#drop');
  file.addEventListener('change', () => { $('#fileName').textContent = file.files[0] ? \`\${file.files[0].name} \xB7 \${mb(file.files[0].size)}\` : 'Drop the edited video here'; });
  ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, () => drop.classList.remove('is-over')));
  drop.addEventListener('drop', (e) => { e.preventDefault(); if (e.dataTransfer.files[0]) { file.files = e.dataTransfer.files; file.dispatchEvent(new Event('change')); } });

  $('#upForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget, m = $('#upMsg'), prog = $('#prog'), bar = $('#prog i'), btn = $('#upBtn');
    if (mode === 'drive') {
      const f = Object.fromEntries(new FormData(form));
      btn.disabled = true; m.className = 'msg'; m.textContent = 'Checking the Drive files\u2026';
      try {
        await post('/api/admin/jobs', { client: f.client, title: f.title, price: f.price, preview: f.preview, final: f.final });
        m.className = 'msg ok'; m.textContent = 'Done. Copy the link or press Send on WhatsApp below.';
        form.reset(); load();
      } catch (err) { m.className = 'msg err'; m.textContent = err.message; }
      btn.disabled = false;
      return;
    }
    if (!file.files[0]) { m.className = 'msg err'; m.textContent = 'Choose a video file first.'; return; }
    const fd = new FormData(form);
    fd.delete('video'); fd.append('video', file.files[0]); // file last, so the text fields arrive first
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/jobs');
    prog.hidden = false; bar.style.width = '0'; btn.disabled = true; m.className = 'msg'; m.textContent = 'Uploading\u2026';
    xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) { const p = ev.loaded / ev.total; bar.style.width = (p * 100).toFixed(1) + '%'; m.textContent = \`Uploading\u2026 \${Math.round(p * 100)}%\`; } };
    xhr.onload = () => {
      btn.disabled = false; prog.hidden = true;
      let j = {}; try { j = JSON.parse(xhr.responseText); } catch { /* */ }
      if (xhr.status === 401) return showLogin();
      if (xhr.status >= 400) { m.className = 'msg err'; m.textContent = j.error || 'Upload failed.'; return; }
      m.className = 'msg ok'; m.textContent = 'Uploaded. The preview is being made; copy the link below and send it to your client.';
      form.reset(); file.dispatchEvent(new Event('change'));
      load();
    };
    xhr.onerror = () => { btn.disabled = false; prog.hidden = true; m.className = 'msg err'; m.textContent = 'Upload failed. Check your connection and try again.'; };
    xhr.send(fd);
  });

  call('/api/admin/me').then((me) => (me.admin ? showApp(me) : showLogin())).catch(showLogin);
})();

<\/script>
</body>
</html>
`;

// worker/src/worker.js
var import_qrcode = __toESM(require_qrcode());
var import_svg_tag = __toESM(require_svg_tag());
var GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
var DRIVE_API = "https://www.googleapis.com/drive/v3";
var ID_RE = /^[A-Za-z0-9_-]{16,64}$/;
var CODE_ABC = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
var enc = new TextEncoder();
var b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
var randomId = (bytes = 18) => b64url(crypto.getRandomValues(new Uint8Array(bytes)));
function randomCode() {
  let c = "";
  for (const b of crypto.getRandomValues(new Uint8Array(6))) c += CODE_ABC[b % CODE_ABC.length];
  return c;
}
function safeEq(a, b) {
  a = String(a);
  b = String(b);
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
}
function cookies(req) {
  const out = {};
  (req.headers.get("Cookie") || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
var json = (body2, status = 200, extra = {}) => new Response(JSON.stringify(body2), {
  status,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra }
});
var text = (body2, status = 200) => new Response(body2, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
async function body(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
function cfg(env) {
  const front = String(env.FRONTEND_URL || "").split(",").map((s) => s.trim().replace(/\/+$/, "")).filter(Boolean);
  const adminPath = "/" + String(env.ADMIN_PATH || "").replace(/^\/+|\/+$/g, "").replace(/[^A-Za-z0-9_-]/g, "");
  return {
    front,
    frontend: front[0] || "",
    adminPath: adminPath.length >= 9 && !["/admin", "/delivery"].includes(adminPath.toLowerCase()) ? adminPath : null,
    password: env.ADMIN_PASSWORD || "",
    secret: env.SESSION_SECRET || "",
    upiId: env.UPI_ID || "",
    upiName: env.UPI_NAME || "Jackie's Studio",
    whatsapp: String(env.WHATSAPP || "916363692408").replace(/\D/g, ""),
    folder: env.DRIVE_FOLDER_ID || "",
    tokenUrl: env.GOOGLE_TOKEN_URL || GOOGLE_TOKEN_URL,
    // overridable only for local testing
    driveApi: env.DRIVE_API || DRIVE_API
  };
}
var getJob = async (env, id) => ID_RE.test(id) ? env.DB.get("job:" + id, "json") : null;
var putJob = (env, j) => env.DB.put("job:" + j.id, JSON.stringify(j));
async function allJobs(env) {
  const out = [];
  let cursor;
  do {
    const page = await env.DB.list({ prefix: "job:", cursor });
    const got = await Promise.all(page.keys.map((k) => env.DB.get(k.name, "json")));
    out.push(...got.filter(Boolean));
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  return out;
}
var tokenCache = { token: "", exp: 0 };
function serviceAccount(env) {
  let v = String(env.GOOGLE_SERVICE_ACCOUNT || "").trim();
  for (let i = 0; i < 2 && typeof v === "string"; i++) {
    try {
      v = JSON.parse(v);
    } catch {
      return null;
    }
  }
  return v && typeof v === "object" ? v : null;
}
function pemToDer(pem) {
  const b = atob(pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, ""));
  const u = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
  return u.buffer;
}
async function googleToken(env, c) {
  if (tokenCache.token && tokenCache.exp > Date.now() + 6e4) return tokenCache.token;
  const sa = serviceAccount(env);
  if (!sa) throw new Error("GOOGLE_SERVICE_ACCOUNT is missing or is not the JSON key file.");
  if (!sa.client_email || !sa.private_key) throw new Error("GOOGLE_SERVICE_ACCOUNT must be the whole JSON key file (with client_email and private_key).");
  const now = Math.floor(Date.now() / 1e3);
  const head = b64url(enc.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const claim = b64url(enc.encode(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/drive.readonly",
    aud: c.tokenUrl,
    iat: now,
    exp: now + 3600
  })));
  const key = await crypto.subtle.importKey("pkcs8", pemToDer(sa.private_key), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = b64url(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(`${head}.${claim}`)));
  const r = await fetch(c.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${head}.${claim}.${sig}`
  });
  const t = await r.json().catch(() => ({}));
  if (!r.ok || !t.access_token) throw new Error("Google refused the service account: " + (t.error_description || t.error || r.status));
  tokenCache = { token: t.access_token, exp: Date.now() + (t.expires_in || 3600) * 1e3 };
  return tokenCache.token;
}
function serviceEmail(env) {
  const sa = serviceAccount(env);
  return sa && sa.client_email || "";
}
async function driveMeta(env, c, fileId) {
  const tok = await googleToken(env, c);
  const r = await fetch(`${c.driveApi}/files/${encodeURIComponent(fileId)}?supportsAllDrives=true&fields=id,name,size,mimeType,videoMediaMetadata(durationMillis,width,height)`, {
    headers: { Authorization: "Bearer " + tok }
  });
  if (r.status === 404) throw new Error(`Can't see that Drive file. Share the file or its folder with ${serviceEmail(env)} (Viewer).`);
  if (!r.ok) throw new Error("Google Drive error " + r.status);
  return r.json();
}
async function driveList(env, c) {
  if (!c.folder) return [];
  const tok = await googleToken(env, c);
  const q = encodeURIComponent(`'${c.folder.replace(/'/g, "")}' in parents and trashed = false and mimeType contains 'video/'`);
  const r = await fetch(`${c.driveApi}/files?q=${q}&orderBy=modifiedTime desc&pageSize=200&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=files(id,name,size,mimeType,modifiedTime)`, {
    headers: { Authorization: "Bearer " + tok }
  });
  if (!r.ok) throw new Error(`Can't open the Drive folder (error ${r.status}). Check DRIVE_FOLDER_ID and that the folder is shared with ${serviceEmail(env)}.`);
  return (await r.json()).files || [];
}
async function resolveDrive(env, c, input) {
  const s = String(input || "").trim();
  if (!s) throw new Error("Pick both videos (preview and final).");
  const m = /\/d\/([A-Za-z0-9_-]{10,})/.exec(s) || /[?&]id=([A-Za-z0-9_-]{10,})/.exec(s);
  if (m) return driveMeta(env, c, m[1]);
  if (/^[A-Za-z0-9_-]{20,}$/.test(s)) return driveMeta(env, c, s);
  const hit = (await driveList(env, c)).find((f) => f.name === s);
  if (!hit) throw new Error(`"${s}" isn't in your Drive folder. Paste the file's Drive link instead.`);
  return driveMeta(env, c, hit.id);
}
async function driveStream(env, c, req, fileId, extraHeaders) {
  const tok = await googleToken(env, c);
  const h = { Authorization: "Bearer " + tok };
  const range = req.headers.get("Range");
  if (range) h.Range = range;
  const r = await fetch(`${c.driveApi}/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`, { headers: h });
  if (!r.ok && r.status !== 206) return text("The video is not available right now.", r.status === 416 ? 416 : 502);
  const out = new Headers({ "Cache-Control": "no-store", "Accept-Ranges": "bytes", ...extraHeaders });
  for (const k of ["Content-Type", "Content-Length", "Content-Range"]) {
    const v = r.headers.get(k);
    if (v) out.set(k, v);
  }
  return new Response(r.body, { status: r.status, headers: out });
}
var ADMIN_TTL = 12 * 3600;
async function isAdmin(req, c) {
  const v = cookies(req).adm;
  if (!v || !c.secret) return false;
  const [exp, sig] = v.split(".");
  return !!exp && !!sig && +exp > Date.now() / 1e3 && safeEq(sig, await hmac(c.secret, "adm:" + exp));
}
var fails = /* @__PURE__ */ new Map();
function limited(key, max) {
  const a = fails.get(key);
  return a && a.n >= max && a.until > Date.now();
}
function noteFail(key) {
  const a = fails.get(key) || { n: 0, until: 0 };
  if (a.until < Date.now()) a.n = 0;
  a.n++;
  a.until = Date.now() + 15 * 60 * 1e3;
  fails.set(key, a);
}
var adminView = (j, c) => ({
  id: j.id,
  code: j.code,
  client: j.client,
  title: j.title,
  price: j.price,
  createdAt: j.createdAt,
  originalName: j.finalName,
  size: j.size,
  duration: j.duration,
  previewStatus: "ready",
  previewError: "",
  previewName: j.previewName,
  previewState: j.previewState,
  previewWatchedAt: j.previewWatchedAt,
  utr: j.utr,
  utrAt: j.utrAt,
  paid: j.paid,
  paidAt: j.paidAt,
  downloads: j.downloads || 0,
  link: c.frontend + "/v/" + j.id
});
function cors(req, c, res) {
  const o = req.headers.get("Origin");
  if (o && c.front.includes(o)) {
    res.headers.set("Access-Control-Allow-Origin", o);
    res.headers.set("Vary", "Origin");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Range");
    res.headers.set("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
  }
  return res;
}
async function handle(req, env) {
  const c = cfg(env);
  const url = new URL(req.url);
  const p = url.pathname;
  const ip = req.headers.get("CF-Connecting-IP") || "local";
  const isPublic = /^\/(api\/v\/|api\/find$|stream\/|download\/)/.test(p);
  if (req.method === "OPTIONS" && isPublic) return cors(req, c, new Response(null, { status: 204 }));
  if (!env.DB) return text("Setup needed: add a KV namespace binding called DB to this Worker.", 500);
  if (req.method === "GET" && c.adminPath && p === c.adminPath) {
    return new Response(ADMIN_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
  }
  if (p === "/" || p === "") {
    return c.frontend ? Response.redirect(c.frontend, 302) : text("Jackie's Studio delivery service is running.");
  }
  if (p.startsWith("/api/admin/")) {
    if (p === "/api/admin/me") {
      return json({ admin: await isAdmin(req, c), upiConfigured: !!c.upiId, mode: "drive", serviceEmail: serviceEmail(env), folder: !!c.folder });
    }
    if (p === "/api/admin/login" && req.method === "POST") {
      if (limited("login:" + ip, 8)) return json({ error: "Too many tries. Wait 15 minutes and try again." }, 429);
      const { password } = await body(req);
      if (!c.password || !c.secret || !safeEq(password || "", c.password)) {
        noteFail("login:" + ip);
        return json({ error: !c.password || !c.secret ? "ADMIN_PASSWORD or SESSION_SECRET is not set on the Worker." : "Wrong password." }, 401);
      }
      const exp = Math.floor(Date.now() / 1e3) + ADMIN_TTL;
      return json({ ok: true }, 200, { "Set-Cookie": `adm=${exp}.${await hmac(c.secret, "adm:" + exp)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${ADMIN_TTL}` });
    }
    if (p === "/api/admin/logout") return json({ ok: true }, 200, { "Set-Cookie": "adm=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0" });
    if (!await isAdmin(req, c)) return json({ error: "Please log in again." }, 401);
    if (p === "/api/admin/jobs" && req.method === "GET") {
      return json((await allJobs(env)).sort((a, b) => b.createdAt - a.createdAt).map((j) => adminView(j, c)));
    }
    if (p === "/api/admin/drive-files") {
      try {
        return json((await driveList(env, c)).map((f) => ({ id: f.id, name: f.name, size: +f.size || 0 })));
      } catch (e) {
        return json({ error: e.message }, 400);
      }
    }
    if (p === "/api/admin/jobs" && req.method === "POST") {
      const b = await body(req);
      const client2 = String(b.client || "").trim().slice(0, 80);
      const title = String(b.title || "").trim().slice(0, 120) || "Your edited video";
      const price = Math.round(Number(b.price));
      if (!client2 || !(price > 0) || price > 1e7) return json({ error: "Enter the client name and a price in rupees." }, 400);
      let pv, fin;
      try {
        [pv, fin] = await Promise.all([resolveDrive(env, c, b.preview), resolveDrive(env, c, b.final)]);
      } catch (e) {
        return json({ error: e.message }, 400);
      }
      if (pv.id === fin.id) return json({ error: 'The preview and the final video are the same file. Pick the watermarked preview for "Preview".' }, 400);
      let code;
      for (let i = 0; i < 20; i++) {
        code = randomCode();
        if (!await env.DB.get("code:" + code)) break;
      }
      const ms = pv.videoMediaMetadata && +pv.videoMediaMetadata.durationMillis;
      const job = {
        id: randomId(18),
        code,
        client: client2,
        title,
        price,
        createdAt: Date.now(),
        previewFile: pv.id,
        previewName: pv.name,
        previewType: pv.mimeType || "video/mp4",
        finalFile: fin.id,
        finalName: fin.name,
        finalType: fin.mimeType || "video/mp4",
        size: +fin.size || 0,
        duration: ms ? ms / 1e3 : 0,
        previewState: "unused",
        previewWatchedAt: 0,
        utr: "",
        utrAt: 0,
        paid: false,
        paidAt: 0,
        downloads: 0
      };
      await Promise.all([putJob(env, job), env.DB.put("code:" + code, job.id)]);
      return json(adminView(job, c));
    }
    let m;
    if (m = /^\/api\/admin\/jobs\/([^/]+)(?:\/(paid|reset-preview))?$/.exec(p)) {
      const j = await getJob(env, m[1]);
      if (!j) return json({ error: "Not found." }, 404);
      if (req.method === "DELETE" && !m[2]) {
        await Promise.all([env.DB.delete("job:" + j.id), env.DB.delete("code:" + j.code)]);
        return json({ ok: true });
      }
      if (m[2] === "paid" && req.method === "POST") {
        const { paid } = await body(req);
        j.paid = !!paid;
        j.paidAt = j.paid ? Date.now() : 0;
      } else if (m[2] === "reset-preview" && req.method === "POST") {
        j.previewState = "unused";
        j.previewWatchedAt = 0;
      } else return json({ error: "Not found." }, 404);
      await putJob(env, j);
      return json(adminView(j, c));
    }
    return json({ error: "Not found." }, 404);
  }
  if (isPublic) return cors(req, c, await client(req, env, c, p, ip));
  return text("Not found.", 404);
}
async function client(req, env, c, p, ip) {
  let m;
  if (p === "/api/find" && req.method === "POST") {
    if (limited("find:" + ip, 20)) return json({ error: "Too many tries. Wait 15 minutes, or open the link Jackie sent you." }, 429);
    const code = String((await body(req)).code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const id = /^[A-Z0-9]{6}$/.test(code) && await env.DB.get("code:" + code);
    if (!id) {
      noteFail("find:" + ip);
      return json({ error: "No video found for that code. Check the message from Jackie and try again." }, 404);
    }
    return json({ link: "/v/" + id });
  }
  if (m = /^\/api\/v\/([^/]+)(\/[a-z]+)?$/.exec(p)) {
    const j = await getJob(env, m[1]);
    if (!j) return json({ error: "This link is not valid." }, 404);
    const act = m[2] || "";
    if (act === "" && req.method === "GET") {
      let upi = null;
      if (c.upiId) {
        const note = `Jackie's Studio - ${j.title}`.slice(0, 50);
        upi = {
          id: c.upiId,
          name: c.upiName,
          link: `upi://pay?pa=${encodeURIComponent(c.upiId).replace(/%40/g, "@")}&pn=${encodeURIComponent(c.upiName)}&am=${j.price}&cu=INR&tn=${encodeURIComponent(note)}`
        };
        const svg = import_svg_tag.default.render(import_qrcode.default.create(upi.link, { errorCorrectionLevel: "M" }), { margin: 1, color: { dark: "#000000ff", light: "#efe7daff" } });
        upi.qr = "data:image/svg+xml;base64," + btoa(svg);
      }
      return json({
        client: j.client,
        title: j.title,
        price: j.price,
        previewReady: true,
        previewFailed: false,
        previewUsed: j.previewState === "used",
        utrSubmitted: !!j.utr,
        paid: j.paid,
        upi,
        whatsapp: c.whatsapp
      });
    }
    if (act === "/preview" && req.method === "POST") {
      if (j.previewState === "used") return json({ error: "This preview has already been watched." }, 410);
      const life = Math.min(4 * 3600, Math.max(30 * 60, Math.round((j.duration || 0) * 3) + 600));
      const t = { id: randomId(18), key: randomId(18), job: j.id, expires: Date.now() + life * 1e3 };
      j.previewState = "used";
      j.previewWatchedAt = Date.now();
      await Promise.all([putJob(env, j), env.DB.put("tk:" + t.id, JSON.stringify(t), { expirationTtl: life })]);
      return json({ src: `/stream/${t.id}?k=${t.key}` });
    }
    if (act === "/ended" && req.method === "POST") return json({ ok: true });
    if (act === "/utr" && req.method === "POST") {
      if (j.paid) return json({ ok: true });
      const utr = String((await body(req)).utr || "").replace(/\s+/g, "").toUpperCase();
      if (!/^[A-Z0-9]{6,30}$/.test(utr)) return json({ error: "Enter the UPI reference / UTR number from your payment app (6 to 30 letters or digits)." }, 400);
      j.utr = utr;
      j.utrAt = Date.now();
      await putJob(env, j);
      return json({ ok: true });
    }
    return json({ error: "Not found." }, 404);
  }
  if ((m = /^\/stream\/([A-Za-z0-9_-]{16,64})$/.exec(p)) && req.method === "GET") {
    const t = await env.DB.get("tk:" + m[1], "json");
    const k = new URL(req.url).searchParams.get("k") || "";
    if (!t || t.expires < Date.now() || !safeEq(k, t.key)) return text("This preview link has expired.", 403);
    const j = await getJob(env, t.job);
    if (!j) return text("Not found.", 404);
    return driveStream(env, c, req, j.previewFile, { "Content-Disposition": "inline", "Content-Type": j.previewType });
  }
  if ((m = /^\/download\/([^/]+)$/.exec(p)) && req.method === "GET") {
    const j = await getJob(env, m[1]);
    if (!j) return text("This link is not valid.", 404);
    if (!j.paid) return text("This video unlocks after payment is confirmed.", 402);
    if (!req.headers.get("Range")) {
      j.downloads = (j.downloads || 0) + 1;
      await putJob(env, j);
    }
    return driveStream(env, c, req, j.finalFile, {
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(j.finalName || "video.mp4")}`
    });
  }
  return text("Not found.", 404);
}
var worker_default = {
  async fetch(req, env) {
    try {
      return await handle(req, env);
    } catch (e) {
      return json({ error: "Server error: " + e.message }, 500);
    }
  }
};
export {
  worker_default as default
};
