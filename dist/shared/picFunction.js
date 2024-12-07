"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickFunctionArray = void 0;
const pickFunction = (obj, keys) => {
    const picked = {};
    keys.forEach((key) => {
        if (obj.hasOwnProperty(key)) {
            picked[key] = obj[key];
        }
    });
    return picked;
};
exports.default = pickFunction;
const pickFunctionArray = (obj, keys) => {
    return obj.map((item) => {
        const picked = {};
        keys.forEach((key) => {
            if (item.hasOwnProperty(key)) {
                picked[key] = item[key];
            }
        });
        return picked;
    });
};
exports.pickFunctionArray = pickFunctionArray;
// const pickFunction = <T extends Record<string, unknown>, K extends keyof T>(
//   obj: T | T[],
//   keys: K[]
// ) => {
// if (Array.isArray(obj)) {
//   return obj.map((item) => {
//     const picked: Partial<T> = {};
//     keys.forEach((key) => {
//       if (item.hasOwnProperty(key)) {
//         picked[key] = item[key];
//       }
//     });
//     return picked;
//   });
// } else {
//     const picked: Partial<T> = {};
//     keys.forEach((key) => {
//       if (obj.hasOwnProperty(key)) {
//         picked[key] = obj[key];
//       }
//     });
//     return picked;
//   }
// };
// export default pickFunction;
