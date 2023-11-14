const template = document.createElement('template');
template.innerHTML = `
<div>
    <slot>
        <p>this is the light dom cotent </p>
    </slot>
    <p>this is the shadow content </p>
</div>
`;

class MyApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = 'hello';
        let clone = template.content.cloneNode(true);
        this.shadowRoot.appendChild(clone);
    }
}

customElements.define('my-app', MyApp);

/**#
 *  what are these methods called static get styles() and static get observedAttributes()
 *  what is ::part and ::slotted
 *  how to use variales 
 *  named shadow parts 
 *   :host and :host-context 
 *    :defined 
 *   adoptStyle  
 *  there have a life cycle 
 *  connectedCallback : called when the element is added to the DOM
 *  disconnectedCallback : called when the element is removed from the DOM
 *  attributeChangedCallback : called when an attribute is added, removed, updated, or replaced
 *  
 * 
 *  the render fucntion 
 *  
*/