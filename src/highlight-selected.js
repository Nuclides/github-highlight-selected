(function() {

    var fileLineContainer = '.js-file-line-container';
    var lastPage = location.href;
    var textNodes;

    function wrapTextNodes(query) {
        // Why did all the gawd dam text selection stuff fail, urgggggghh....atleast this worked!   http://cwestblog.com/2014/03/14/javascript-getting-all-text-nodes/
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
        [].forEach.call(document.querySelectorAll(".ghs-highlight"), function(el) {
            el.classList.remove("ghs-highlight");
        });
        [].forEach.call(document.querySelectorAll(".ghs-partial-highlight"), function(el) {
            el.parentNode.replaceChild(el.childNodes[0], el);
        });
    }

    function replaceAll(str, target, replacement) {
        return str.split(target).join(replacement);
    }

    document.body.addEventListener('mouseup', function(e) {
        restore();
        var selection = window.getSelection().toString().trim();

        if (selection) {
            textNodes.forEach(function(el) {
                if (el != e.target) {
                    if (el.textContent == selection) {
                        el.classList.add("ghs-highlight");
                    } else if (el.textContent.indexOf(selection) > -1) {
                        el.innerHTML = replaceAll(el.innerHTML, selection, '<span class="ghs-partial-highlight">' + selection + '</span>');
                    }
                }
            });
        }
    });
})();