window.addEventListener('load', function() {
    var fileLineContainer = '.js-file-line-container';
    var lastPage = location.href;
    var textNodes = [];
    var highlighted = [];
    var highlightedIndex;

    function wrapTextNodes(query) {
        // Why did all the gawd dam text selection stuff fail, urgggggghh....at least this worked!
        // http://cwestblog.com/2014/03/14/javascript-getting-all-text-nodes/
        function getTextNodesIn(elem, opt_fnFilter) {
            if (elem) {
                for (var nodes = elem.childNodes, i = nodes.length; i--;) {
                    var node = nodes[i],
                        nodeType = node.nodeType;
                    if (nodeType == 3) {
                        if (!opt_fnFilter || opt_fnFilter(node, elem)) {
                            if (node.nodeValue.trim() != '') {
                                var span = document.createElement('span');
                                span.textContent = node.nodeValue;
                                node.parentNode.replaceChild(span, node);
                                textNodes.push(span);
                            }
                        }
                    } else if (nodeType == 1 || nodeType == 9 || nodeType == 11) {
                        getTextNodesIn(node, opt_fnFilter)
                    }
                }
            }
        }
        var el = document.querySelector(query);
        if (!el) return;
        textNodes = [];
        getTextNodesIn(el);
        textNodes.reverse();
    }

    wrapTextNodes(fileLineContainer);

    // watch for page updating...
    var whatToObserve = {
        childList: true,
        attributes: false,
        subtree: false,
        attributeOldValue: false /*, attributeFilter: []*/
    };
    var mutationObserver = new MutationObserver(function(mutationRecords) {
        if (location.href != lastPage) {
            lastPage = location.href;
            wrapTextNodes(fileLineContainer);
        }
    });
    mutationObserver.observe(document.querySelector('#js-repo-pjax-container'), whatToObserve);

    function restore() {
        highlighted.forEach(function(el) {
            if (el.classList.contains('ghs-highlight')) el.classList.remove("ghs-highlight");
            else {
                var parent = el.parentNode;
                parent.replaceChild(el.childNodes[0], el);
                parent.normalize();
            }
        })
        highlighted = [];
    }

    function selectElement(el) {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    function splitReplace(el, str, selectionIndex) {
        var strLength = str.length;
        var source = el.textContent;
        var pos = -1;
        var lastPos = 0;
        var result = document.createDocumentFragment();
        var selected;
        while ((pos = source.indexOf(str, pos + 1)) != -1) {
            if (pos > lastPos) result.appendChild(document.createTextNode(source.substring(lastPos, pos)));
            var highlight = document.createElement('span');
            highlight.textContent = source.substring(pos, pos + strLength);
            highlight.classList.add('ghs-partial-highlight');
            if (pos === selectionIndex) {
                selected = highlight;
                highlightedIndex = highlighted.length;
            }
            result.appendChild(highlight);
            highlighted.push(highlight);
            lastPos = pos + strLength;
        }
        result.appendChild(document.createTextNode(source.substring(lastPos)));
        el.replaceChild(result, el.childNodes[0]);
        if (selected) selectElement(selected);
    }

    var canvasDraggin = false;

    function barScrollToY(y){
        var iHieght = document.documentElement.clientHeight;
        var box = document.documentElement.getBoundingClientRect();
            var heightRatio = box.height / iHieght;
            var half= iHieght/2 ;
            window.scrollTo(window.pageXOffset,(y * heightRatio)-half);
    }

    document.body.addEventListener('mousedown', function(e) {
        if (e.target == canvas && e.which===1) {
            canvasDraggin = true;
            barScrollToY(e.clientY);
            window.addEventListener('mousemove', canvasDragger);
            return;
        }
        if (e.which != 1 || highlighted.length == 0) return;
        restore();
        canvas.style.display = 'none';
    });

    function canvasDragger(e) {
        if (!canvasDraggin) return;
        barScrollToY(e.clientY);
        e.preventDefault();
        return false;
    }

    document.body.addEventListener('mouseup', function(e) {
        if (e.which != 1) return;
        if(canvasDraggin){
            canvasDraggin = false;
            window.removeEventListener('mousemove', canvasDragger);
            return;
        }
        var selection = window.getSelection();
        var selected = selection.toString().trim();

        if (selected) {
            textNodes.forEach(function(el) {
                if (el.textContent == selected) {
                    el.classList.add("ghs-highlight");
                    if (el == e.target) highlightedIndex = highlighted.length;
                    highlighted.push(el);
                } else if (el.textContent.indexOf(selected) > -1) {
                    if (el != e.target) splitReplace(el, selected);
                    else splitReplace(el, selected, Math.min(selection.anchorOffset, selection.focusOffset));
                };

            });
            updateHighlighter();
        }
    });

    window.addEventListener('keydown', function(e) {

        if (!highlighted.length > 0 || !e.ctrlKey) return;

        if (e.keyCode == 38) { // down key
            highlightedIndex--;
            if (highlightedIndex < 0) highlightedIndex = highlighted.length - 1;

        } else if (e.keyCode == 40) { // up key
            highlightedIndex++;
            if (highlightedIndex >= highlighted.length) highlightedIndex = 0;

        } else return;

        selectElement(highlighted[highlightedIndex]);
        showElement(highlighted[highlightedIndex]);
        updateHighlighter();
        e.preventDefault();
        return false;
    });

    function showElement(el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom >= document.documentElement.clientHeight) el.scrollIntoView(false);
        else if (rect.top <= 0) el.scrollIntoView(true);
    }

    // Do the Highlighter bar on the right
    canvas = document.createElement("canvas");

    canvas.setAttribute('id', 'ghs-bar');
    var canvasUpdating = false;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    function generateHighlighter() {
        var canvasHeight = window.document.documentElement.clientHeight; // Height to make the bar
        var heightRatio = canvasHeight / document.documentElement.getBoundingClientRect().height;

        canvas.style.display = 'block';
        canvas.height = canvasHeight;
        canvas.width = 20;

        var lastY = -1;
        var y = 0;
        highlighted.forEach(function(el, index) {
            var box = el.getBoundingClientRect();
            y = (((window.scrollY + box.top) * heightRatio) + 0.5) | 0;
            if (y == lastY && index != highlightedIndex) return;

            if (index == highlightedIndex) ctx.fillStyle = "rgba(54, 149, 230, 1)";
            else ctx.fillStyle = "rgba(241, 209, 47, 1)";
            ctx.fillRect(0, y, canvas.width, (((box.height * heightRatio) + .5) | 0) || 1);
            lastY = y;
        })

        var y1 = ((window.scrollY * heightRatio) + .5) | 0;
        var y2 = ((canvasHeight * heightRatio) + .5) | 0;
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(0, y1, canvas.width, y2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(204, 204, 204, 1)";
        ctx.strokeRect(0, y1, canvas.width, y2);
        canvasUpdating = false;
    }

    function updateHighlighter() {
        if (highlighted.length && canvasUpdating == false) {
            canvasUpdating = true;
            window.requestAnimationFrame(generateHighlighter);
        }
    }

    window.addEventListener('scroll', updateHighlighter);
    window.addEventListener('resize', updateHighlighter);

    // Add the css...with a content script this would be seperate but I put it here for dev purposes..this was made in the Snippets section of the dev tools Sources panel
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = (function() {
/*
.ghs-highlight,
.ghs-partial-highlight {
    outline: 1px solid rgba(255, 181, 21, .6);
    background-color: rgba(255, 181, 21, .3);
}

#ghs-bar {
    width: 16px;
    border-left: 1px solid #ccc;
    background-color: #f3f3f3;
    position: fixed;
    top: 0px;
    bottom: 0px;
    right: 0;
    height: 100%;
    display: none;
}
*/
    }).toString().split('\n').slice(2, -2).join('\n').trim();
    document.body.appendChild(css);
});
