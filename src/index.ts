import { parse } from "@babel/parser";
import fs from "fs";
import { createInterface } from "readline";
import obfuscator from "./core/obfuscator";
import generator from "@babel/generator";

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

        fs.writeFileSync(`${__dirname}/../output/result.js`, codeResult.code);

        console.log("Successfully obfuscated the code");

        process.exit();
    });
}

Runner();