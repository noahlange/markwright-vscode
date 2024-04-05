import { Renderer } from './Renderer';
import { throttleRAF } from '../utils';

import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeProgressRing
} from '@vscode/webview-ui-toolkit';

import layoutSheet from '../icons/layout-sheet.svg';
import layoutSpread from '../icons/layout-spread.svg';

provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeProgressRing());

enum Layout {
  SHEET = 1,
  SPREAD = 2
}

export class Viewer {
  private root = document.getElementById('root')!;
  private ui = document.getElementById('ui')!;
  private node: HTMLDivElement | null = null;
  private renderer: Renderer | null = null;
  private layout: Layout = Layout.SPREAD;
  private loading = false;

  private getParentPage(e: HTMLElement | null): HTMLElement | null {
    return e?.classList.contains('pagedjs_page') ? this.getParentPage(e.parentElement) : e;
  }

  public async render(data: { html: string; css: string }): Promise<void> {
    this.toggleLoading();
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
    this.toggleLoading();
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
    const pages = this.root.querySelector('.pagedjs_pages') as HTMLElement | null;
    if (pages) {
      const scale = (window.innerWidth - 32) / pages.scrollWidth;
      pages.style.setProperty('transform', `scale(${scale})`);
      pages.style.setProperty('transform-origin', `0 0`);
    }
  });

  private toggleLoading = (next = !this.loading) => {
    const loader = this.ui.querySelector('#loading') as HTMLElement;
    if (loader) {
      this.loading = next;
      loader.style.visibility = next ? 'normal' : 'hidden';
    }
  };

  private toggleLayout = (next: Layout | null = null) => {
    const button = this.ui.querySelector('#toggle-spread');
    if (button) {
      this.layout = next ??= this.layout === Layout.SHEET ? Layout.SPREAD : Layout.SHEET;
      if (this.layout === Layout.SHEET) {
        this.root.classList.value = 'layout-spread';
        button.innerHTML = layoutSpread;
      } else {
        this.root.classList.value = 'layout-sheet';
        button.innerHTML = layoutSheet;
      }
    }
    this.resize();
  };

  public constructor() {
    window.addEventListener('resize', this.resize);
    this.toggleLayout(this.layout);

    this.ui
      .querySelector('#toggle-spread')
      ?.addEventListener('click', () => this.toggleLayout());
  }
}
