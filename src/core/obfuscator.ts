import { File } from "@babel/types";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { parse, ParseResult } from "@babel/parser";

/*
To expand this project.
You can use: https://astexplorer.net/
To explore the AST structure. Be sure to select "@babel/parser" as your AST parser type.
*/

const nameMap = new Map<string, string>();

function randString(): string {
    let result = "_0x";
    for (let i = 0; i < 7; i++) result += Math.floor(Math.random() * 10);
    return result;
}

// Custom decoder logic (uses base64, change this to something custom):

const decoderLogic = `
function decoder(str) {
    return atob(str);
}
`;

// Custom encoder logic (uses base64, change thi to something custom):

function encoder(str: string) {
    return btoa(str);
}

export default function obfuscator(ast: ParseResult<File>) {

    // Inject str decoder logic to the start of the program (obfuscate this more if you want to hide this):
    const decoderAst = parse(decoderLogic);
    ast.program.body.unshift(...decoderAst.program.body);

    traverse(ast, {

        /*
        Fetches all function and variable names since sometimes they are called "before" they are ran.
        This allows all instances to be renamed correctly. 
        */

        FunctionDeclaration(path) {
            const id = path.node.id;

            if (id && t.isIdentifier(id)) {
                const oldName = id.name;

                if (!nameMap.has(oldName)) {
                    nameMap.set(oldName, randString());
                }
            }
        },

        VariableDeclarator(path) {
            const id = path.node.id;

            if (t.isIdentifier(id)) {
                const oldName = id.name;

                if (!nameMap.has(oldName)) {
                    nameMap.set(oldName, randString());
                }
            }
        }
    });

    traverse(ast, {

        /*
        Renames everything
        */

        Program(path) {
            for (const [oldName, newName] of nameMap.entries()) {
                path.scope.rename(oldName, newName);
            }
        },

        /*
        Encodes strings and wraps them in a custom decoder.
        e.g. "hello" -> decoder("aGVsbG8=")
        */

        StringLiteral(path) {
            const encoded = encoder(path.node.value);
            const block = t.callExpression(t.identifier(nameMap.get("decoder")!), [t.stringLiteral(encoded)]);

            path.replaceWith(block);
            path.skip();
        },

        /*
        Changes simple ``console.log`` to console["log"].
        Allows the string encoder and wrapper to make it harder to read.
        Final result: console[decoder("encoded string")](decoder("encoded string"));
        */

        MemberExpression(path) {
            const property = path.node.property;

            if (t.isIdentifier(property)) {
                path.node.computed = true;
                path.node.property = t.stringLiteral(property.name);
            }
        },

        /*
        Replace boolean assignments with unary negation expressions:
        true -> !0, false -> !1
        */

        AssignmentExpression(path) {
            const right = path.node.right;

            if (t.isBooleanLiteral(right)) {
                const numeric = right.value ? t.numericLiteral(0) : t.numericLiteral(1);
                const replacement = t.unaryExpression("!", numeric, true);

                path.node.right = replacement;
            }
        },

        /*
        Replace boolean initializers in variable declarations with unary negation expressions (!0 or !1).
        */

        VariableDeclarator(path) {
            const init = path.node.init;

            if (t.isBooleanLiteral(init)) {
                const numeric = init.value ? t.numericLiteral(0) : t.numericLiteral(1);
                const replacement = t.unaryExpression("!", numeric, true);

                path.node.init = replacement;
            }
        }
    });

    return ast;
}
