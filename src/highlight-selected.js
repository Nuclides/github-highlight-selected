(function() {

    var fileLineContainer = '.js-file-line-container';
    var lastPage = location.href;
    var textNodes = [];
    var highlighted = [];
    var highlightedIndex;

    function wrapTextNodes(query) {
        // Why did all the gawd dam text selection stuff fail, urgggggghh....atleast this worked!
        function getTextNodesIn(elem, opt_fnFilter) {
            if (elem) {
                for (var nodes = elem.childNodes, i = nodes.length; i--;) {
                    var node = nodes[i],
                        nodeType = node.nodeType;
                    if (nodeType == 3) {
                        if (!opt_fnFilter || opt_fnFilter(node, elem)) {
                            if (node.nodeValue.trim() != '') textNodes.push(node);
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
        textNodes.forEach(function(node, index) {
            var span = document.createElement('span');
            span.textContent = node.nodeValue;
            node.parentNode.replaceChild(span, node);
            textNodes[index] = span;
        });
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

    document.body.addEventListener('mousedown', function(e) {
        if (e.which != 1 || highlighted.length == 0) return;
        restore();
    });

    document.body.addEventListener('mouseup', function(e) {
        if (e.which != 1) return;
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
        elShow(highlighted[highlightedIndex]);
        e.preventDefault()
        return false;
    });

    function elShow(el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom >= (window.innerHeight || document.documentElement.clientHeight)) el.scrollIntoView(false);
        else if (rect.top <= 0) el.scrollIntoView(true);
    }

    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = ".ghs-highlight, .ghs-partial-highlight { border: 1px solid rgba(255, 181, 21, .6); background-color: rgba(255, 181, 21, .3);}";
    document.body.appendChild(css);

})();