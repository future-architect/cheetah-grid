import type { AnyFunction } from "../../../ts-types";
import type { CanvasOperations } from "./internal";
import { PathCommands } from "./PathCommands";

type PathCommandName = keyof PathCommands;
type CanvasOperation = keyof CanvasOperations;

type Tokens = { next(): string | null };

function pathTokens(d: string): Tokens {
  let idx = 0;
  return {
    next(): string | null {
      let s = "";
      while (d.length > idx) {
        const c = d[idx];
        idx++;
        if (" ,\n\r\t".indexOf(c) > -1) {
          if (s) {
            return s;
          }
        } else {
          const type = ".+-1234567890".indexOf(c) > -1 ? "num" : "str";
          if (type === "str") {
            if (s) {
              idx--;
              return s;
            }
            return c;
          }
          if ("-+".indexOf(c) > -1) {
            if (s) {
              idx--;
              return s;
            }
          }
          if (c === ".") {
            if (s.indexOf(".") > -1) {
              idx--;
              return s;
            }
          }
          s += c;
        }
      }
      return s || null;
    },
  };
}

function command(
  builder: PathCommandsParser,
  cmd: PathCommandName,
  argsProvider: Tokens
): PathCommandName | null {
  if (
    cmd.toUpperCase() === "M" ||
    cmd.toUpperCase() === "L" ||
    cmd.toUpperCase() === "T"
  ) {
    builder.command(cmd, argsProvider.next(), argsProvider.next());
    return cmd === "M" ? "L" : cmd === "m" ? "l" : cmd;
  } else if (cmd.toUpperCase() === "H" || cmd.toUpperCase() === "V") {
    builder.command(cmd, argsProvider.next());
    return cmd;
  } else if (cmd.toUpperCase() === "Z") {
    builder.command(cmd);
    return cmd;
  } else if (cmd.toUpperCase() === "C") {
    builder.command(
      cmd,
      argsProvider.next(),
      argsProvider.next(),
      argsProvider.next(),
      argsProvider.next(),
      argsProvider.next(),
      argsProvider.next()
    );
    return cmd;
  } else if (cmd.toUpperCase() === "S" || cmd.toUpperCase() === "Q") {
    builder.command(
      cmd,
      argsProvider.next(),
      argsProvider.next(),
      argsProvider.next(),
      argsProvider.next()
    );
    return cmd;
  } else if (cmd.toUpperCase() === "A") {
    builder.command(
      cmd,
      argsProvider.next(),
      argsProvider.next(),
      argsProvider.next(),
      argsProvider.next(),
      argsProvider.next(),
      argsProvider.next(),
      argsProvider.next()
    );
    return cmd;
  } else {
    // https://developer.mozilla.org/ja/docs/Web/SVG/Tutorial/Paths
    console.warn(`unsupported:${cmd}`);
  }
  return null;
}

export class PathCommandsParser implements CanvasOperations {
  public readonly moveTo: typeof CanvasRenderingContext2D.prototype.moveTo;
  public readonly lineTo: typeof CanvasRenderingContext2D.prototype.lineTo;
  public readonly closePath: typeof CanvasRenderingContext2D.prototype.closePath;
  public readonly bezierCurveTo: typeof CanvasRenderingContext2D.prototype.bezierCurveTo;
  public readonly quadraticCurveTo: typeof CanvasRenderingContext2D.prototype.quadraticCurveTo;
  public readonly save: typeof CanvasRenderingContext2D.prototype.save;
  public readonly translate: typeof CanvasRenderingContext2D.prototype.translate;
  public readonly rotate: typeof CanvasRenderingContext2D.prototype.rotate;
  public readonly scale: typeof CanvasRenderingContext2D.prototype.scale;
  public readonly arc: typeof CanvasRenderingContext2D.prototype.arc;
  public readonly restore: typeof CanvasRenderingContext2D.prototype.restore;
  public readonly arcTo: typeof CanvasRenderingContext2D.prototype.arcTo;
  public readonly ellipse: typeof CanvasRenderingContext2D.prototype.ellipse;
  public readonly rect: typeof CanvasRenderingContext2D.prototype.rect;
  private readonly _commands: PathCommands;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _ops: { op: CanvasOperation; args: any[] }[] = [];
  constructor() {
    this._commands = new PathCommands(this as CanvasOperations);
    const buildPush =
      (op: CanvasOperation) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (...args: any[]): void => {
        this._ops.push({
          op,
          args,
        });
      };
    this.moveTo = buildPush("moveTo");
    this.lineTo = buildPush("lineTo");
    this.closePath = buildPush("closePath");
    this.bezierCurveTo = buildPush("bezierCurveTo");
    this.quadraticCurveTo = buildPush("quadraticCurveTo");
    this.save = buildPush("save");
    this.translate = buildPush("translate");
    this.rotate = buildPush("rotate");
    this.scale = buildPush("scale");
    this.arc = buildPush("arc");
    this.restore = buildPush("restore");
    this.arcTo = buildPush("arcTo");
    this.ellipse = buildPush("ellipse");
    this.rect = buildPush("rect");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  command(name: PathCommandName, ...args: any[]): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const numArgs: any[] = args || [];
    for (let i = 0; i < args.length; i++) {
      numArgs[i] -= 0;
    }
    const command: AnyFunction = this._commands[name];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    command.apply(this, numArgs);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parse(d: string): { op: CanvasOperation; args: any[] }[] {
    const ops = (this._ops = []);
    const tokens = pathTokens(d);
    try {
      let cmd: string | null;
      let subsequentCommand: PathCommandName = "Z";
      while ((cmd = tokens.next())) {
        if (!isNaN(Number(cmd))) {
          let fst = true;
          const argsProvider: Tokens = {
            next() {
              if (fst) {
                fst = false;
                return cmd;
              }
              return tokens.next();
            },
          };
          subsequentCommand =
            command(this, subsequentCommand, argsProvider) || "Z";
        } else {
          subsequentCommand =
            command(this, cmd as PathCommandName, tokens) || "Z";
        }
      }
    } catch (e) {
      console.log(`Error: ${d}`);
      throw e;
    }
    return ops;
  }
}
