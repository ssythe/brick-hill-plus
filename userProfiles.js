let url = window.location.href
let userId = url.match(/-?[0-9]+/)[0]
let api = "https://api.brick-hill.com/v1/games/retrieveAvatar?id="
let hatApi = "https://api.brick-hill.com/v1/shop/"

async function getItemData(id) {
    let data = await fetch(hatApi + id)
    return data.json()
}

async function appendItems(data) {
    let s = `<div class="top blue">Wearing</div> <div class="content" style="text-align:center;">`
    // counting to see if the user is wearing anything at all
    let zeroCount = 0
    
    for (let hat of data.hats) {
        if (hat === 0) {
            ++zeroCount
            continue
        }
        let req = await getItemData(hat)
        let hatData = req.data

        s += ` <a href="/shop/${hat}">
                    <div class="profile-card award">
                        <img src="${hatData.thumbnail}">
                        <span class="ellipsis">${hatData.name}</span>
                    </div>
                </a>
            `
    }

    for (let item of Object.values(data)) {
        if (isNaN(item)) continue
        if (item === 0) {
            ++zeroCount
            continue
        }
        let req = await getItemData(item)
        let itemData = req.data

        s += ` <a href="/shop/${item}">
                    <div class="profile-card award">
                        <img src="${itemData.thumbnail}">
                        <span class="ellipsis">${itemData.name}</span>
                    </div>
                </a>
            `
    }
    s += `</div>`

    if (zeroCount === 12)
        return null

    return s
}

if (userId) {

    if (userId == 127118) {
        let username = document.getElementsByClassName("ellipsis")[3]
        username.innerHTML += "   <img src='https://images.emojiterra.com/twitter/512px/1f1e7-1f1e9.png' style='height:20px'>"
    }

    fetch(api + userId)
    .then(res => res.json())
    .then(data => {
        let mainDiv = document.getElementsByClassName("col-6-12")[1]
        let card = document.createElement("div")
        card.className = "card"

        // wait for the html then append it to the DOM
        appendItems(data.items).then(html => {
            if (html) {
                card.innerHTML = html
                mainDiv.appendChild(card)
            }
        })
    })
}
