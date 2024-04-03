/* eslint-disable max-classes-per-file */
declare module '*.css';

declare module 'markdown-it-container';
declare module 'markdown-it-sub';
declare module 'markdown-it-sup';
declare module 'postcss-nesting';

declare module 'pagedjs' {
  class EventEmitter {
    public emit(event: string, data: unknown): void;
  }

  export function initializeHandlers(): Handlers;
  export function registerHandlers(): void;

  export interface PageData {
    element: HTMLDivElement;
    height: number;
    id: string;
    width: number;
    position: number;
  }

  export interface Flow {
    pages: PageData[];
  }

  class TargetText extends Handler {}

  export class Chunker extends EventEmitter {
    public flow(content: string, renderTo: HTMLElement): Promise<Flow>;
    public destroy(): void;
  }

  class Handler {
    public constructor(chunker: Chunker, polisher: Polisher, caller: object);
  }

  class Handlers {
    public constructor(chunker: Chunker, polisher: Polisher, caller: object);
  }

  export class Hook {
    public trigger(...args: unknown[]): void | Promise<void>;
  }

  type PolisherHooks =
    | 'onUrl'
    | 'onAtPage'
    | 'onAtMedia'
    | 'onRule'
    | 'onDeclaration'
    | 'onContent'
    | 'onSelector'
    | 'onPseudoSelector'
    | 'onImport'
    | 'beforeTreeParse'
    | 'beforeTreeWalk'
    | 'afterTreeWalk';

  export class Polisher {
    protected sheet: unknown[];
    protected inserted: string[];
    protected hooks: Record<PolisherHooks, Hook>;
    public constructor(setup?: boolean);
    public setup(): unknown;
    public add(...sheets: string[]): Promise<string[]>;
    public convertViaSheet(cssStr: string, href?: string): Promise<string>;
    public insert(text: string): void;
    public destroy(): void;
  }

  interface PreviewerOptions {}

  type PreviewerHook = 'beforePreview' | 'afterPreview';

  export class Previewer extends EventEmitter {
    protected settings: PreviewerOptions;
    protected polisher: Polisher;
    protected chunker: Chunker;
    protected handlers: Handlers;
    protected hooks: Record<PreviewerHook, Hook>;
    protected size: {
      width: { value: number; unit: string };
      height: { value: number; unit: string };
      format: unknown;
      orientation: unknown;
    };

    public constructor(options?: PreviewerOptions);
    public preview(
      content: string | HTMLElement | null,
      stylesheets: string[] | null,
      renderTo: HTMLElement
    ): Promise<Flow>;

    protected registerHandlers(): void;
    protected initializeHandlers(): Handlers;
    protected getParams(name: string): string;
    protected wrapContent(): string;
    protected removeStyles(): void;
  }
}
