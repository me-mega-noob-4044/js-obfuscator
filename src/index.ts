import { parse } from "@babel/parser";
import fs from "fs";
import { createInterface } from "readline";
import obfuscator from "./core/obfuscator";
import generator from "@babel/generator";
import { minify } from "uglify-js";

function Runner() {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("File: ", (answer: string) => {
        const code = fs.readFileSync(`${__dirname}/../input/${answer}`, "utf-8");
        let ast = parse(code);

        ast = obfuscator(ast);

        const codeResult = generator(ast, {}, code);
        const minfiedCode = minify(codeResult.code, {
            mangle: false
        }); // Compress code to one line (don't really need a minifier for this)

        fs.writeFileSync(`${__dirname}/../output/result.js`, minfiedCode.code);

        console.log("Successfully obfuscated the code");

        process.exit();
    });
}

Runner();