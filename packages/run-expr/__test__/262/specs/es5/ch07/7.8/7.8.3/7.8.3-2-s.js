/// Copyright (c) 2012 Ecma International.  All rights reserved.
/// Ecma International makes this code available under the terms and conditions set
/// forth on http://hg.ecmascript.org/tests/test262/raw-file/tip/LICENSE (the
/// "Use Terms").   Any redistribution of this code must retain the above
/// copyright and this notice and otherwise comply with the Use Terms.
/**
 * @path ch07/7.8/7.8.3/7.8.3-2-s.js
 * @description Strict Mode - octal extension (00) is forbidden in strict mode
 * @onlyStrict
 */


function testcase() {

        try {
            return typeof eval("var _7_8_3_2 = 00; _7_8_3_2;") === 'number';
            return false;
        } catch (e) {
            return e instanceof SyntaxError && typeof _7_8_3_2 === "undefined";
        }
    }
runTestCase(testcase);
