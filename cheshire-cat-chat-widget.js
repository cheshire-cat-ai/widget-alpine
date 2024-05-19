//import { CatClient } from 'ccat-api'


let ccat
let thinkingMessage = "Thinking..."
let firstMessage = "How can I help you? \n\nPlease remember I'm an AI, so I may be wrong. Be sure to verify my responses."

document.addEventListener('alpine:init', function () {
    initCat()
    initAlpineStore()
})

function initAlpineStore() {

    Alpine.store("store", {
        waitingFirstToken: false,
        waitingLastToken: false,
        query: "",
        messages: [firstMessage],//"stocazzoooooooooooooooooooooooooo".split(""),

        send: function () {
            // TODO: we stringify because it is the raw websocket client
            ccat.send(JSON.stringify({
                "text": this.query
            }))

            this.messages.push(this.query)
            this.messages.push(thinkingMessage)
            this.waitingFirstToken = true
            this.waitingLastToken = true
            this.query = ""
            
            historyEl = this.$refs.history
            setTimeout(function(){
                scrollDown(historyEl)
            })
        }
    })
}

function initCat() {

    ccat = new WebSocket("ws://localhost:1865/ws/piero") // TODO: proper user

    ccat.onmessage = function (ws_message) {

        // TODO: manual parsing because it is the raw websocket client
        mex = JSON.parse(ws_message.data)

        store = Alpine.store("store")
        nMessages = store.messages.length
        
        if(mex.type == "chat_token") {
            if(store.waitingFirstToken){
                store.messages[nMessages - 1] = mex.content
                store.waitingFirstToken = false
            } else {
                store.messages[nMessages - 1] += mex.content
            }
        }
        
        if(mex.type == "chat") {
            store.messages[nMessages - 1] = mex.content
            this.waitingLastToken = false
        }
        
        if(mex.type == "notification") {
            console.warn("Notification")
            console.warn(mex.content)
        }

        // scroll down chat history
        scrollDown(store.$refs.history)
    }

    ccat.onerror = function (mex) {
        console.error(mex)
    }

    console.log(ccat)

}


function scrollDown(el){
    el.scrollTo({
        top: el.scrollHeight,
        behavior: "instant"
    })
}

