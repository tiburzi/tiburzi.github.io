class QuoteCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          --bg: #fff;
          --border: #e6e6e6;
          --accent: var(--color-accent-soft);
          --text: var(--color-text);
          display: block;
          max-width: 600px;
        }
        .card {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          text-align: left;
        }
        .quote {
          /*font-size: 1.05rem;*/
          font-style: italic;
          /*color: var(--text);*/
          margin: 0 0 10px 0;
          line-height: 1.4;
        }
        .author {
          font-weight: 600;
          color: var(--accent);
          font-size: 0.95rem;
          text-decoration: none;
        }
        .author:hover{text-decoration: underline;}
        .author[aria-disabled="true"] {
          color: var(--color-text);
          text-decoration: none;
          cursor: default;
        }
        .author:empty { display: none; }
      </style>

      <div class="card">
        <p class="quote"><slot name="text">[No quote provided]</slot></p>
        <a class="author" part="author" aria-disabled="true">&mdash; <slot name="author"></slot></a>
      </div>
    `;

    this._authorAnchor = shadow.querySelector('.author');
  }

  connectedCallback() {
    this._applyLink();
  }

  static get observedAttributes() { return ['href', 'target']; }

  attributeChangedCallback(name) {
    if (name === 'href' || name === 'target') this._applyLink();
  }

  _applyLink() {
    const href = this.getAttribute('href');
    if (href) {
      this._authorAnchor.setAttribute('href', href);
      this._authorAnchor.setAttribute('target', this.getAttribute('target') || '_blank');
      this._authorAnchor.setAttribute('rel', 'noopener noreferrer');
      this._authorAnchor.removeAttribute('aria-disabled');
    } else {
      this._authorAnchor.removeAttribute('href');
      this._authorAnchor.removeAttribute('target');
      this._authorAnchor.removeAttribute('rel');
      this._authorAnchor.setAttribute('aria-disabled', 'true');
    }
  }
}

customElements.define('quote-card', QuoteCard);
