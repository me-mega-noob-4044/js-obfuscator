import { File } from "@babel/types";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { ParseResult } from "@babel/parser";

const nameMap = new Map<string, string>();

function randString(): string {
    let result = "_0x";
    for (let i = 0; i < 7; i++) result += Math.floor(Math.random() * 10);
    return result;
}

export default function obfuscator(ast: ParseResult<File>) {
    traverse(ast, {
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
        Program(path) {
            for (const [oldName, newName] of nameMap.entries()) {
                path.scope.rename(oldName, newName);
            }
        },

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
