
import CatClient from 'https://cdn.jsdelivr.net/npm/ccat-api@0.10.6/+esm'

let ccat

const thinkingMessage = "Thinking..."
const firstMessage = "How can I help you? \n\nPlease remember I'm an AI, so I may be wrong. Be sure to verify my responses."

document.addEventListener('alpine:init', function () {
    initCat()
    initAlpineStore()
})

const initAlpineStore = () => {

    Alpine.store("store", {
        waitingFirstToken: false,
        waitingLastToken: false,
        query: "",
        messages: [firstMessage],//"stocazzoooooooooooooooooooooooooo".split(""),

        send: function () {
            ccat.send(this.query, {
                "custom": "more data"
            })

            this.messages.push(this.query)
            this.messages.push(thinkingMessage)
            this.waitingFirstToken = true
            this.waitingLastToken = true
            this.query = ""
            
            let historyEl = this.$refs.history
            setTimeout(function(){
                scrollDown(historyEl)
            })
        }
    })
}

function initCat() {
    
    ccat = new CatClient({
        baseUrl: 'localhost',
        userId: 'peepino'
    })

    ccat.onMessage((msg) => {
        console.log(msg)
        let store = Alpine.store("store")
        let nMessages = store.messages.length
        
        if(msg.type == "chat_token") {
            if(store.waitingFirstToken){
                store.messages[nMessages - 1] = msg.content
                store.waitingFirstToken = false
            } else {
                store.messages[nMessages - 1] += msg.content
            }
        }
        
        if(msg.type == "chat") {
            store.messages[nMessages - 1] = msg.content
            store.waitingLastToken = false
        }
        
        if(msg.type == "notification") {
            console.warn("Notification")
            console.warn(msg.content)
        }

        // scroll down chat history
        scrollDown(store.$refs.history)
    })

    ccat.onError = function (msg) {
        console.error(msg)
    }

    console.log(ccat)

}


function scrollDown(el){
    el.scrollTo({
        top: el.scrollHeight,
        behavior: "instant"
    })
}

