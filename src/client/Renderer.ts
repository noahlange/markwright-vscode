import type { Flow, PageData } from 'pagedjs';

import { Previewer } from 'pagedjs';

export class Renderer extends Previewer {
  public _pages: PageData[] = [];

  public get pages(): PageData[] {
    return this._pages;
  }

  public async preview(content: string, css: string[], renderTo: HTMLElement): Promise<Flow> {
    await this.hooks.beforePreview.trigger(content, renderTo);
    this.polisher.setup();
    this.handlers = this.initializeHandlers();
    for (const style of css) {
      this.polisher.insert(await this.polisher.convertViaSheet(style));
    }
    const flow = await this.chunker.flow(content, renderTo);
    this._pages = flow.pages.map(page => ({
      element: page.element,
      height: page.height,
      width: page.width,
      id: page.id,
      position: page.position
    }));

    this.emit('rendered', flow);
    await this.hooks.afterPreview.trigger(flow.pages);
    return flow;
  }

  /**
   * Given content and a CSS string, return a rendered HTML document.
   */
  public async render(content: string, css: string): Promise<string> {
    const preview = document.createElement('div');
    document.body.appendChild(preview);
    preview.style.position = 'absolute';
    preview.style.right = '100vw';
    await this.preview(content, [css], preview);
    const html = preview.innerHTML;
    document.body.removeChild(preview);
    return html;
  }

  public destroy(): void {
    this._pages = [];
    this.polisher.destroy();
    this.chunker.destroy();
  }
}
