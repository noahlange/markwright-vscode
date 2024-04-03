import { Renderer } from './Renderer';
import { throttleRAF } from '../utils';

export class Viewer {
  private root = document.getElementById('root')!;
  private node: HTMLDivElement | null = null;
  private renderer: Renderer | null = null;

  private getParentPage(e: HTMLElement | null): HTMLElement | null {
    return e?.classList.contains('pagedjs_page') ? this.getParentPage(e.parentElement) : e;
  }

  public async render(data: { html: string; css: string }): Promise<void> {
    this.renderer?.destroy();
    this.renderer = new Renderer();

    const next = document.createElement('div');
    next.innerHTML = await this.renderer.render(data.html ?? '', data.css ?? '');

    if (this.node) {
      this.root.replaceChild(next, this.node);
    } else {
      this.root.appendChild(next);
    }

    this.node = next;
    this.resize();
  }

  /**
   * When the user opens a file, scroll to the top of the page with the corresponding output.
   */
  public focus(filename: string): void {
    const selector = `h1[data-src="${filename}"]`;
    const h1 = this.root.querySelector<HTMLElement>(selector);
    const page = this.getParentPage(h1) ?? h1;
    page?.scrollIntoView({ behavior: 'smooth' });
  }

  public resize = throttleRAF(() => {
    const pages = this.root.querySelector('.pagedjs_pages');
    if (pages) {
      const scale = window.innerWidth / pages.scrollWidth;
      this.root.style.setProperty('transform', `scale(${scale})`);
      this.root.style.setProperty('transform-origin', `0 0`);
    }
  });

  public constructor() {
    window.addEventListener('resize', this.resize);
  }
}
