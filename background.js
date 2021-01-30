async function getAllFriendRequests(page) {
    let api = "https://www.brick-hill.com/friends/"
    let req = await fetch(api + page).catch(() => {
        if (req.status === 503)
            return getAllFriendRequests(page)
    })
    let html = await req.text()

    let userMatches = html.match(/user\/([0-9]+)/g)

    // this will also match the link to your profile, so we need to remove it from the array
    userMatches.splice(0, 1)
    if (!userMatches) return null

    return userMatches.map(str => str.replace("user/", ""))
}

async function friendsPOSTRequest(data) {
    await fetch("https://www.brick-hill.com/friends", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(data)
    }).catch(() => {
        if (req.status === 503)
            return friendsPOSTRequest(data)
    })
}

browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "friends") {
        // let allRequests = []
        // let counter = 1
    
        // while (true) {
        //     let req = await getAllFriendRequests(counter)
        //     if (!req.length) break
        //     allRequests = allRequests.concat(req)
        //     ++counter
        // }
    
        // allRequests.forEach(async user => {
        //     await friendsPOSTRequest({
        //         "_token": request.csrfToken,
        //         "userId": user,
        //         "type": request.type
        //     })
        // })

        // grammar matters
        let verb = (request.type === "decline") ? "declined" : "accepted"

        sendResponse({
            response: `Successfully ${verb} all your friend requests`
        })
    }
})