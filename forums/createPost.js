const forumBody = document.getElementById("body")
const bhpSettings = JSON.parse(window.localStorage.getItem("bhp-settings"))
const lineBreaks = 6
const imgurRegex = /https:\/\/(i.)?imgur.com(\/a|\/gallery)?\/[0-9a-zA-Z]+(.png|.gif|.jpg|.jpeg)/gi
const discordRegex = /https:\/\/cdn\.discordapp\.com\/(attachments|emojis)\/[0-9]+(\/[0-9]+\/)?[a-zA-Z0-9\.\-\_\-]+(.png|.gif|.jpg|.jpeg)(\?v=1)?/gi
const youtubeRegex = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
const maxPxSize = 600

const allowedEmbedDomains = [
    "media.discordapp",
    "cdn.discordapp",
    "youtube.com",
    "youtu.be",
    "i.imgur.com",
    "tenor.com"
]
const embedFormatRegExp = /\!\(((https?:\/\/[a-zA-Z0-9\.]+)(.+))\)/i
const safeLinkRegExp = /\!\(<a target="_blank" href="(.+)\)">(.+)\)<\/a>/i

function generateImageSrc(src) {
    if (src.includes("tenor.com") && !src.endsWith(".gif"))
        return src + ".gif"
    return src
}

function getYoutubeID(link) {
    let match = link.match(youtubeRegex)
    if (!match) return null

    return "https://www.youtube.com/embed/" + ((match[5] === "watch") ? match[6].match(/\?t=[0-9]+\&v=([a-zA-Z0-9]+)&feature=youtu.be/)[1] : match[5]).toUpperCase()
}

if (bhpSettings.forumSignature) {
    forumBody.innerHTML = "\n".repeat(lineBreaks) + bhpSettings.forumSignature.substring(0, 100)
}

let replies = document.querySelectorAll("blockquote.red")

if (bhpSettings.forumImageEmbeds) {
    for (let reply of replies) {

        // Make the RegExps global
        let match   = reply.innerHTML.match( new RegExp(embedFormatRegExp, "gi") )
        let sfMatch = reply.innerHTML.match( new RegExp(safeLinkRegExp, "gi") )
        if (!match && !sfMatch) continue

        const domainRegExp = new RegExp(allowedEmbedDomains.join("|"))


        for (let link in match) {

            // [0] = !(https://youtube.com/watch?v=xxxxxxxxx)
            // [1] = https://youtube.com/watch?v=xxxxxxxxx
            // [2] = https://youtube.com
            match[link] = match[link].toLowerCase()
            const formatMatch = match[link].match(embedFormatRegExp)

            if (!domainRegExp.test(formatMatch[2])) continue
            
            let textElement = Array.from( reply.childNodes ).find(el => {
                if (!el.data) return
                return el.data.toLowerCase().includes(formatMatch[0])
            })

            let img = document.createElement("img")
            img.style = `max-height:${maxPxSize}px; max-width:100%;`
            img.src = generateImageSrc(formatMatch[1])

            // Replace the image with the formatted link
            reply.insertBefore(img, textElement)
            textElement.remove()

        }

        for (let link in sfMatch) {
            // [0] = !(<a target=\"_blank\" href=\"https://www.youtube.com/watch?v=xxxxxx)\">https://www.youtube.com/watch?v=xxxxxx)</a>
            // [1] = https://youtube.com/watch?v=xxxxxxxxx
            sfMatch[link] = sfMatch[link].toLowerCase()
            const formatMatch = sfMatch[link].match(safeLinkRegExp)

            if (!domainRegExp.test(formatMatch[1])) continue

            let textElement = Array.from( reply.childNodes ).find(el => {
                if (!el.href) return
                return el.href.toLowerCase().includes(formatMatch[1])
            })


            const iframe = document.createElement("iframe")
            iframe.src = getYoutubeID(formatMatch[1])
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            iframe.allowfullscreen = ""
            iframe.width = "560"
            iframe.height = "316"
            iframe.style = "border:none"

            // Replace the image with the formatted link
            reply.insertBefore(iframe, textElement)
            textElement.remove()

            // We need this because the safe links would mess up my format and just leave a "!(" before the iframe
            Array.from( reply.childNodes ).find(el => {
                if (!el.data) return
                return el.data.endsWith("!(")
            }).remove()
        }
    }
}

// for (let reply of replies) {
//     let linkCopies = []
//     let match = reply.innerHTML.match(imgurRegex) || reply.innerHTML.match(discordRegex)
//     let adminImages = Array.from(reply.childNodes).filter(img => img.tagName === "IMG" && ( img.src.match(imgurRegex) || img.src.match(discordRegex) ))

//     // I'm literally just hoping no admin causes this bug since I can't think of a way to fix it right now
//     // The bug is that if an admin embeds an image using the ![]() format and just posting their link to let BH+ embed it, only the one link formatted with ![]() will embed
//     // Other than that, they can do both with just different links

//     if (match) {
//         for (let link in match) {

//             // checks to see if the link has already been embedded
//             if (linkCopies.includes(match[link])) continue
//             if (adminImages.find(img => img.src === match[link])) continue
            
//             // in case there are 2 of one link
//             // using replace here so that the regex converts the question mark to \? instead of leaving it as just ?
//             // leaving it as just ? messed up matching with discord emoji links
//             let imageRegExp = new RegExp(match[link].replace("?", "\\?"), "g")
//             let copyMatch = reply.innerHTML.match(imageRegExp)

//             if (copyMatch.length === 1) {
//                 reply.innerHTML = reply.innerHTML.replace(imageRegExp, `<img src='${match[link]}' style='max-height:500px;max-width:500px;'>`)
//                 continue
//             }

//             // if there are more than one of the same link, then embed every occurance and add the link to the linkCopies array
//             reply.innerHTML = reply.innerHTML.replace(imageRegExp, `<img src='${match[link]}' style='max-height:500px;max-width:500px;'>`)
//             linkCopies.push(match[link])

//         }
//     }
// }