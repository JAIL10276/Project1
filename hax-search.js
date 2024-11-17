/**
 * Copyright 2024 JAIL10276
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";

/**
 * `hax-search`
 *
 * @demo index.html
 * @element hax-search
 */
export class HaxSearch extends DDDSuper(I18NMixin(LitElement)) {

  static get tag() {
    return "hax-search";
  }

  constructor() {
    super();
    this.title = "";
    this.t = this.t || {};
    this.t = {
      ...this.t,
      title: "Title",

    };
    this.registerLocalization({
      context: this,
      localesPath:
        new URL("./locales/hax-search.ar.json", import.meta.url).href +
        "/../",
      locales: ["ar", "es", "hi", "zh"],
    });
  }

  // Lit reactive properties
  static get properties() {
    return {
      ...super.properties,
      title: { type: String },
    };
  }

  // Lit scoped styles
  static get styles() {
    return [super.styles,
    css`
      :host {
        display: block;
        color: var(--ddd-theme-primary);
        background-color: var(--ddd-theme-accent);
        font-family: var(--ddd-font-navigation);
      }
      .wrapper {
        /*
        margin: var(--ddd-spacing-2);
        padding: var(--ddd-spacing-4);
        */
        display: flex;
        justify-content: center;

      }
      #analyze-button{
        padding: var(--ddd-spacing-2);
        box-sizing: content-box;
      }
      #input{
        border-radius: var(--ddd-radius-sm);
        border: var(--ddd-border-md);
        height: 50px;
        padding: 0 var(--ddd-spacing-2);
        width: 270px;
        font-size: inherit;
        
      }
      h3 span {
        font-size: var(--hax-search-label-font-size, var(--ddd-font-size-s));
      }
    `];
  }

  // Lit render the HTML
  render() {
    return html`
<div class="wrapper">
  <input id="input" placeholder="What are you looking for? Try haxtheweb.org "/>
  <button id="analyze-button" class="button" >Analyze</button>
</div>`;
  }
  inputChanged(e) {
    this.value = this.shadowRoot.querySelector('#input').value;
  }
  // life cycle will run when anything defined in `properties` is modified
  updated(changedProperties) {
    // see if value changes from user input and is not empty
    if (changedProperties.has('value') && this.value) {
      this.updateResults(this.value);
    }
    else if (changedProperties.has('value') && !this.value) {
      this.items = [];
    }
    // @debugging purposes only
    if (changedProperties.has('items') && this.items.length > 0) {
      console.log(this.items);
    }
  }
  updateResults(value) {
    this.loading = true;
    fetch(`https://haxtheweb.org/site.json`).then(d => d.ok ? d.json(): {}).then(data => {
      if (data.collection) {
        this.items = [];
        this.items = data.collection.items;
        this.loading = false;
      }
    });
  }
  /**
   * haxProperties integration via file reference
   */
  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url)
      .href;
  }
}

globalThis.customElements.define(HaxSearch.tag, HaxSearch);
