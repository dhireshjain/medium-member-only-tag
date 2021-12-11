// content.js

let MEDIUM_LINK_REGEX = new RegExp('^https:\/\/.*medium.com\/.*');
let MEMBER_ONLY_HTML_IDENTIFIER = '[aria-label="Member only content"]';
let CLASSNAME_CONTAINING_LINK = 'g'

// List of search links
var links = document.getElementsByClassName(CLASSNAME_CONTAINING_LINK)
// Map of index to div A element
var aDivs = new Map()

// Open a long running connection with backgroung.js
var port = chrome.runtime.connect({name: "getLinks"});

for(var i=0; i<links.length; i++) {
    var link = findLink(i);
    if(link != null && checkIfMediumLink(link.href)) {
        aDivs[i] = link
        // Fetch html content from background.js
        port.postMessage({link: link.href, idx: i});
    }
}

// Listener for response from background.js
port.onMessage.addListener(function(response) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(response.htmlContent, "text/html");
    isMemberOnlyArticle = isMemberOnlyContent(doc)
    
    if(isMemberOnlyArticle) {
        aDivs[response.idx].appendChild(createMembersOnlyLabel());
    }
    return true;
});

// Recursively search for div A link from the parent div element
function findLink(index) {
    var elem = links[index]
    for(var child=elem.firstChild; child!==null; child=child.nextSibling) {
        if(child.tagName == 'A') return child
        else {
            while(child.firstElementChild != null) {
                child = child.firstElementChild;
                if(child.tagName == 'A') return child
            }
        }
    }
    return null
}

// Check if link is from www.medium.com domain
function checkIfMediumLink(link) {
    return MEDIUM_LINK_REGEX.test(link)
}

function isMemberOnlyContent(htmlDoc) {
    return htmlDoc.querySelector(MEMBER_ONLY_HTML_IDENTIFIER) != null;
}

function createMembersOnlyLabel() {
    var textNode = document.createTextNode("Members Only")
    var icon = document.createElement("icon")
    icon.style.color = "cadetBlue"
    icon.style.backgroundColor = "antiquewhite"
    icon.style.padding = "3px";
    icon.style.margin = "3px";
    icon.appendChild(textNode)
    return icon
}