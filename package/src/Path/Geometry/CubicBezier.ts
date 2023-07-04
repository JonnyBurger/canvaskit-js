import type { Point } from "canvaskit-wasm";

export const cubicSolve = (
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number
): number => {
  return (
    (1 - t) * (1 - t) * (1 - t) * p0 +
    3 * (1 - t) * (1 - t) * t * p1 +
    3 * (1 - t) * t * t * p2 +
    t * t * t * p3
  );
};

const getDerivative = (derivative: number, t: number, vs: number[]): number => {
  // the derivative of any 't'-less function is zero.
  const n = vs.length - 1;
  let _vs;
  let value;

  if (n === 0) {
    return 0;
  }

  // direct values? compute!
  if (derivative === 0) {
    value = 0;
    for (let k = 0; k <= n; k++) {
      value +=
        binomialCoefficients[n][k] *
        Math.pow(1 - t, n - k) *
        Math.pow(t, k) *
        vs[k];
    }
    return value;
  } else {
    // Still some derivative? go down one order, then try
    // for the lower order curve's.
    _vs = new Array(n);
    for (let k = 0; k < n; k++) {
      _vs[k] = n * (vs[k + 1] - vs[k]);
    }
    return getDerivative(derivative - 1, t, _vs);
  }
};

const BFunc = (xs: number[], ys: number[], t: number) => {
  const xbase = getDerivative(1, t, xs);
  const ybase = getDerivative(1, t, ys);
  const combined = xbase * xbase + ybase * ybase;
  return Math.sqrt(combined);
};

export const getCubicArcLength = (
  p1: Point,
  cp1: Point,
  cp2: Point,
  p2: Point,
  t: number
) => {
  const xs = [p1[0], cp1[0], cp2[0], p2[0]];
  const ys = [p1[1], cp1[1], cp2[1], p2[1]];
  let sum: number;
  let correctedT: number;

  /*if (xs.length >= tValues.length) {
          throw new Error('too high n bezier');
        }*/

  const n = 20;

  const z = t / 2;
  sum = 0;
  for (let i = 0; i < n; i++) {
    correctedT = z * tValues[n][i] + z;
    sum += cValues[n][i] * BFunc(xs, ys, correctedT);
  }
  return z * sum;
};

// Legendre-Gauss abscissae (xi values, defined at i=n as the roots of the nth order Legendre polynomial Pn(x))
export const tValues = [
  [],
  [],
  [-0.57735, 0.57735],
  [0, -0.7745966, 0.7745966],
  [-0.339981, 0.339981, -0.861136, 0.861136],
  [0, -0.538469, 0.538469, -0.906179, 0.906179],
  [0.661209, -0.661209, -0.238619, 0.238619, -0.932469, 0.932469],
  [0, 0.405845, -0.405845, -0.741531, 0.741531, -0.949107, 0.949107],
  [
    -0.183434, 0.183434, -0.525532, 0.525532, -0.796666, 0.796666, -0.960289,
    0.960289,
  ],
  [
    0, -0.836031, 0.836031, -0.96816, 0.96816, -0.324253, 0.324253, -0.613371,
    0.613371,
  ],
  [
    -0.148874, 0.148874, -0.433395, 0.433395, -0.679409, 0.679409, -0.865063,
    0.865063, -0.973906, 0.973906,
  ],
  [
    0, -0.269543, 0.269543, -0.519096, 0.519096, -0.730152, 0.730152, -0.887062,
    0.887062, -0.978228, 0.978228,
  ],
  [
    -0.125233, 0.125233, -0.367831, 0.367831, -0.587317, 0.587317, -0.769902,
    0.769902, -0.904117, 0.904117, -0.98156, 0.98156,
  ],
  [
    0, -0.230458, 0.230458, -0.448492, 0.448492, -0.642349, 0.642349, -0.801578,
    0.801578, -0.917598, 0.917598, -0.984183, 0.984183,
  ],
  [
    -0.108054, 0.108054, -0.3191123, 0.3191123, -0.5152486, 0.5152486,
    -0.6872929, 0.6872929, -0.8272013, 0.8272013, -0.9284348, 0.9284348,
    -0.9862838, 0.9862838,
  ],
  [
    0, -0.201194, 0.201194, -0.3941513, 0.3941513, -0.5709721, 0.5709721,
    -0.7244177, 0.7244177, -0.8482065, 0.8482065, -0.9372733, 0.9372733,
    -0.9879925, 0.9879925,
  ],
  [
    -0.0950125, 0.0950125, -0.2816035, 0.2816035, -0.4580167, 0.4580167,
    -0.6178762, 0.6178762, -0.7554044, 0.7554044, -0.8656312, 0.8656312,
    -0.944575, 0.944575, -0.9894009, 0.9894009,
  ],
  [
    0, -0.1784841, 0.1784841, -0.3512317, 0.3512317, -0.5126905, 0.5126905,
    -0.6576711, 0.6576711, -0.781514, 0.781514, -0.8802391, 0.8802391,
    -0.9506755, 0.9506755, -0.9905754, 0.9905754,
  ],
  [
    -0.084775, 0.084775, -0.2518862, 0.2518862, -0.4117511, 0.4117511,
    -0.5597708, 0.5597708, -0.691687, 0.691687, -0.8037049, 0.8037049,
    -0.8926024, 0.8926024, -0.9558239, 0.9558239, -0.9915651, 0.9915651,
  ],
  [
    0, -0.1603586, 0.1603586, -0.316564, 0.316564, -0.4645707, 0.4645707,
    -0.6005453, 0.6005453, -0.7209661, 0.7209661, -0.8227146, 0.8227146,
    -0.9031559, 0.9031559, -0.9602081, 0.9602081, -0.9924068, 0.9924068,
  ],
  [
    -0.0765265, 0.0765265, -0.2277858, 0.2277858, -0.373706, 0.373706,
    -0.510867, 0.510867, -0.6360536, 0.6360536, -0.7463319, 0.7463319,
    -0.8391169, 0.8391169, -0.9122344, 0.9122344, -0.9639719, 0.9639719,
    -0.9931285, 0.9931285,
  ],
  [
    0, -0.1455618, 0.1455618, -0.2880213, 0.2880213, -0.4243421, 0.4243421,
    -0.5516188, 0.5516188, -0.6671388, 0.6671388, -0.7684399, 0.7684399,
    -0.8533633, 0.8533633, -0.9200993, 0.9200993, -0.9672268, 0.9672268,
    -0.9937521, 0.9937521,
  ],
  [
    -0.0697392, 0.0697392, -0.2078604, 0.2078604, -0.3419358, 0.3419358,
    -0.4693558, 0.4693558, -0.5876404, 0.5876404, -0.6944872, 0.6944872,
    -0.7878168, 0.7878168, -0.8658125, 0.8658125, -0.9269567, 0.9269567,
    -0.9700604, 0.9700604, -0.9942945, 0.9942945,
  ],
  [
    0, -0.1332568, 0.1332568, -0.2641356, 0.2641356, -0.390301, 0.390301,
    -0.5095014, 0.5095014, -0.6196098, 0.6196098, -0.7186613, 0.7186613,
    -0.8048884, 0.8048884, -0.8767523, 0.8767523, -0.932971, 0.932971,
    -0.9725424, 0.9725424, -0.9947693, 0.9947693,
  ],
  [
    -0.0640568, 0.0640568, -0.1911188, 0.1911188, -0.3150426, 0.3150426,
    -0.4337935, 0.4337935, -0.5454214, 0.5454214, -0.6480936, 0.6480936,
    -0.7401241, 0.7401241, -0.8200019, 0.8200019, -0.8864155, 0.8864155,
    -0.9382745, 0.9382745, -0.9747285, 0.9747285, -0.9951872, 0.9951872,
  ],
];

// Legendre-Gauss weights (wi values, defined by a function linked to in the Bezier primer article)
export const cValues = [
  [],
  [],
  [1.0, 1.0],
  [0.8888888, 0.5555555, 0.5555555],
  [0.6521451, 0.6521451, 0.3478548, 0.3478548],
  [0.5688888, 0.4786286, 0.4786286, 0.2369268, 0.2369268],
  [0.3607615, 0.3607615, 0.4679139, 0.4679139, 0.1713244, 0.1713244],
  [0.4179591, 0.38183, 0.38183, 0.2797053, 0.2797053, 0.1294849, 0.1294849],
  [
    0.3626837, 0.3626837, 0.3137066, 0.3137066, 0.222381, 0.222381, 0.1012285,
    0.1012285,
  ],
  [
    0.3302393, 0.1806481, 0.1806481, 0.0812743, 0.0812743, 0.312347, 0.312347,
    0.2606106, 0.2606106,
  ],
  [
    0.2955242, 0.2955242, 0.2692667, 0.2692667, 0.2190863, 0.2190863, 0.1494513,
    0.1494513, 0.0666713, 0.0666713,
  ],
  [
    0.272925, 0.2628045, 0.2628045, 0.2331937, 0.2331937, 0.1862902, 0.1862902,
    0.1255803, 0.1255803, 0.0556685, 0.0556685,
  ],
  [
    0.249147, 0.249147, 0.2334925, 0.2334925, 0.2031674, 0.2031674, 0.1600783,
    0.1600783, 0.1069393, 0.1069393, 0.0471753, 0.0471753,
  ],
  [
    0.2325515, 0.2262831, 0.2262831, 0.207816, 0.207816, 0.1781459, 0.1781459,
    0.1388735, 0.1388735, 0.0921214, 0.0921214, 0.040484, 0.040484,
  ],
  [
    0.2152638, 0.2152638, 0.2051984, 0.2051984, 0.1855383, 0.1855383, 0.1572031,
    0.1572031, 0.1215185, 0.1215185, 0.080158, 0.080158, 0.0351194, 0.0351194,
  ],
  [
    0.2025782, 0.1984314, 0.1984314, 0.186161, 0.186161, 0.1662692, 0.1662692,
    0.1395706, 0.1395706, 0.1071592, 0.1071592, 0.070366, 0.070366, 0.0307532,
    0.0307532,
  ],
  [
    0.1894506, 0.1894506, 0.1826034, 0.1826034, 0.1691565, 0.1691565, 0.1495959,
    0.1495959, 0.1246289, 0.1246289, 0.0951585, 0.0951585, 0.0622535, 0.0622535,
    0.0271524, 0.0271524,
  ],
  [
    0.1794464, 0.1765627, 0.1765627, 0.1680041, 0.1680041, 0.1540457, 0.1540457,
    0.1351363, 0.1351363, 0.1118838, 0.1118838, 0.0850361, 0.0850361, 0.0554595,
    0.0554595, 0.0241483, 0.0241483,
  ],
  [
    0.1691423, 0.1691423, 0.1642764, 0.1642764, 0.1546846, 0.1546846, 0.1406429,
    0.1406429, 0.1225552, 0.1225552, 0.100942, 0.100942, 0.0764257, 0.0764257,
    0.0497145, 0.0497145, 0.021616, 0.021616,
  ],
  [
    0.1610544, 0.1589688, 0.1589688, 0.152766, 0.152766, 0.1426067, 0.1426067,
    0.1287539, 0.1287539, 0.1115666, 0.1115666, 0.09149, 0.09149, 0.0690445,
    0.0690445, 0.0448142, 0.0448142, 0.0194617, 0.0194617,
  ],
  [
    0.1527533, 0.1527533, 0.1491729, 0.1491729, 0.1420961, 0.1420961, 0.1316886,
    0.1316886, 0.1181945, 0.1181945, 0.1019301, 0.1019301, 0.0832767, 0.0832767,
    0.062672, 0.062672, 0.0406014, 0.0406014, 0.017614, 0.017614,
  ],
  [
    0.1460811, 0.1445244, 0.1445244, 0.1398873, 0.1398873, 0.1322689, 0.1322689,
    0.1218314, 0.1218314, 0.1087972, 0.1087972, 0.0934444, 0.0934444, 0.0761001,
    0.0761001, 0.0571344, 0.0571344, 0.0369537, 0.0369537, 0.0160172, 0.0160172,
  ],
  [
    0.1392518, 0.1392518, 0.1365414, 0.1365414, 0.1311735, 0.1311735, 0.1232523,
    0.1232523, 0.1129322, 0.1129322, 0.1004141, 0.1004141, 0.0859416, 0.0859416,
    0.0697964, 0.0697964, 0.0522933, 0.0522933, 0.0337749, 0.0337749, 0.0146279,
    0.0146279,
  ],
  [
    0.1336545, 0.132462, 0.132462, 0.1289057, 0.1289057, 0.123049, 0.123049,
    0.1149966, 0.1149966, 0.104892, 0.104892, 0.0929157, 0.0929157, 0.0792814,
    0.0792814, 0.0642324, 0.0642324, 0.0480376, 0.0480376, 0.030988, 0.030988,
    0.0134118, 0.0134118,
  ],
  [
    0.1279381, 0.1279381, 0.1258374, 0.1258374, 0.1216704, 0.1216704, 0.1155056,
    0.1155056, 0.1074442, 0.1074442, 0.0976186, 0.0976186, 0.0861901, 0.0861901,
    0.0733464, 0.0733464, 0.0592985, 0.0592985, 0.0442774, 0.0442774, 0.0285313,
    0.0285313, 0.0123412, 0.0123412,
  ],
];

// LUT for binomial coefficient arrays per curve order 'n'
export const binomialCoefficients = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]];
