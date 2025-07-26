interface GlobalOptions {
  verbose?: boolean;
  noAi?: boolean;
}

let globalOptions: GlobalOptions = {};

export function setGlobalOptions(options: GlobalOptions): void {
  globalOptions = options;
}

export function getGlobalOptions(): GlobalOptions {
  return globalOptions;
}

// Hook into commander to capture global options
export function captureGlobalOptions(program: any): void {
  const options = program.opts();
  setGlobalOptions({
    verbose: options.verbose,
    noAi: options.noAi
  });
}