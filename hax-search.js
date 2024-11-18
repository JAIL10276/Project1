/**
 * Copyright 2024 JAIL10276
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";
import { ifDefined } from 'lit/directives/if-defined.js';
import '@haxtheweb/hax-iconset/hax-iconset.js';
import '@haxtheweb/simple-icon/simple-icon.js';
import './hax-card.js';
import './hax-data.js';
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
    this.title = "HAX Search";
    this.loading = false;
    this.data = null;
    this.url = '';
    this.query = '';
    this.results = [];
    this.failed = false;

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
      title: {type:String},
      loading: { type: Boolean, reflect: true },
      results: { type: Array, attribute: "search-results", reflect: true },
      query: { type: String, attribute: "search-query" },
      data: { type: Object, reflect: true },
      url: { type: String },
      failed: { type: Boolean, reflect: true },
    };
  }

  // Lit scoped styles
  static get styles() {
    return [super.styles,
    css`
      :host {
        display: block;
        font-family: var(--ddd-font-navigation);
      }
      .hax-search-container{
        display: flex;
        flex-direction: column;
        gap: var(--ddd-spacing-5, 20px);
        max-width: 1500px;
        margin: auto;
        align-items: center;


      }
      .search-wrapper {
        font: inherit;
        display: flex;
        flex-wrap: wrap;
        gap: var(--ddd-spacing-1, 4px);
        max-width: 90vw;
        justify-content: center;
      }
      #analyze-button{
        padding: 0 var(--ddd-spacing-2);
        box-sizing: content-box;
        text-align: center;
        font-size: inherit;
        border-radius: var(--ddd-radius-sm);
        transition: ease-in-out 0.2s;
      }
      #analyze-button:hover{
        transform: scale(1.05);
        transition: ease-in-out 0.2s;
      }
      #analyze-button:active{
        transform: scale(0.95);
        transition: ease-in-out 0.2ms;
      }

      #input{
        border-radius: var(--ddd-radius-sm);
        border: var(--ddd-border-md);
        height: 50px;
        padding: 0 var(--ddd-spacing-2);
        width: 430px;
        font-size: inherit;
        justify-content: space-evenly;
      }

      .hide-error-text{
        display: none;
      }
      h3 span {
        font-size: var(--hax-search-label-font-size, var(--ddd-font-size-s));
      }
      .hax-card-container{
        display: flex;
        flex-wrap: wrap;
        gap: var(--ddd-spacing-4, 16px);
        justify-content: space-evenly;
      }
      hax-card {
        flex: 1 1 300px;
      }

      hax-data{
        flex: 1 1 0;
        justify-items: center;
      }

    `];
  }
  updated() {
    this.toggleText()
  }


  // Lit render the HTML
  render() {
    return html`
      <div class="hax-search-container"

       <!-- Search Bar and Button -->
        <div class="search-wrapper">
          <input
            id="input"
            placeholder="🔍What are you looking for? Try haxtheweb.org"
            @keydown="${(event) =>{if(event.key==='Enter'){this.inputChanged();}}}"
          />
          <button id="analyze-button" @click="${this.inputChanged}"class="button" label="analyze-button" >Analyze 🕵️</button>
        </div>
      ${(this.loading)? html`😎 Loading results for '${this.url}'`: html`
                  ${(this.data === null)?
                      html`<div id="error-notice">❗Incompatible site, 🤔 try something else...</div>`
                      :
                      html `
                        <!-- Preview -->
                        <div class="hax-data-container">
                            <hax-data
                              title=${this.data.title}
                              description=${this.data.description}
                              logo=${this.data.metadata.site.logo}
                              established=${this.convertDate(this.data.metadata.site.created)}
                              lastUpdated=${this.convertDate(this.data.metadata.site.updated)}
                              hexCode=${this.data.metadata.theme.variables.hexCode}
                              theme=${this.data.metadata.theme.name}
                              icon=${this.data.metadata.theme.variables.icon}
                              url=${this.url}
                            ></hax-data>
                        </div>
                        <!-- Cards -->
                        <div class="hax-card-container">
                          ${this.results.length===0?
                          console.log('results is empty')
                          :
                          this.results.map((item) => html`
                            <hax-card
                              title=${item.title}
                              description=${item.description}
                              src="${ifDefined(this.getSrc(item))}"
                              lastUpdated=${this.convertDate(item.metadata.updated)}
                              link="${this.url}${item.slug}"
                              pageHTML="${this.url}${item.location}"
                              readTime="${item.metadata.readtime}"
                            ></hax-card>
                            `
                          )
                          }
                        </div>
                      `}
      `}
                </div>
`;}
  convertDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toUTCString();
  }

  inputChanged(){
    this.query= this.shadowRoot.querySelector('#input').value;
    this.updateResults();
  }
  updateResults() {
    // Loading...
    this.loading = true;
    // Putting crazy things at the start of the URL
    let formattedQuery = this.query.replace(/^(?!https?:\/\/)(.+?)(\/?)$/, "https://$1");
    this.url = '';
    let jsonUrl ='';

    // Getting rid of crazy things at the end of the URL
    switch(formattedQuery) {
      case formattedQuery.endsWith("site.json"):
        this.url = formattedQuery.replace(/site\.json\/?$/, "");
        jsonUrl = formattedQuery;
        break;
      case formattedQuery.endsWith("/"):
        this.url = formattedQuery;
        jsonUrl = `${this.url}site.json`;
        break;
      default:
        this.url = formattedQuery+'/';
        jsonUrl = `${this.url}site.json`;
        break;
    }

    fetch(jsonUrl)
      .then(response => {
        if (!response.ok) {
        }
        return response.json();
      })
      .then(data => {
        if (data.items) {
          this.results = [];
          this.results = data.items;
          this.data=null;
          this.data = data;
          this.loading = false;
          this.requestUpdate();
        }})
      .catch(error =>{
        this.loading = false;
        this.results = [];
        this.data = null;
        this.failed = true;
        console.log('fetch failed: ');
      });


  }
  toggleText(){
    const text = this.shadowRoot.getElementById('error-notice');
    if(text){
    if (!this.failed){
      text.classList.add('hide-error-text');
    }
    else if(!this.failed){
      text.classList.remove('hide-error-text');
    }
    }
  }
  getSrc(item){
    let images = item.metadata.images;
    if(images && images.length > 0) {
      console.log(this.url+images[0]);
      return (this.url+images[0]);
    }
    else{
      return '';
    }
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
