type Command =
  | "a"
  | "c"
  | "h"
  | "l"
  | "m"
  | "q"
  | "s"
  | "t"
  | "v"
  | "z"
  | "A"
  | "C"
  | "H"
  | "L"
  | "M"
  | "Q"
  | "S"
  | "T"
  | "V"
  | "Z";

type PathCommand = [Command, ...number[]];

const length = { a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0 };

const stackCmd = (
  commands: PathCommand[],
  cmd: Command,
  params: number[],
  size: number
) => {
  while (params.length > 0) {
    commands.push([cmd, ...params.splice(0, size)]);
  }
};

export const parseSVG = (svgString: string): PathCommand[] => {
  // RegExp to match segments and numbers
  const segment = /([astvzqmhlc])([^astvzqmhlc]*)/gi;
  const number = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;

  // Array to store the commands
  const commands: PathCommand[] = [];

  let match;
  while ((match = segment.exec(svgString)) !== null) {
    // Get the command letter
    const command = match[1] as Command;

    // Get the numbers
    const params = [];
    let numMatch;
    while ((numMatch = number.exec(match[2])) !== null) {
      params.push(parseFloat(numMatch[0]));
    }

    const cmdSize = length[command.toLowerCase() as keyof typeof length];

    // overloaded moveTo
    if ((command === "m" || command === "M") && params.length > 2) {
      commands.push([command, ...params.splice(0, 2)]);
      const lineTo = command === "m" ? "l" : "L";
      stackCmd(commands, lineTo, params, cmdSize);
    } else if (command === "z" || command === "Z") {
      commands.push([command]);
    } else {
      stackCmd(commands, command, params, cmdSize);
    }
  }

  return commands;
};