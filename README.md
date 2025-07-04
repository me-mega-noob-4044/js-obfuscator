# js-obfuscator

A very simple obfuscator.

This obfuscator is intentionally minimal and trash. This is not meant for real production use.
It's here as a starting point for anyone who wants to build their own obfuscator but don't know where to begin.

Use this as a base project and make something better.

## Usage
```code
npm install
npm run start
```

## Example
### Input
```js
function helloThere() {
    console.log("Hello World!");
}

var hello = true;
hello = true;

helloThere();
```
### Output
```js
function _0x3793229(str){return atob(str)}function _0x6781302(){console[_0x3793229("bG9n")](_0x3793229("SGVsbG8gV29ybGQh"))}var _0x9469845=!0,_0x9469845=!0;_0x6781302();
```