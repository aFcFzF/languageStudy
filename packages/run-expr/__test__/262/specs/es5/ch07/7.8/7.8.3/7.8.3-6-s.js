/// Copyright (c) 2012 Ecma International.  All rights reserved.
/// Ecma International makes this code available under the terms and conditions set
/// forth on http://hg.ecmascript.org/tests/test262/raw-file/tip/LICENSE (the
/// "Use Terms").   Any redistribution of this code must retain the above
/// copyright and this notice and otherwise comply with the Use Terms.
/**
 * @path ch07/7.8/7.8.3/7.8.3-6-s.js
 * @description Strict Mode - octal extension (000) is forbidden in strict mode
 * @onlyStrict
 */


function testcase() {

        try {
            eval("var _7_8_3_6 = 000;");
            return typeof _7_8_3_6 === 'number';
        } catch (e) {
            return e instanceof SyntaxError && typeof _7_8_3_6 === "undefined";
        }
    }
runTestCase(testcase);
