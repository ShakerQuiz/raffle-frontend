import { css, html, LitElement, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { when } from 'lit/directives/when.js'
import { Task } from '@lit/task'

export class GameApp extends LitElement {
  #fetchTask = new Task(this, {
    args: () => [this.id],
    task: async ([id], { signal }) => {
      const url = new URL('api/raffle', 'https://shakerquiz-raffle-bot-5f4e.twc1.net')
      url.searchParams.set('id', id)
      const response = await fetch(url, { signal })
      if (!response.ok) throw response.statusText
      return await response.json()
    },
  })

  constructor() {
    super()
    const id = new URL(location).searchParams.get('id')
    if (id) this.id = id
  }

  static get styles() {
    return css`
      @import '/app.css';
    `
  }

  static get properties() {
    return {
      choice: { type: Number },
      id: { type: String, reflect: true },
    }
  }

  gameTemplate() {
    return html`
      <div class="game">
        <div class="field">
          <button class="fish" @click="${() => (this.choice = 1)}">fish</button>
          <button class="stake" @click="${() => (this.choice = 2)}">
            stake
          </button>
        </div>
      </div>
    `
  }

  linksTemplate({ vk, telegram } = {}) {
    return html` <div class="tip">
        Для участия в розыгрыше перейдите в удобный мессенджер и получите свой
        номер участника
      </div>
      <div class="links">
        ${this.linkTemplate('vk', 'https://vk.me', vk, 'ref')}
        ${this.linkTemplate('telegram', 'https://t.me', telegram, 'start')}
      </div>`
  }

  linkTemplate(classname, base, path, param) {
    if (!path) return nothing
    const { id, choice } = this
    const url = new URL(path, base)
    url.searchParams.set(param, btoa(JSON.stringify({ id, choice })))
    return html`<a href="${url}" class="${classMap({ [classname]: true })}"
      >${classname}</a
    >`
  }

  render() {
    return html`
      <style>
        ${this.constructor.styles.toString()}
      </style>
      ${when(
        this.id,
        () =>
          this.#fetchTask.render({
            error: () => html` <div>Игра не найдена</div>`,
            initial: () => html` <div>Получение данных...</div>`,
            pending: () => html` <div>Получение данных...</div>`,
            complete: data => html`
              ${when(
                this.choice,
                () => nothing,
                () => html` <div class="title">Покорми манула</div>`
              )}
              ${this.gameTemplate()}
              ${when(this.choice, () => this.linksTemplate(data))}
            `,
          }),
        () => html` <div>Игра не найдена</div>`
      )}
    `
  }
}

customElements.define('game-app', GameApp)
